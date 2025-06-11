// src/pages/SpotifyCallback.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate }    from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { spotifyConfig } from '../utils/spotifyConfig';
import Alert from '../components/Alert'; // Import Alert

const SpotifyCallback = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get('code');

    if (code) {
      setIsLoading(true);
      setError(null);

      const { clientId, redirectUri } = spotifyConfig;
      const tokenUrl = 'https://accounts.spotify.com/api/token';
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: clientId,
      });

      fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      })
      .then(res => {
        if (!res.ok) {
          return res.json().then(errData => {
            throw new Error(`Spotify token exchange failed: ${res.status} ${JSON.stringify(errData.error_description || errData.error || errData)}`);
          });
        }
        return res.json();
      })
      .then(data => {
        if (data.access_token && data.expires_in) {
          login(data.access_token, data.refresh_token || null, data.expires_in);
          navigate('/dashboard');
        } else {
          throw new Error('Access token not received from Spotify.');
        }
      })
      .catch(err => {
        console.error('Spotify callback error:', err);
        setError(err.message || 'Failed to authenticate with Spotify.');
        setIsLoading(false);
      });

    } else {
      const errorParam = searchParams.get('error');
      if (errorParam) {
        setError(`Spotify authentication failed: ${errorParam.replace(/_/g, ' ')}.`); // Make error more readable
      } else {
        setError('No authorization code received from Spotify. Please try logging in again.');
      }
      setIsLoading(false);
    }
  }, [location, navigate, login]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading... Authenticating with Spotify...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
        <div className="w-full max-w-md"> {/* Constrain width for better readability */}
          <Alert type="error" title="Authentication Error" message={error} />
          <button
            onClick={() => navigate('/login')}
            className="mt-6 w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-500 transition-transform transform hover:scale-105"
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
