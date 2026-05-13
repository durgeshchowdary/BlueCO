import AIInsight from '../models/AIInsight.js';
import { scopedFilter } from '../utils/scope.js';
import { generateAcademyInsights } from '../services/aiInsightService.js';

const getInsights = async (req, res, next) => {
  try {
    const filter = scopedFilter(req);
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;
    const insights = await AIInsight.find(filter).sort({ generatedAt: -1 }).limit(50).lean();
    res.json(insights);
  } catch (error) {
    next(error);
  }
};

const generateInsights = async (req, res, next) => {
  try {
    const academyId = req.user?.academyId || req.body?.academyId;
    if (!academyId) return res.status(400).json({ message: 'academyId is required' });
    const insights = await generateAcademyInsights(academyId);
    res.status(201).json({ generated: insights.length, insights });
  } catch (error) {
    next(error);
  }
};

const updateInsightStatus = async (req, res, next) => {
  try {
    const status = ['open', 'acknowledged', 'resolved'].includes(req.body.status) ? req.body.status : null;
    if (!status) return res.status(400).json({ message: 'Invalid insight status' });
    const insight = await AIInsight.findOneAndUpdate(
      scopedFilter(req, { _id: req.params.id }),
      { $set: { status, resolvedAt: status === 'resolved' ? new Date() : null } },
      { new: true },
    );
    if (!insight) return res.status(404).json({ message: 'Insight not found' });
    res.json(insight);
  } catch (error) {
    next(error);
  }
};

export {
  getInsights,
  generateInsights,
  updateInsightStatus,
};
