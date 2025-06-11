// src/pages/Login.jsx
import { Link } from 'react-router-dom';
// import { MusicalNoteIcon } from '@heroicons/react/24/outline'; // Replaced with inline SVG
import { spotifyConfig } from '../utils/spotifyConfig';
import { generateCodeVerifier, generateCodeChallenge } from '../utils/pkceUtils'; // Import PKCE utils

const Login = () => {
  // Make handleSpotifyLogin async
  const handleSpotifyLogin = async () => {
    try {
      const { clientId, redirectUri, scopes } = spotifyConfig;
      const scopeString = scopes.join(' ');

      // 1. Generate and store code_verifier
      const codeVerifier = generateCodeVerifier();
      localStorage.setItem('spotify_pkce_code_verifier', codeVerifier);

      // 2. Generate code_challenge
      const codeChallenge = await generateCodeChallenge(codeVerifier);

      // 3. Add PKCE params to auth URL
      const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopeString)}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

      window.location.href = authUrl;
    } catch (error) {
      console.error("Error during Spotify login initiation:", error);
      // Optionally, display an error message to the user here
      alert("Failed to initiate Spotify login. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="flex justify-center mb-4">
            <svg className="w-16 h-16 text-green-500" fill="currentColor" viewBox="0 0 166.2 166.2"> {/* Spotify-like Icon */}
                <path d="M83.1,0C37.3,0,0,37.3,0,83.1s37.3,83.1,83.1,83.1s83.1-37.3,83.1-83.1S128.9,0,83.1,0z M122.2,120.8
                    c-1.6,2.5-4.8,3.2-7.3,1.6c-19.4-11.9-43.8-14.6-72.9-8C39.5,115,37,112.8,36.4,110.3s1.9-5.1,4.5-5.7
                    c31.9-7.3,58.9-4.2,80.7,9.1C124.1,115.4,124.7,118.9,122.2,120.8z M132.9,98.1c-2,3.1-6,4-9.1,2c-22.1-13.6-56.2-17.7-83.7-9.7
                    c-3.4,1-6.9-0.8-7.8-4.2s0.8-6.9,4.2-7.8c30.7-8.7,67.9-4.2,92.9,11.1C132.4,91.2,134.9,95.1,132.9,98.1z M133.6,74.4
                    c-26.2-15.7-70.2-17.2-97.5-9.5c-4.1,1.2-8.3-1-9.5-5.1s1-8.3,5.1-9.5C66.1,42.1,113.9,43.7,143,61.3c3.6,2.2,4.8,6.8,2.6,10.4
                    S137.2,76.6,133.6,74.4z"/>
            </svg>
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
            onClick={handleSpotifyLogin} // Already async
            className="w-full max-w-xs mx-auto flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-500 transition-transform transform hover:scale-105"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zM7.414 14.586a.5.5 0 01-.707-.023c-2.053-2.23.06-5.576 3.938-7.195a.5.5 0 01.28.917c-3.363 1.388-5.266 4.062-3.51 5.594a.5.5 0 01-.001.707zm5.172-2.01a.5.5 0 01-.7-.115c-1.688-2.116-.24-4.91 3.02-6.255a.5.5 0 01.341.928c-2.835 1.16-3.98 3.42-2.553 4.976a.5.5 0 01-.108.466zm3.048-2.21a.5.5 0 01-.683-.16C13.56 8.07 12.62 6 10.026 6a4.027 4.027 0 00-3.893 2.728.5.5 0 11-.94-.338A5.026 5.026 0 0110.026 5c3.075 0 4.26 2.41 5.69 4.492a.5.5 0 01-.16.683z" clipRule="evenodd" />
            </svg>
            Login with Spotify
          </button>
        </div>

        <p className="mt-6 text-xs text-gray-500">
          By logging in, you agree to allow Harmonia to access your Spotify account data.
        </p>
      </div>
    </div>
  );
};

export default Login;
