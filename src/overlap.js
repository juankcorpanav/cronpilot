/**
 * overlap.js — Detect scheduling overlaps and conflicts between cron expressions
 */

const { getNextFireTimes } = require('./timezone');

/**
 * Get N fire times for an expression as timestamps
 */
function getFireTimestamps(expression, timezone, count = 50) {
  const times = getNextFireTimes(expression, timezone, count);
  return times.map(t => new Date(t).getTime());
}

/**
 * Check if two expressions fire at the same time within a window
 * Returns array of overlapping times
 */
function findOverlaps(expressionA, expressionB, timezone = 'UTC', sampleSize = 50) {
  const timesA = new Set(getFireTimestamps(expressionA, timezone, sampleSize));
  const timesB = getFireTimestamps(expressionB, timezone, sampleSize);

  const overlaps = timesB.filter(t => timesA.has(t));
  return overlaps.map(t => new Date(t).toISOString());
}

/**
 * Check if two expressions ever overlap
 */
function hasOverlap(expressionA, expressionB, timezone = 'UTC', sampleSize = 50) {
  return findOverlaps(expressionA, expressionB, timezone, sampleSize).length > 0;
}

/**
 * Detect conflicts across a list of expressions
 * Returns pairs that overlap
 */
function detectConflicts(expressions, timezone = 'UTC', sampleSize = 50) {
  const conflicts = [];

  for (let i = 0; i < expressions.length; i++) {
    for (let j = i + 1; j < expressions.length; j++) {
      const overlaps = findOverlaps(expressions[i], expressions[j], timezone, sampleSize);
      if (overlaps.length > 0) {
        conflicts.push({
          a: expressions[i],
          b: expressions[j],
          overlapCount: overlaps.length,
          firstOverlap: overlaps[0],
          sample: overlaps.slice(0, 3)
        });
      }
    }
  }

  return conflicts;
}

/**
 * Summarize overlap analysis for a set of expressions
 */
function overlapReport(expressions, timezone = 'UTC') {
  const conflicts = detectConflicts(expressions, timezone);

  return {
    expressionCount: expressions.length,
    conflictCount: conflicts.length,
    hasConflicts: conflicts.length > 0,
    conflicts,
    summary: conflicts.length === 0
      ? 'No scheduling conflicts detected.'
      : `${conflicts.length} conflict(s) found among ${expressions.length} expressions.`
  };
}

module.exports = { findOverlaps, hasOverlap, detectConflicts, overlapReport };
