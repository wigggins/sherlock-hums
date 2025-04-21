/**
 * Extracts the Spotify track ID from a track URL.
 * @param {string} url - A Spotify track URL, e.g. "https://open.spotify.com/track/2TjngvHoJQIkI7BGoK04D2?si=..."
 * @returns {string|null} The track ID (e.g. "2TjngvHoJQIkI7BGoK04D2"), or null if none found.
 */
export function getSpotifyTrackId(url) {
  const match = url.match(/\/track\/([^?]+)/);
  return match ? match[1] : null;
}