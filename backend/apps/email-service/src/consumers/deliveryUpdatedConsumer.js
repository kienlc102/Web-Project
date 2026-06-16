const amqp = require('amqplib');
const config = require('../config');
const emailService = require('../services/emailService');
const { getUserById } = require('../utils/iamClient');

/**
 * Fetch order info to get customerId
 */
async function getOrderInfo(orderId) {
  try {
    const orderingBaseUrl = config.ordering?.baseUrl || process.env.ORDERING_BASE_URL || 'http://ordering-service:8083';
    const url = `${orderingBaseUrl}/internal/orders/${orderId}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn(`⚠️ Ordering service returned ${response.status} for order ${orderId}`);
      return null;
    }
    
    const data = await response.json();
    return data?.data || null;
  } catch (error) {
    console.error(`❌ Failed to fetch order from ordering service (${orderId}):`, error.message);
    return null;
  }
}

class DeliveryUpdatedConsumer {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.queueName = 'email-service.delivery-updated';
  }

  async connect() {
    try {
      this.connection = await amqp.connect(config.rabbitmq.url);
      this.channel = await this.connection.createChannel();

      await this.channel.assertExchange(config.rabbitmq.exchange, 'topic', { durable: true });
      await this.channel.assertQueue(this.queueName, { durable: true });
      
      // Bind to multiple delivery events
      const routingKeys = [
        'fulfillment.seller_order_confirmed',
        'fulfillment.delivery_updated',
        'fulfillment.order_completed'
      ];

      for (const key of routingKeys) {
        await this.channel.bindQueue(
          this.queueName,
          config.rabbitmq.exchange,
          key
        );
      }

      console.log('✅ DeliveryUpdated consumer connected');
    } catch (error) {
      console.error('❌ Failed to connect DeliveryUpdated consumer:', error.message);
      throw error;
    }
  }

  async start() {
    if (!this.channel) {
      await this.connect();
    }

    console.log(`👂 Listening for Delivery events on queue: ${this.queueName}`);

    this.channel.consume(this.queueName, async (msg) => {
      if (!msg) return;

      try {
        const event = JSON.parse(msg.content.toString());
        console.log('📨 Received Delivery event:', event.eventId || event.eventName);

        const payload = event.payload || event.data || event;
        const orderId = payload.orderId;
        const status = payload.status;
        
        if (!orderId) {
          console.warn('⚠️ No orderId in delivery event, skipping email');
          this.channel.ack(msg);
          return;
        }

        // Only send email for significant status updates
        const notifiableStatuses = ['CONFIRMED', 'SHIPPED', 'DELIVERED', 'COMPLETED'];
        
        if (!notifiableStatuses.includes(status)) {
          console.log(`ℹ️ Status ${status} not notifiable, skipping email`);
          this.channel.ack(msg);
          return;
        }

        // Get customer email - try from event first, then fetch from order + IAM
        let customerEmail = payload.customerEmail;
        let customerName = payload.customerName || 'Khách hàng';
        let customerId = payload.customerId;
        
        if (!customerEmail) {
          console.log('📧 Email not in event, fetching order info...');
          
          // Get order to find customerId
          if (!customerId) {
            const order = await getOrderInfo(orderId);
            if (order) {
              customerId = order.userId;
            }
          }
          
          // Get user info from IAM
          if (customerId) {
            const user = await getUserById(customerId);
            if (user) {
              customerEmail = user.email;
              customerName = user.username || customerName;
            }
          }
        }

        if (!customerEmail) {
          console.warn(`⚠️ Cannot send delivery email: no email found for order ${orderId}`);
          this.channel.ack(msg);
          return;
        }

        const orderData = {
          customerName,
          orderId,
          trackingCode: payload.trackingCode || null,
          carrier: payload.carrier || null
        };

        await emailService.sendOrderStatusEmail(
          customerEmail,
          orderData,
          status
        );

        this.channel.ack(msg);
        console.log('✅ Delivery event processed successfully');
      } catch (error) {
        console.error('❌ Error processing Delivery event:', error.message);
        this.channel.nack(msg, false, true);
      }
    });
  }

  async close() {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
  }
}

module.exports = DeliveryUpdatedConsumer;
