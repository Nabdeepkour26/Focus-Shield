import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatTime } from '../utils/helpers';
import { PERSONAS, FOCUS_DURATIONS } from '../utils/constants';

const FocusMode = ({ isActive, onExit, timeLeft, progress, message, onStart, duration, setDuration }) => {
  const [persona, setPersona] = useState('Friendly');
  const [showExitModal, setShowExitModal] = useState(false);
  const [exitCountdown, setExitCountdown] = useState(5);

  useEffect(() => {
    if (showExitModal && exitCountdown > 0) {
      const timer = setTimeout(() => setExitCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (exitCountdown === 0) {
      onExit();
      setShowExitModal(false);
      setExitCountdown(5);
    }
  }, [showExitModal, exitCountdown, onExit]);

  const handleExitAttempt = () => {
    setShowExitModal(true);
  };

  const cancelExit = () => {
    setShowExitModal(false);
    setExitCountdown(5);
  };

  if (!isActive) {
    return (
      <div className="main-content animate-slide">
        <h1 style={{ marginBottom: '2rem' }}>Focus Shield – Auto Discipline System</h1>
        <div style={{ maxWidth: '500px' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label>Duration (minutes): </label>
            <input
              type="number"
              value={duration / 60}
              onChange={(e) => {
                const minutes = parseInt(e.target.value);
                if (minutes >= 1 && minutes <= 300) {
                  setDuration(minutes * 60);
                }
              }}
              min="1"
              max="300"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label>Quick Select:</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {Object.entries(FOCUS_DURATIONS).map(([key, value]) => (
                <button
                  key={key}
                  className="btn"
                  onClick={() => setDuration(value)}
                  style={{
                    opacity: duration === value ? 1 : 0.7,
                    backgroundColor: duration === value ? '#00d4ff' : '#007bff',
                    color: duration === value ? '#000' : '#fff',
                    fontWeight: duration === value ? 'bold' : 'normal'
                  }}
                >
                  {key.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label>Persona: </label>
            <select value={persona} onChange={(e) => setPersona(e.target.value)}>
              {Object.keys(PERSONAS).map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <button className="btn" onClick={onStart} style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
            Start Focus Mode
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="focus-mode"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div style={{ textAlign: 'center', zIndex: 999 }}>
        <motion.h1
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          Focus Mode Active
        </motion.h1>

        <motion.div
          className="timer-display"
          key={timeLeft}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
        >
          {formatTime(timeLeft)}
        </motion.div>

        <svg width="200" height="200" style={{ margin: '2rem auto', display: 'block' }}>
          <circle cx="100" cy="100" r="90" fill="none" stroke="#333" strokeWidth="4" />
          <motion.circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="#00d4ff"
            strokeWidth="4"
            strokeDasharray="565.48"
            initial={{ strokeDashoffset: 565.48 }}
            animate={{ strokeDashoffset: 565.48 * (1 - progress / 100) }}
            strokeLinecap="round"
            transform="rotate(-90 100 100)"
          />
        </svg>

        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#00d4ff' }}>{message}</p>

        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.9rem', color: '#aaa' }}>Progress: {Math.round(progress)}%</p>
        </div>

        <button
          className="btn btn-danger"
          onClick={handleExitAttempt}
          style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
        >
          Exit Focus Mode
        </button>
      </div>

      {showExitModal && (
        <div className="exit-modal">
          <motion.div
            className="exit-modal-content"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h2>Hold On!</h2>
            <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
              {PERSONAS[persona].exitMessage}
            </p>
            <div className="exit-countdown">
              Exiting in: {exitCountdown}s
            </div>
            <button
              className="btn"
              onClick={cancelExit}
              style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}
            >
              Keep Going!
            </button>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default FocusMode;