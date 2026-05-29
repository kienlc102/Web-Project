const express = require('express');
const cors = require('cors');
const config = require('./config');
const { getPool } = require('./db/postgres');
const notificationsRouter = require('./routes/notifications');
const preferencesRouter = require('./routes/preferences');
const internalRouter = require('./routes/internal');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors({
  origin: config.cors.allowedOrigins,
  credentials: true,
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    service: 'notification-service',
    message: 'Notification service is running',
    endpoints: {
      health: '/health',
      notifications: '/api/v1/notifications',
      preferences: '/api/v1/preferences',
      internal: '/api/v1/internal',
    },
  });
});

app.get('/health', async (req, res) => {
  try {
    await getPool().query('SELECT 1');
    res.json({
      service: 'notification-service',
      status: 'ok',
      db: 'ok',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      service: 'notification-service',
      status: 'error',
      db: 'unreachable',
      timestamp: new Date().toISOString(),
    });
  }
});

app.use('/api/v1/notifications', notificationsRouter);
app.use('/api/v1/preferences', preferencesRouter);
app.use('/api/v1/internal', internalRouter);

app.use(errorHandler);

module.exports = app;
