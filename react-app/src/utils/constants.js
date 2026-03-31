// Focus Shield Constants

export const FOCUS_DURATIONS = {
  POMODORO: 1500,      // 25 minutes
  SHORT_BREAK: 300,    // 5 minutes
  LONG_BREAK: 900,     // 15 minutes
  DEEP_WORK: 3600,     // 60 minutes
};

export const SCORE_CHANGES = {
  COMPLETED_SESSION: 10,
  COMPLETED_TASK: 5,
  EARLY_EXIT: -15,
  DISTRACTION: -5,
};

export const DISCIPLINE_STATUS = {
  HIGHLY_DISCIPLINED: 'Highly Disciplined',
  INCONSISTENT: 'Inconsistent',
  NEEDS_CONTROL: 'Needs Control',
};

export const STATUS_THRESHOLDS = {
  HIGHLY_DISCIPLINED: 80,
  INCONSISTENT: 50,
};

export const PERSONAS = {
  Strict: {
    exitMessage: "You will regret this decision.",
    completeMessage: "Well done, but don't get complacent."
  },
  Friendly: {
    exitMessage: "Come on, you can do it! Don't give up now.",
    completeMessage: "Great job! Keep it up!"
  },
  Military: {
    exitMessage: "Soldier, hold the line! Discipline is key.",
    completeMessage: "Mission accomplished, soldier."
  }
};

export const STORAGE_KEYS = {
  DISCIPLINE_SCORE: 'disciplineScore',
  FOCUS_STATS: 'focusStats',
  USER_PREFERENCES: 'userPreferences',
};

export const DISTRACTION_THRESHOLD = 0; // Alert on any distraction
