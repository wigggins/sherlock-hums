import React, { useState, useEffect } from 'react';

export const CountdownProgressBar = ({ duration = 60 }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [duration]);

  const percentage = (timeLeft / duration) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="countdown-container">
      <div className="countdown-text">
        {timeLeft > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : "TIME'S UP!"}
      </div>
      
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      
      <div className="text-center mt-4 font-bold text-lg uppercase">
        {timeLeft > 10 ? "🎵 LISTENING TIME" : timeLeft > 0 ? "⚡ FINAL SECONDS" : "⏰ VOTING CLOSED"}
      </div>
    </div>
  );
};

export default CountdownProgressBar;