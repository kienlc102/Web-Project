const express = require('express');
const config = require('./config');
const emailService = require('./services/emailService');
const UserCreatedConsumer = require('./consumers/userCreatedConsumer');
const PasswordChangedConsumer = require('./consumers/passwordChangedConsumer');
const PasswordResetConsumer = require('./consumers/passwordResetConsumer');
const OrderPlacedConsumer = require('./consumers/orderPlacedConsumer');
const DeliveryUpdatedConsumer = require('./consumers/deliveryUpdatedConsumer');

const app = express();
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'email-service',
    timestamp: new Date().toISOString()
  });
});

// Start server
async function start() {
  try {
    console.log('Starting Email Service...');

    // Test SMTP connection
    const isConnected = await emailService.testConnection();
    if (!isConnected) {
      console.warn('SMTP connection test failed. Emails may not be sent.');
    }

    // Initialize and start consumers
    const consumers = [
      new UserCreatedConsumer(),
      new PasswordChangedConsumer(),
      new PasswordResetConsumer(),
      new OrderPlacedConsumer(),
      new DeliveryUpdatedConsumer()
    ];

    for (const consumer of consumers) {
      await consumer.start();
    }

    // Start HTTP server
    app.listen(config.port, () => {
      console.log(`Email Service running on port ${config.port}`);
      console.log(`SMTP: ${config.smtp.host}:${config.smtp.port}`);
      console.log(`RabbitMQ: ${config.rabbitmq.url}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('Shutting down gracefully...');
      for (const consumer of consumers) {
        await consumer.close();
      }
      process.exit(0);
    });

  } catch (error) {
    console.error('Failed to start Email Service:', error);
    process.exit(1);
  }
}

start();
