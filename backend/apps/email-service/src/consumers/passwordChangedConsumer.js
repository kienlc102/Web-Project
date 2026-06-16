const amqp = require('amqplib');
const config = require('../config');
const emailService = require('../services/emailService');

class PasswordChangedConsumer {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.queueName = 'email-service.password-changed';
  }

  async connect() {
    try {
      this.connection = await amqp.connect(config.rabbitmq.url);
      this.channel = await this.connection.createChannel();

      await this.channel.assertExchange(config.rabbitmq.exchange, 'topic', { durable: true });
      await this.channel.assertQueue(this.queueName, { durable: true });
      
      // Bind to PasswordChanged event
      await this.channel.bindQueue(
        this.queueName,
        config.rabbitmq.exchange,
        'iam.password.changed'
      );

      console.log('✅ PasswordChanged consumer connected');
    } catch (error) {
      console.error('❌ Failed to connect PasswordChanged consumer:', error.message);
      throw error;
    }
  }

  async start() {
    if (!this.channel) {
      await this.connect();
    }

    console.log(`👂 Listening for PasswordChanged events on queue: ${this.queueName}`);

    this.channel.consume(this.queueName, async (msg) => {
      if (!msg) return;

      try {
        const event = JSON.parse(msg.content.toString());
        console.log('📨 Received PasswordChanged event:', event.eventId);

        const { userId, username, email } = event.payload;

        // Send password changed notification email
        await emailService.sendPasswordChangedEmail(email, username);

        this.channel.ack(msg);
        console.log('✅ PasswordChanged event processed successfully');
      } catch (error) {
        console.error('❌ Error processing PasswordChanged event:', error.message);
        this.channel.nack(msg, false, true);
      }
    });
  }

  async close() {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
  }
}

module.exports = PasswordChangedConsumer;
