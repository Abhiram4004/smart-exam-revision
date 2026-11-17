/**
 * SM-2 Spaced Repetition Algorithm
 *
 * @param {number} quality - Quality of response (0-5)
 *   0-1 = Again (complete blackout / wrong)
 *   2   = Hard (recalled with serious difficulty)
 *   3   = Good (recalled with some difficulty)
 *   4-5 = Easy (recalled perfectly)
 * @param {number} repetitions - Current repetition count
 * @param {number} easiness - Current easiness factor (EF >= 1.3)
 * @param {number} interval - Current interval in days
 * @returns {{ repetitions, easiness, interval, nextReview }}
 */
const sm2Algorithm = (quality, repetitions, easiness, interval) => {
  let newRepetitions = repetitions;
  let newEasiness = easiness;
  let newInterval = interval;

  if (quality >= 3) {
    // Correct response
    if (newRepetitions === 0) {
      newInterval = 1;
    } else if (newRepetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(newInterval * newEasiness);
    }
    newRepetitions += 1;
  } else {
    // Incorrect response - reset
    newRepetitions = 0;
    newInterval = 1;
  }

  // Update easiness factor
  newEasiness = newEasiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  newEasiness = Math.max(1.3, newEasiness);

  // Calculate next review date
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);

  return {
    repetitions: newRepetitions,
    easiness: parseFloat(newEasiness.toFixed(2)),
    interval: newInterval,
    nextReview
  };
};

module.exports = sm2Algorithm;
