// src/utils/spotifyConfig.ts
export const spotifyConfig = {
  clientId: 'YOUR_SPOTIFY_CLIENT_ID', // Replace with actual Client ID
  redirectUri: 'http://localhost:3000/callback', // Replace with your registered Redirect URI
  scopes: [
    'user-read-private',
    'user-read-email',
    'user-top-read',
    'user-read-recently-played',
    'user-library-read', // For /me/tracks (liked songs)
    'playlist-read-private',
    'playlist-read-collaborative',
    // New scopes for Web Playback SDK
    'streaming',
    'user-modify-playback-state',
    'user-read-playback-state',
    'user-read-currently-playing',
  ],
};
