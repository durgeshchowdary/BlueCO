import Notification from '../models/Notification.js';
import EmailLog from '../models/EmailLog.js';
import WhatsAppLog from '../models/WhatsAppLog.js';
import { scopedFilter } from '../utils/scope.js';

const getNotifications = async (req, res, next) => {
  try {
    const filter = scopedFilter(req);
    if (req.query.category) filter.category = req.query.category;
    if (req.query.unread === 'true') filter.readAt = null;

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(req.query.limit || 30), 100))
      .lean();
    const unreadCount = await Notification.countDocuments({ ...scopedFilter(req), readAt: null });
    res.json({ data: notifications, unreadCount });
  } catch (error) {
    next(error);
  }
};

const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      scopedFilter(req, { _id: req.params.id }),
      { $set: { readAt: new Date() } },
      { new: true },
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json(notification);
  } catch (error) {
    next(error);
  }
};

const markAllNotificationsRead = async (req, res, next) => {
  try {
    const result = await Notification.updateMany(scopedFilter(req, { readAt: null }), {
      $set: { readAt: new Date() },
    });
    res.json({ modified: result.modifiedCount });
  } catch (error) {
    next(error);
  }
};

const getCommunicationLogs = async (req, res, next) => {
  try {
    const [emails, whatsapp] = await Promise.all([
      EmailLog.find(scopedFilter(req)).sort({ createdAt: -1 }).limit(50).lean(),
      WhatsAppLog.find(scopedFilter(req)).sort({ createdAt: -1 }).limit(50).lean(),
    ]);
    res.json({ emails, whatsapp });
  } catch (error) {
    next(error);
  }
};

export {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getCommunicationLogs,
};
