const express = require('express');
const { z } = require('zod');
const store = require('../store/notificationStore');
const { attachIdentity, requireIdentity } = require('../middleware/auth');

const router = express.Router();

// Attach identity from bearer token when present; enforce it when NOTIFICATION_AUTH_REQUIRED=true
router.use(attachIdentity);
router.use(requireIdentity);

const listQuerySchema = z.object({
  userId: z.string().min(1),
  unreadOnly: z.string().optional(),
  skip: z.string().optional(),
  limit: z.string().optional(),
});

const userIdQuerySchema = z.object({
  userId: z.string().min(1),
});

// GET /notifications/count?userId=X  – lightweight unread badge count
router.get('/count', async (req, res, next) => {
  try {
    const query = userIdQuerySchema.parse(req.query);
    const userId = req.identity?.userId || query.userId;
    const counts = await store.countNotificationsByUser(userId);
    return res.json({ data: counts });
  } catch (err) {
    return next(err);
  }
});

// GET /notifications?userId=X[&unreadOnly=true][&skip=0&limit=20]
router.get('/', async (req, res, next) => {
  try {
    const query = listQuerySchema.parse(req.query);
    const unreadOnly = query.unreadOnly === 'true';
    const skip = Math.max(0, Number(query.skip || 0));
    const limit = Math.min(100, Math.max(1, Number(query.limit || 20)));
    const notifications = await store.listNotificationsByUser(query.userId, { unreadOnly, skip, limit });
    return res.json({ data: notifications });
  } catch (err) {
    return next(err);
  }
});

// PATCH /notifications/read-all?userId=X  – bulk mark all unread as read
router.patch('/read-all', async (req, res, next) => {
  try {
    const query = userIdQuerySchema.parse(req.query);
    const userId = req.identity?.userId || query.userId;
    const marked = await store.markAllNotificationsRead(userId);
    return res.json({ data: { marked } });
  } catch (err) {
    return next(err);
  }
});

// PATCH /notifications/:notificationId/read
router.patch('/:notificationId/read', async (req, res, next) => {
  try {
    const notification = await store.markNotificationRead(req.params.notificationId);
    if (!notification) {
      const err = new Error('Notification not found');
      err.status = 404;
      err.code = 'NOTIFICATION_NOT_FOUND';
      throw err;
    }
    return res.json({ data: notification });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
