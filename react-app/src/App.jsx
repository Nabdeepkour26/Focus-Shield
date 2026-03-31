import React, { useState } from 'react';
import { motion } from 'framer-motion';
import FocusMode from './components/FocusMode';
import DisciplineScore from './components/DisciplineScore';
import DistractionAlert from './components/DistractionAlert';
import ErrorBoundary from './components/ErrorBoundary';
import useDisciplineScore from './hooks/useDisciplineScore';
import useDistractionDetection from './hooks/useDistractionDetection';
import useFocusTimer from './hooks/useFocusTimer';

function App() {
  const { score, updateScore, status } = useDisciplineScore();
  const [focusDuration, setFocusDuration] = useState(1500); // 25 min
  const [inFocusMode, setInFocusMode] = useState(false);

  const handleComplete = () => {
    updateScore(10);
    setInFocusMode(false);
  };

  const handleEarlyExit = () => {
    updateScore(-15);
    setInFocusMode(false);
  };

  const handleDistraction = (timeAway) => {
    updateScore(-5);
  };

  const { timeLeft, isRunning, startTimer, stopTimer, progress, message, stats } = useFocusTimer(handleComplete, handleEarlyExit);

  const { awayTime } = useDistractionDetection(handleDistraction);

  const startFocus = () => {
    setInFocusMode(true);
    startTimer(focusDuration);
  };

  const exitFocus = () => {
    stopTimer();
  };

  return (
    <ErrorBoundary>
      <div className="app">
        <DistractionAlert awayTime={awayTime} onAcknowledge={() => {}} />
        <FocusMode
          isActive={inFocusMode}
          onExit={exitFocus}
          timeLeft={timeLeft}
          progress={progress}
          message={message}
          onStart={startFocus}
          duration={focusDuration}
          setDuration={setFocusDuration}
        />
        {!inFocusMode && (
          <motion.div
            className="main-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <DisciplineScore score={score} status={status} />
            <div>
              <h3>Stats</h3>
              <p>Completed Sessions: {stats.completedSessions}</p>
              <p>Early Exits: {stats.earlyExits}</p>
            </div>
          </motion.div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;