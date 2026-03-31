// Helper functions for Focus Shield

/**
 * Format time in seconds to MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

/**
 * Get discipline status based on score
 * @param {number} score - Current score (0-100)
 * @returns {string} Status label
 */
export const getDisciplineStatus = (score) => {
  if (score >= 80) return 'Highly Disciplined';
  if (score >= 50) return 'Inconsistent';
  return 'Needs Control';
};

/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export const clamp = (value, min, max) => {
  return Math.max(min, Math.min(max, value));
};

/**
 * Calculate progress percentage
 * @param {number} current - Current value
 * @param {number} total - Total value
 * @returns {number} Progress percentage (0-100)
 */
export const getProgress = (current, total) => {
  return total > 0 ? (current / total) * 100 : 0;
};

/**
 * Get motivational message based on time left
 * @param {number} timeLeft - Time left in seconds
 * @returns {string} Motivational message
 */
export const getMotivationalMessage = (timeLeft) => {
  if (timeLeft <= 300) return `Only ${Math.floor(timeLeft / 60)} minutes left. Don't break now.`;
  if (timeLeft <= 600) return 'Keep pushing! You\'re making progress.';
  if (timeLeft <= 900) return 'Stay focused! You\'re doing great.';
  return 'Get started and lock in!';
};

/**
 * Validate input values
 * @param {number} value - Value to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {boolean} Is valid
 */
export const validateDuration = (value, min = 1, max = 300) => {
  const num = parseInt(value);
  return !isNaN(num) && num >= min && num <= max;
};

/**
 * Format milliseconds to readable time difference
 * @param {number} ms - Milliseconds
 * @returns {string} Readable format
 */
export const formatTimeDifference = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
};
