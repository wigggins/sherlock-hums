import React from 'react';
import { usePlayers } from '../hooks/usePlayers';
import { UserAvatar } from "../components/UserAvatar/UserAvatar";
import { avatarColors } from '../utils/constants';

export const GameComplete = () => {
  const { players } = usePlayers();

  // Sort players by score (descending)
  const sortedPlayers = [...(players || [])].sort((a, b) => (b.score || 0) - (a.score || 0));
  const winner = sortedPlayers[0];

  return (
    <div className="page-container">
      {/* Background decorations */}
      <div className="bg-decoration">GAME</div>
      <div className="bg-decoration">OVER</div>
      <div className="bg-decoration">WIN</div>
      
      <div className="content-wrapper">
        <header className="text-center mb-8">
          <h1 className="bounce-in text-4xl md:text-6xl">
            GAME COMPLETE!
          </h1>
          <p className="text-xl font-bold mt-4 uppercase tracking-wide">
            🎉 The Music Detective Champions! 🎉
          </p>
        </header>

        {/* Winner Celebration */}
        {winner && (
          <div className="section-card mb-8 text-center">
            <h2 className="text-black mb-6">
              👑 CHAMPION
            </h2>
            
            <div className="status-message success mb-6 pulse-glow">
              <div className="text-6xl mb-4">🏆</div>
              <p className="text-3xl font-black uppercase">
                {winner.username}
              </p>
              <p className="text-xl font-bold mt-2">
                {winner.score || 0} Points
              </p>
              <p className="mt-4 text-lg">
                Master of Musical Mysteries!
              </p>
            </div>
            
            <div className="p-6 bg-black text-white border-4 border-white">
              <p className="font-bold text-lg uppercase mb-2">
                🎵 Victory Stats:
              </p>
              <div className="text-sm space-y-1">
                <p>• Most accurate music detective</p>
                <p>• Best at reading musical vibes</p>
                <p>• Champion of the guessing game</p>
              </div>
            </div>
          </div>
        )}

        {/* Final Leaderboard */}
        <div className="section-card mb-8">
          <h2 className="text-black text-center mb-6">
            📊 FINAL LEADERBOARD
          </h2>
          
          <div className="space-y-4">
            {sortedPlayers.map((player, index) => {
              const barColor = avatarColors[player.avatar_color] || '#4caf50';
              const maxScore = sortedPlayers[0]?.score || 1;
              const pct = ((player.score || 0) / maxScore) * 100;
              
              return (
                <div
                  key={player.user_id}
                  className="bounce-in"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className="bg-white border-4 border-black p-4 shadow-lg flex items-center gap-4">
                    {/* Rank */}
                    <div className="text-4xl font-black w-16 text-center">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </div>
                    
                    {/* Player Avatar */}
                    <div>
                      <UserAvatar user={player} />
                    </div>
                    
                    {/* Player Info */}
                    <div className="flex-1">
                      <div className="font-bold text-xl uppercase tracking-wide text-black">
                        {player.username}
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
                      
                      <div className="text-sm mt-1 font-bold uppercase">
                        {index === 0 ? 'CHAMPION' : index === 1 ? 'RUNNER UP' : index === 2 ? 'BRONZE MEDAL' : 'GREAT JOB'}
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-3xl font-black text-black w-20 text-center">
                      {player.score || 0}
                      <div className="text-xs font-bold uppercase">
                        POINTS
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Game Summary */}
        <div className="section-card mb-8">
          <h3 className="text-black text-center mb-6">🎮 Game Summary</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-black">{players?.length || 0}</div>
              <div className="text-sm uppercase font-bold">Players</div>
            </div>
            <div>
              <div className="text-3xl font-black">{(players?.length || 0) * 3}</div>
              <div className="text-sm uppercase font-bold">Songs Played</div>
            </div>
            <div>
              <div className="text-3xl font-black">{Math.max(...(players || []).map(p => p.score || 0))}</div>
              <div className="text-sm uppercase font-bold">High Score</div>
            </div>
            <div>
              <div className="text-3xl font-black">100%</div>
              <div className="text-sm uppercase font-bold">Fun Had</div>
            </div>
          </div>
        </div>

        {/* Play Again */}
        <div className="section-card text-center">
          <h3 className="text-black mb-6">🔄 Want More?</h3>
          
          <div className="space-y-4">
            <button 
              onClick={() => window.location.href = '/'}
              className="btn-primary text-xl py-4 px-8 pulse-glow"
            >
              🎵 PLAY AGAIN
            </button>
            
            <div className="p-4 bg-black text-white border-4 border-white">
              <p className="font-bold text-sm uppercase mb-2">
                Thanks for playing Sherlock Hums!
              </p>
              <p className="text-xs">
                Hope you discovered some new favorite tracks! 🎶
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}