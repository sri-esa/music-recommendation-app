// src/pages/SpotifyCallback.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate }    from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Assuming AuthContext is in src/context
import { spotifyConfig } from '../utils/spotifyConfig';

const SpotifyCallback = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get('code');
    // Optional: const state = searchParams.get('state');
    // Optional: Validate state here if you used it

    if (code) {
      setIsLoading(true);
      setError(null);

      const { clientId, redirectUri } = spotifyConfig;
      // In a real app, the clientSecret should NOT be exposed in the frontend.
      // This token exchange should happen on a backend server to protect the clientSecret.
      // For this project, if a backend is not available, we proceed with the understanding
      // that this is for client-side only applications (e.g. using PKCE flow if client secret is not used).
      // The current spotifyConfig doesn't include clientSecret, implying PKCE or implicit grant.
      // For Authorization Code Flow (without PKCE and a public client), a backend is typically needed.
      // Assuming this is a public client and we are exchanging code directly (PKCE is preferred).

      const tokenUrl = 'https://accounts.spotify.com/api/token';
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: clientId,
        // If using PKCE, add 'code_verifier' here.
        // If not using PKCE for a public client, Spotify might require client_secret,
        // which is unsafe here. Let's assume the setup allows direct code exchange for now.
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
            throw new Error(`Spotify token exchange failed: ${res.status} ${JSON.stringify(errData)}`);
          });
        }
        return res.json();
      })
      .then(data => {
        if (data.access_token && data.expires_in) {
          // refreshToken might not always be provided by Spotify if not requested or if it's a re-auth
          login(data.access_token, data.refresh_token || null, data.expires_in);
          navigate('/dashboard'); // Redirect to dashboard or desired page
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
        setError(`Spotify authentication failed: ${errorParam}`);
      } else {
        setError('No authorization code received from Spotify.');
      }
      setIsLoading(false);
    }
  }, [location, navigate, login]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
        <h2 className="text-2xl text-red-500 mb-4">Authentication Error</h2>
        <p className="mb-2">{error}</p>
        <button onClick={() => navigate('/login')} className="btn btn-primary">
          Try Login Again
        </button>
      </div>
    );
  }

  return null; // Or a success message before redirect
};

export default SpotifyCallback;
