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
    <div className="results-container">
      <h2 className="results-title text-center mb-8">
        🏆 ROUND RESULTS
      </h2>
      
      <div className="space-y-4 mb-8">
        {sorted.map((ps, index) => {
          // find player avatar color
          const player = players.find((p) => p.user_id == ps.user_id);
          const barColor = avatarColors[player?.avatar_color] || '#4caf50';
          const pct = (ps.score / maxScore) * 100;
          
          return (
            <div
              key={ps.user_id}
              className="bounce-in"
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <div className="bg-white border-4 border-black p-4 shadow-lg flex items-center gap-4">
                {/* Rank */}
                <div className="text-3xl font-black w-12 text-center">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </div>
                
                {/* Player Name */}
                <div className="flex-1">
                  <div className="font-bold text-lg uppercase tracking-wide text-black">
                    {ps.username}
                  </div>
                  
                  {/* Score Bar */}
                  <div className="mt-2 h-6 bg-gray-300 border-2 border-black overflow-hidden">
                    <div
                      className="h-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: barColor,
                        boxShadow: `inset 0 0 10px rgba(0,0,0,0.3)`
                      }}
                    />
                  </div>
                </div>

                {/* Score */}
                <div className="text-3xl font-black text-black w-16 text-center">
                  {ps.score}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Next Round / Game Complete */}
      <div className="text-center">
        {isGameComplete ? (
          <div className="status-message success">
            <div className="text-4xl mb-4">🎉</div>
            <p className="text-2xl font-bold">GAME COMPLETE!</p>
            <p className="mt-2">Thanks for playing Sherlock Hums!</p>
          </div>
        ) : isHost ? (
          <button 
            onClick={handleNextRound}
            className="btn-primary text-xl py-4 px-8 pulse-glow"
          >
            ▶️ NEXT ROUND
          </button>
        ) : (
          <div className="status-message">
            <div className="text-2xl mb-2">⏳</div>
            <p>Waiting for host to start next round...</p>
          </div>
        )}
      </div>
    </div>
  );
};
