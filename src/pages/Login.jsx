// src/pages/Login.jsx
import { Link } from 'react-router-dom'; // Keep Link if other links like register are still relevant
import { MusicalNoteIcon } from '@heroicons/react/24/outline'; // Or a Spotify icon
import { spotifyConfig } from '../utils/spotifyConfig'; // Import the config

const Login = () => {
  const handleSpotifyLogin = () => {
    const { clientId, redirectUri, scopes } = spotifyConfig;
    const scopeString = scopes.join(' ');
    // Ensure state and PKCE could be added here for better security in a real app
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopeString)}`;
    window.location.href = authUrl;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="flex justify-center mb-4">
            {/* Consider using a Spotify logo if available */}
            <MusicalNoteIcon className="h-16 w-16 text-green-500" />
          </div>
          <h2 className="text-3xl font-extrabold text-white">
            Harmonia Music
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Login with your Spotify account to continue.
          </p>
        </div>

        <div className="mt-8">
          <button
            onClick={handleSpotifyLogin}
            className="w-full max-w-xs mx-auto flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-500 transition-transform transform hover:scale-105"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"> {/* Simple Spotify-like icon */}
              <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zM7.414 14.586a.5.5 0 01-.707-.023c-2.053-2.23.06-5.576 3.938-7.195a.5.5 0 01.28.917c-3.363 1.388-5.266 4.062-3.51 5.594a.5.5 0 01-.001.707zm5.172-2.01a.5.5 0 01-.7-.115c-1.688-2.116-.24-4.91 3.02-6.255a.5.5 0 01.341.928c-2.835 1.16-3.98 3.42-2.553 4.976a.5.5 0 01-.108.466zm3.048-2.21a.5.5 0 01-.683-.16C13.56 8.07 12.62 6 10.026 6a4.027 4.027 0 00-3.893 2.728.5.5 0 11-.94-.338A5.026 5.026 0 0110.026 5c3.075 0 4.26 2.41 5.69 4.492a.5.5 0 01-.16.683z" clipRule="evenodd" />
            </svg>
            Login with Spotify
          </button>
        </div>

        {/* Optional: Link to privacy policy or terms related to Spotify usage */}
        <p className="mt-6 text-xs text-gray-500">
          By logging in, you agree to allow Harmonia to access your Spotify account data.
        </p>
      </div>
    </div>
  );
};

export default Login;
