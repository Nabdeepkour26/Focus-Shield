import { useState, useEffect } from 'react';
import { clamp } from '../utils/helpers';
import { STORAGE_KEYS, DISCIPLINE_STATUS, STATUS_THRESHOLDS } from '../utils/constants';

const useDisciplineScore = () => {
  const [score, setScore] = useState(50);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DISCIPLINE_SCORE);
    if (saved) setScore(parseInt(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DISCIPLINE_SCORE, score);
  }, [score]);

  const updateScore = (change) => {
    setScore(prev => clamp(prev + change, 0, 100));
  };

  const getStatus = () => {
    if (score >= STATUS_THRESHOLDS.HIGHLY_DISCIPLINED) {
      return DISCIPLINE_STATUS.HIGHLY_DISCIPLINED;
    }
    if (score >= STATUS_THRESHOLDS.INCONSISTENT) {
      return DISCIPLINE_STATUS.INCONSISTENT;
    }
    return DISCIPLINE_STATUS.NEEDS_CONTROL;
  };

  const resetScore = () => {
    setScore(50);
  };

  return { score, updateScore, status: getStatus(), resetScore };
};

export default useDisciplineScore;