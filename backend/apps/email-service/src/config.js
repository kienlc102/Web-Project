require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3004,
  
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  },
  
  email: {
    from: process.env.EMAIL_FROM || 'noreply@shop.com',
    fromName: process.env.EMAIL_FROM_NAME || 'Shop System'
  },
  
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    exchange: process.env.RABBITMQ_EXCHANGE || 'cnweb.events'
  },
  
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:8080'
  },
  
  iam: {
    baseUrl: process.env.IAM_BASE_URL || 'http://iam-service:3001'
  },
  
  ordering: {
    baseUrl: process.env.ORDERING_BASE_URL || 'http://ordering-service:8083'
  }
};
