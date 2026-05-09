const DemoRequest = require('../models/DemoRequest');

const createDemoRequest = async (req, res, next) => {
  try {
    const demoRequest = await DemoRequest.create(req.body);
    res.status(201).json(demoRequest);
  } catch (error) {
    next(error);
  }
};

const getDemoRequests = async (req, res, next) => {
  try {
    const requests = await DemoRequest.find().sort({ createdAt: -1 }).lean();
    res.json(requests);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDemoRequest,
  getDemoRequests
};
