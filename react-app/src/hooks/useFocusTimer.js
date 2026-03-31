import { useState, useEffect, useCallback } from 'react';
import { getMotivationalMessage } from '../utils/helpers';
import { STORAGE_KEYS } from '../utils/constants';

const useFocusTimer = (onComplete, onEarlyExit) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [earlyExits, setEarlyExits] = useState(0);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.FOCUS_STATS) || '{}');
    setCompletedSessions(saved.completed || 0);
    setEarlyExits(saved.exits || 0);
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.FOCUS_STATS,
      JSON.stringify({ completed: completedSessions, exits: earlyExits })
    );
  }, [completedSessions, earlyExits]);

  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      onComplete();
      setCompletedSessions(prev => prev + 1);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onComplete]);

  const startTimer = (duration) => {
    setTotalTime(duration);
    setTimeLeft(duration);
    setIsRunning(true);
  };

  const stopTimer = useCallback(() => {
    setIsRunning(false);
    if (timeLeft > 0) {
      onEarlyExit();
      setEarlyExits(prev => prev + 1);
    }
  }, [timeLeft, onEarlyExit]);

  const getProgress = () => {
    return totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;
  };

  return {
    timeLeft,
    isRunning,
    startTimer,
    stopTimer,
    progress: getProgress(),
    message: getMotivationalMessage(timeLeft),
    stats: { completedSessions, earlyExits }
  };
};

export default useFocusTimer;