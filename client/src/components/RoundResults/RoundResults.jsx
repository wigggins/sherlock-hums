import React from 'react';
import { usePlayers } from '../../hooks/usePlayers';
import { avatarColors } from '../../utils/constants';

export const RoundResults = ({ results, handleNextRound, isHost, isGameComplete }) => {
  const { players } = usePlayers();

  // sort scores descending
  const sorted = [...results.scores].sort((a, b) => b.score - a.score);

  // get max score
  const maxScore = sorted.length ? sorted[0].score : 1;

  return (
    <div style={{ width: '100%', maxWidth: 600, margin: '0 auto' }}>
      {sorted.map((ps) => {
        // find player avatar color
        const player = players.find((p) => p.user_id == ps.user_id);
        const barColor = avatarColors[player?.avatar_color] || '#4caf50';

        const pct = (ps.score / maxScore) * 100;

        return (
          <div
            key={ps.user_id}
            style={{
              display: 'flex',
              alignItems: 'center',
              margin: '8px 0',
            }}
          >
            <div style={{ width: 120 }}>{ps.username}</div>
            <div
              style={{
                flex: 1,
                height: 16,
                backgroundColor: '#eee',
                borderRadius: 8,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: '100%',
                  backgroundColor: barColor,
                  transition: 'width 0.5s ease',
                }}
              />
            </div>

            <div style={{ width: 40, textAlign: 'right', marginLeft: 8 }}>
              {ps.score}
            </div>
          </div>
        );
      })}

      {isHost && !isGameComplete && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button onClick={handleNextRound}>Next Round</button>
        </div>
      )}
    </div>
  );
};
