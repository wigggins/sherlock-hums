import React from "react";

export const SpotifyPlayer = ({ trackId }) => {
  return (
    <div className="spotify-wrapper">
      <iframe 
        src={`https://open.spotify.com/embed/track/${trackId}?theme=0`}
        width="100%" 
        height="352" 
        frameBorder="0" 
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
        loading="lazy"
        className="w-full"
      />
    </div>
  )
}