import Batch from '../models/Batch.js';

const dayAliases = {
  mon: 'monday',
  tue: 'tuesday',
  tues: 'tuesday',
  wed: 'wednesday',
  thu: 'thursday',
  thur: 'thursday',
  fri: 'friday',
  sat: 'saturday',
  sun: 'sunday',
};

const normalize = (value = '') => String(value).trim().toLowerCase();

const parseMinutes = (value = '') => {
  const match = String(value).trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2] || 0);
  const meridian = match[3]?.toLowerCase();
  if (meridian === 'pm' && hour < 12) hour += 12;
  if (meridian === 'am' && hour === 12) hour = 0;
  if (hour > 23 || minute > 59) return null;
  return hour * 60 + minute;
};

const parseTiming = (timing = '') => {
  const lower = normalize(timing);
  const dayTokens = Object.entries(dayAliases)
    .filter(([token]) => new RegExp(`\\b${token}\\b`).test(lower))
    .map(([, day]) => day);
  const days = [...new Set(dayTokens)];
  const timeMatches = lower.match(/\d{1,2}(?::\d{2})?\s*(?:am|pm)?/g) || [];
  const start = parseMinutes(timeMatches[0]);
  const end = parseMinutes(timeMatches[1]);
  return {
    raw: timing,
    days,
    start,
    end: end && start && end <= start ? end + 24 * 60 : end,
  };
};

const overlaps = (left, right) => {
  if (left.start === null || left.end === null || right.start === null || right.end === null) return false;
  const sharedDays = !left.days.length || !right.days.length || left.days.some((day) => right.days.includes(day));
  return sharedDays && left.start < right.end && right.start < left.end;
};

const detectBatchConflicts = async ({ academyId, batch, excludeBatchId = null }) => {
  const candidateTiming = parseTiming(batch.timing);
  const existingBatches = await Batch.find({
    academyId,
    ...(excludeBatchId ? { _id: { $ne: excludeBatchId } } : {}),
  }).lean();

  return existingBatches.flatMap((existing) => {
    const existingTiming = parseTiming(existing.timing);
    const sameTime = overlaps(candidateTiming, existingTiming);
    const sameCoach = normalize(existing.coachName) && normalize(existing.coachName) === normalize(batch.coachName);
    const sameVenue = normalize(existing.venue || existing.location) && normalize(existing.venue || existing.location) === normalize(batch.venue || batch.location);
    const duplicateName = normalize(existing.name) === normalize(batch.name);
    const duplicateBooking = sameTime && duplicateName && normalize(existing.sport) === normalize(batch.sport);

    const warnings = [];
    if (sameTime && sameCoach) {
      warnings.push({
        severity: 'high',
        type: 'coach_overlap',
        batchId: existing._id,
        message: `${batch.coachName} already has ${existing.name} during ${existing.timing}.`,
        recommendation: 'Move this session outside the existing coach window or assign a different coach.',
      });
    }
    if (sameTime && sameVenue) {
      warnings.push({
        severity: 'high',
        type: 'venue_overlap',
        batchId: existing._id,
        message: `Venue is already booked by ${existing.name} during ${existing.timing}.`,
        recommendation: 'Choose a different venue or shift one batch by at least 30 minutes.',
      });
    }
    if (sameTime && normalize(existing.sport) === normalize(batch.sport)) {
      warnings.push({
        severity: 'medium',
        type: 'batch_overlap',
        batchId: existing._id,
        message: `${existing.name} has an overlapping ${existing.sport} timing.`,
        recommendation: 'Review capacity, coach availability, and session spacing.',
      });
    }
    if (duplicateBooking) {
      warnings.push({
        severity: 'critical',
        type: 'duplicate_training_booking',
        batchId: existing._id,
        message: `${batch.name} appears to duplicate an existing training booking.`,
        recommendation: 'Cancel this create/update or merge attendees into the existing batch.',
      });
    }
    return warnings;
  });
};

export {
  detectBatchConflicts,
  parseTiming,
  overlaps,
};
