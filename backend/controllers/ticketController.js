const Ticket = require('../models/Ticket');
const { getPagination, paginatedResponse } = require('../utils/pagination');

const getTickets = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const [tickets, total] = await Promise.all([
      Ticket.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Ticket.countDocuments(),
    ]);

    res.json(paginatedResponse({ data: tickets, total, page, limit }));
  } catch (error) {
    next(error);
  }
};

const createTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.create(req.body);
    res.status(201).json(ticket);
  } catch (error) {
    next(error);
  }
};

const updateTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json(ticket);
  } catch (error) {
    next(error);
  }
};

const deleteTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);

    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json({ message: 'Ticket removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTickets,
  createTicket,
  updateTicket,
  deleteTicket,
};
