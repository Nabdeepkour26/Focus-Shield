import { useState, useEffect } from 'react';

const useDistractionDetection = (onDistraction) => {
  const [awayTime, setAwayTime] = useState(0);
  const [lastHidden, setLastHidden] = useState(null);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setLastHidden(Date.now());
      } else if (lastHidden) {
        const timeAway = Math.floor((Date.now() - lastHidden) / 1000);
        setAwayTime(timeAway);
        onDistraction(timeAway);
        setLastHidden(null);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [lastHidden, onDistraction]);

  return { awayTime };
};

export default useDistractionDetection;