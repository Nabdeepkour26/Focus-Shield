import React from 'react';
import { motion } from 'framer-motion';

const DisciplineScore = ({ score, status }) => {
  return (
    <div className="score-display">
      <motion.div
        className="score-circle"
        style={{ '--score': `${score}%` }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {score}
      </motion.div>
      <h3>{status}</h3>
    </div>
  );
};

export default DisciplineScore;