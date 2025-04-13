import React, { useState, useEffect } from 'react';

export const CountdownProgressBar = ({ duration = 60, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onComplete) onComplete(); // fire callback on complete
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [duration, onComplete]);

  const percentage = (timeLeft / duration) * 100;

  return (
    <div style={styles.container}>
      <div style={{ ...styles.bar, width: `${percentage}%` }}></div>
      <div style={styles.label}>{timeLeft}s</div>
    </div>
  );
};

const styles = {
  container: {
    position: 'relative',
    width: '100%',
    height: '20px',
    backgroundColor: '#ddd',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  bar: {
    position: 'absolute',
    top: 0,
    right: 0, // bar shrinks from right to left
    height: '100%',
    backgroundColor: '#4caf50',
    transition: 'width 1s linear'
  },
  label: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    fontSize: '0.8rem',
    lineHeight: '20px',
    color: '#333'
  }
};

export default CountdownProgressBar;