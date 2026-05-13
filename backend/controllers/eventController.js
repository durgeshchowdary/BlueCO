import Event from '../models/Event.js';
import { getPagination, paginatedResponse } from '../utils/pagination.js';
import { scopedFilter, scopedPayload } from '../utils/scope.js';

const normalizeEventPayload = (payload) => {
  const date = payload.date || payload.startDate;
  const location = payload.location || payload.venue;

  return {
    ...payload,
    sport: payload.sport || payload.type || 'Multi-sport',
    type: payload.type || payload.sport || 'Tournament',
    date: date ? new Date(date) : undefined,
    startDate: payload.startDate ? new Date(payload.startDate) : date ? new Date(date) : undefined,
    endDate: payload.endDate ? new Date(payload.endDate) : undefined,
    location: location || 'TBD',
    venue: payload.venue || location || 'TBD',
    entryFee: Number(payload.entryFee || 0),
    maxParticipants: Number(payload.maxParticipants || 0),
    description: payload.description || '',
  };
};

const getEvents = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const [events, total] = await Promise.all([
      Event.find(scopedFilter(req)).sort({ date: 1 }).skip(skip).limit(limit).lean(),
      Event.countDocuments(scopedFilter(req)),
    ]);

    res.json(paginatedResponse({ data: events, total, page, limit }));
  } catch (error) {
    next(error);
  }
};

const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findOne(scopedFilter(req, { _id: req.params.id })).lean();
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    next(error);
  }
};

const createEvent = async (req, res, next) => {
  try {
    const event = new Event(scopedPayload(req, normalizeEventPayload(req.body)));
    const saved = await event.save();
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    const updated = await Event.findOneAndUpdate(scopedFilter(req, { _id: req.params.id }), scopedPayload(req, normalizeEventPayload(req.body)), {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: 'Event not found' });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    const deleted = await Event.findOneAndDelete(scopedFilter(req, { _id: req.params.id }));
    if (!deleted) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event removed' });
  } catch (error) {
    next(error);
  }
};

export {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
