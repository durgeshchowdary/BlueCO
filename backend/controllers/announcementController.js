const Announcement = require('../models/Announcement');
const { getPagination, paginatedResponse } = require('../utils/pagination');
const { scopedFilter, scopedPayload } = require('../utils/scope');

const decorateAnnouncement = (announcement) => {
  const item = announcement.toObject ? announcement.toObject() : announcement;
  const urgent = item.priority === 'Urgent';

  return {
    ...item,
    id: item._id.toString(),
    iconStyle: urgent ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700',
    dotStyle: item.read ? 'bg-slate-300' : urgent ? 'bg-red-500' : 'bg-blue-500',
  };
};

const getAnnouncements = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const [announcements, total] = await Promise.all([
      Announcement.find(scopedFilter(req)).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Announcement.countDocuments(scopedFilter(req)),
    ]);

    res.json(
      paginatedResponse({
        data: announcements.map(decorateAnnouncement),
        total,
        page,
        limit,
      }),
    );
  } catch (error) {
    next(error);
  }
};

const createAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.create({
      ...scopedPayload(req, req.body),
      type: req.body.type || req.body.audience || 'General',
      priority: req.body.priority || 'Normal',
      time: req.body.time || 'Just now',
    });

    res.status(201).json(decorateAnnouncement(announcement));
  } catch (error) {
    next(error);
  }
};

const updateAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findOneAndUpdate(scopedFilter(req, { _id: req.params.id }), scopedPayload(req, req.body), {
      new: true,
      runValidators: true,
    });

    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });
    res.json(decorateAnnouncement(announcement));
  } catch (error) {
    next(error);
  }
};

const markAllRead = async (req, res, next) => {
  try {
    await Announcement.updateMany(scopedFilter(req, { read: false }), { read: true });
    res.json({ message: 'All announcements marked as read' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  markAllRead,
};
