import test from 'node:test';
import assert from 'node:assert/strict';

import { backoffMs } from '../services/jobRunner.js';
import { parseTiming, overlaps } from '../services/scheduleConflictService.js';
import * as deliveryReliability from '../services/deliveryReliabilityService.js';
import * as observability from '../services/observabilityService.js';

test('scheduler backoff grows exponentially and caps safely', () => {
  assert.equal(backoffMs(1, 1000, 10000), 1000);
  assert.equal(backoffMs(2, 1000, 10000), 2000);
  assert.equal(backoffMs(10, 1000, 10000), 10000);
});

test('delivery retry backoff uses provider-safe exponential windows', () => {
  assert.equal(deliveryReliability.backoffMs(1), 60 * 1000);
  assert.equal(deliveryReliability.backoffMs(3), 4 * 60 * 1000);
  assert.equal(deliveryReliability.backoffMs(20), 60 * 60 * 1000);
});

test('session timing parser handles common academy schedule strings', () => {
  const timing = parseTiming('Mon Wed 6:00 PM - 7:30 PM');
  assert.deepEqual(timing.days, ['monday', 'wednesday']);
  assert.equal(timing.start, 18 * 60);
  assert.equal(timing.end, 19 * 60 + 30);
});

test('conflict overlap detects shared day and time collision', () => {
  const left = parseTiming('Tue 7:00 AM - 8:00 AM');
  const right = parseTiming('Tuesday 7:30 AM - 8:30 AM');
  assert.equal(overlaps(left, right), true);
});

test('conflict overlap ignores separate training windows', () => {
  const left = parseTiming('Fri 7:00 AM - 8:00 AM');
  const right = parseTiming('Friday 9:00 AM - 10:00 AM');
  assert.equal(overlaps(left, right), false);
});

test('stuck Twilio detector extracts provider codes', () => {
  assert.equal(observability.extractTwilioCode('Twilio WhatsApp failed with 63016'), '63016');
  assert.equal(observability.extractTwilioCode('provider code=30007'), '30007');
});
