// src/pages/SpotifyCallback.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate }    from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { spotifyConfig } from '../utils/spotifyConfig';
import Alert from '../components/Alert'; // Assuming Alert component exists

const SpotifyCallback = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const exchangeCodeForToken = async (code) => { // Removed type annotation for 'code' to keep it as .jsx
      setIsLoading(true);
      setError(null);

      // 1. Retrieve code_verifier from localStorage
      const codeVerifier = localStorage.getItem('spotify_pkce_code_verifier');

      if (!codeVerifier) {
        console.error('PKCE Error: code_verifier not found in localStorage.');
        setError('Authentication error: PKCE code_verifier missing. Please try logging in again.');
        setIsLoading(false);
        // No need to remove here as it wasn't found
        return;
      }

      try {
        const { clientId, redirectUri } = spotifyConfig;
        const tokenUrl = 'https://accounts.spotify.com/api/token';

        // 2. Include code_verifier in the token request body
        const body = new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: redirectUri,
          client_id: clientId,
          code_verifier: codeVerifier, // Add code_verifier here
        });

        const response = await fetch(tokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: body.toString(),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({ error_description: 'Unknown error during token exchange.' }));
          throw new Error(`Spotify token exchange failed: ${response.status} ${errData.error_description || JSON.stringify(errData)}`);
        }

        const data = await response.json();

        if (data.access_token && data.expires_in) {
          login(data.access_token, data.refresh_token || null, data.expires_in);
          navigate('/dashboard');
        } else {
          throw new Error('Access token not received from Spotify.');
        }

      } catch (err) {
        console.error('Spotify callback error:', err);
        setError(err.message || 'Failed to authenticate with Spotify.');
      } finally {
        // 3. Clear code_verifier from localStorage
        localStorage.removeItem('spotify_pkce_code_verifier');
        setIsLoading(false);
      }
    };

    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError(`Spotify authentication failed: ${errorParam.replace(/_/g, ' ')}`);
      setIsLoading(false);
    } else if (code) {
      exchangeCodeForToken(code);
    } else {
      setError('No authorization code or error received from Spotify.');
      setIsLoading(false);
    }

  }, [location, navigate, login]); // Dependencies for useEffect

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Authenticating with Spotify...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
        <div className="w-full max-w-md">
          <Alert type="error" title="Authentication Error" message={error} />
          <button
            onClick={() => navigate('/login')}
            className="mt-4 w-full btn btn-primary flex justify-center" // Assuming btn & btn-primary are styled
          >
            Try Login Again
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default SpotifyCallback;
