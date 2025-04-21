import React from "react";

export const SpotifyPlayer = ({ trackId }) => {
  return (
    <>
      <iframe 
        style={{borderRadius: '12px'}} 
        src={`https://open.spotify.com/embed/track/${trackId}?theme=0`}
        width="100%" height="352" 
        frameBorder="0" 
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
        loading="lazy"></iframe>
    </>
  )
}