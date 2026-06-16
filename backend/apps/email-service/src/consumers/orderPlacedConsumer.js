const amqp = require('amqplib');
const config = require('../config');
const emailService = require('../services/emailService');
const { getUserById } = require('../utils/iamClient');

class OrderPlacedConsumer {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.queueName = 'email-service.order-placed';
  }

  async connect() {
    try {
      this.connection = await amqp.connect(config.rabbitmq.url);
      this.channel = await this.connection.createChannel();

      await this.channel.assertExchange(config.rabbitmq.exchange, 'topic', { durable: true });
      await this.channel.assertQueue(this.queueName, { durable: true });
      
      // Bind to OrderPlaced event
      await this.channel.bindQueue(
        this.queueName,
        config.rabbitmq.exchange,
        'order.placed'
      );

      console.log('✅ OrderPlaced consumer connected');
    } catch (error) {
      console.error('❌ Failed to connect OrderPlaced consumer:', error.message);
      throw error;
    }
  }

  async start() {
    if (!this.channel) {
      await this.connect();
    }

    console.log(`👂 Listening for OrderPlaced events on queue: ${this.queueName}`);

    this.channel.consume(this.queueName, async (msg) => {
      if (!msg) return;

      try {
        const event = JSON.parse(msg.content.toString());
        console.log('📨 Received OrderPlaced event:', event.eventId);

        // Get customer email from event or fetch from IAM
        let customerEmail = event.payload.customerEmail;
        let customerName = event.payload.customerName || 'Khách hàng';
        
        // If email not in event, fetch from IAM using customerId
        if (!customerEmail && event.payload.customerId) {
          console.log('📧 Email not in event, fetching from IAM...');
          const user = await getUserById(event.payload.customerId);
          if (user) {
            customerEmail = user.email;
            customerName = user.username || customerName;
          }
        }

        const orderData = {
          customerName,
          customerEmail,
          orderId: event.payload.orderId,
          createdAt: event.payload.createdAt || event.timestamp,
          items: event.payload.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.lineTotal
          })),
          subtotal: event.payload.subtotal || event.payload.totals?.subtotal || event.payload.total,
          shippingFee: event.payload.shippingFee || event.payload.totals?.shippingFee || 0,
          total: event.payload.total || event.payload.totals?.total,
          shippingAddress: event.payload.shippingAddress,
          paymentMethod: event.payload.paymentMethod || 'COD'
        };

        // Send order confirmation email
        if (orderData.customerEmail) {
          await emailService.sendOrderConfirmationEmail(
            orderData.customerEmail,
            orderData
          );
        } else {
          console.warn('⚠️ Cannot send order email: no email found for customer', event.payload.customerId);
        }

        this.channel.ack(msg);
        console.log('✅ OrderPlaced event processed successfully');
      } catch (error) {
        console.error('❌ Error processing OrderPlaced event:', error.message);
        this.channel.nack(msg, false, true);
      }
    });
  }

  async close() {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
  }
}

module.exports = OrderPlacedConsumer;
