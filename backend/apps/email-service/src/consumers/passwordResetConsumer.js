const amqp = require('amqplib');
const config = require('../config');
const emailService = require('../services/emailService');

class PasswordResetConsumer {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.queueName = 'email-service.password-reset';
  }

  async connect() {
    try {
      this.connection = await amqp.connect(config.rabbitmq.url);
      this.channel = await this.connection.createChannel();

      await this.channel.assertExchange(config.rabbitmq.exchange, 'topic', { durable: true });
      await this.channel.assertQueue(this.queueName, { durable: true });
      
      // Bind to PasswordResetRequested event
      await this.channel.bindQueue(
        this.queueName,
        config.rabbitmq.exchange,
        'iam.password.reset-requested'
      );

      console.log('✅ PasswordResetRequested consumer connected');
    } catch (error) {
      console.error('❌ Failed to connect PasswordResetRequested consumer:', error.message);
      throw error;
    }
  }

  async start() {
    if (!this.channel) {
      await this.connect();
    }

    console.log(`👂 Listening for PasswordResetRequested events on queue: ${this.queueName}`);

    this.channel.consume(this.queueName, async (msg) => {
      if (!msg) return;

      try {
        const event = JSON.parse(msg.content.toString());
        console.log('📨 Received PasswordResetRequested event:', event.eventId);

        const { userId, username, email, resetToken } = event.payload;

        // Send password reset email
        await emailService.sendPasswordResetEmail(email, username, resetToken);

        this.channel.ack(msg);
        console.log('✅ PasswordResetRequested event processed successfully');
      } catch (error) {
        console.error('❌ Error processing PasswordResetRequested event:', error.message);
        // Reject and requeue if it's a temporary error
        this.channel.nack(msg, false, true);
      }
    });
  }

  async close() {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
  }
}

module.exports = PasswordResetConsumer;
