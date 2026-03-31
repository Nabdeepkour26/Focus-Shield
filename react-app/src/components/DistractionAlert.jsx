import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DistractionAlert = ({ awayTime, onAcknowledge }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (awayTime > 0) {
      setShow(true);
    }
  }, [awayTime]);

  const handleAcknowledge = () => {
    setShow(false);
    onAcknowledge();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="modal-content"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
          >
            <h2>Distraction Detected!</h2>
            <p>You were distracted for {awayTime} seconds.</p>
            <button className="btn" onClick={handleAcknowledge}>I Understand</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DistractionAlert;