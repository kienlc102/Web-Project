const amqp = require('amqplib');
const config = require('../config');
const emailService = require('../services/emailService');

class UserCreatedConsumer {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.queueName = 'email-service.user-created';
  }

  async connect() {
    try {
      this.connection = await amqp.connect(config.rabbitmq.url);
      this.channel = await this.connection.createChannel();

      await this.channel.assertExchange(config.rabbitmq.exchange, 'topic', { durable: true });
      await this.channel.assertQueue(this.queueName, { durable: true });
      
      // Bind to UserCreated event
      await this.channel.bindQueue(
        this.queueName,
        config.rabbitmq.exchange,
        'iam.user.created'
      );

      console.log('✅ UserCreated consumer connected');
    } catch (error) {
      console.error('❌ Failed to connect UserCreated consumer:', error.message);
      throw error;
    }
  }

  async start() {
    if (!this.channel) {
      await this.connect();
    }

    console.log(`👂 Listening for UserCreated events on queue: ${this.queueName}`);

    this.channel.consume(this.queueName, async (msg) => {
      if (!msg) return;

      try {
        const event = JSON.parse(msg.content.toString());
        console.log('📨 Received UserCreated event:', event.eventId);

        const { userId, username, email, role } = event.payload;

        // Send welcome email
        await emailService.sendWelcomeEmail(email, username);

        // If email verification is enabled, send verification email
        if (event.payload.verificationToken) {
          await emailService.sendVerificationEmail(
            email,
            username,
            event.payload.verificationToken
          );
        }

        this.channel.ack(msg);
        console.log('✅ UserCreated event processed successfully');
      } catch (error) {
        console.error('❌ Error processing UserCreated event:', error.message);
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

module.exports = UserCreatedConsumer;
