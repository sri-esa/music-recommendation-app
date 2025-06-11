import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { spotifyConfig } from '../utils/spotifyConfig'; // Import spotifyConfig

// Define the shape of the auth state
interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresIn: number | null; // Store expiry time (e.g., timestamp)
  user: any | null; // Replace 'any' with a proper UserProfile type later
  isAuthenticated: boolean;
}

// Define the shape of the context value
interface AuthContextType extends AuthState {
  login: (accessToken: string, refreshToken: string | null, expiresIn: number) => void;
  logout: () => void;
  getValidAccessToken: () => Promise<string | null>; // Will handle refresh later
}

// Initial state
const initialAuthState: AuthState = {
  accessToken: null,
  refreshToken: null,
  expiresIn: null,
  user: null,
  isAuthenticated: false,
};

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the props for the AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);

  // Effect to load token from localStorage on initial mount
  useEffect(() => {
    const storedToken = localStorage.getItem('spotifyAccessToken');
    const storedRefreshToken = localStorage.getItem('spotifyRefreshToken');
    const storedExpiresIn = localStorage.getItem('spotifyExpiresIn');

    if (storedToken && storedExpiresIn) {
      const expiryTime = parseInt(storedExpiresIn, 10);
      if (new Date().getTime() < expiryTime) {
        setAuthState({
          accessToken: storedToken,
          refreshToken: storedRefreshToken,
          expiresIn: expiryTime,
          user: null,
          isAuthenticated: true,
        });
      } else {
        // Token expired, try to refresh if refresh token exists
        if (storedRefreshToken) {
          // Initial load refresh attempt.
          // Note: getValidAccessToken will also be callable on demand.
          // This immediate refresh on load might be too eager for some apps,
          // but fits the requirement of having a valid token if possible.
          refreshAccessToken(storedRefreshToken).then(success => {
            if (!success) {
              // If refresh fails, clear stored tokens
              localStorage.removeItem('spotifyAccessToken');
              localStorage.removeItem('spotifyRefreshToken');
              localStorage.removeItem('spotifyExpiresIn');
              localStorage.removeItem('spotifyUser');
            }
          });
        } else {
           // No refresh token, clear everything
            localStorage.removeItem('spotifyAccessToken');
            localStorage.removeItem('spotifyRefreshToken');
            localStorage.removeItem('spotifyExpiresIn');
            localStorage.removeItem('spotifyUser');
        }
      }
    }
  }, []); // Empty dependency array, runs once on mount

  const storeAuthState = (accessToken: string, refreshToken: string | null, expiresInSeconds: number, user: any | null = authState.user) => {
    const expiryTime = new Date().getTime() + expiresInSeconds * 1000;
    localStorage.setItem('spotifyAccessToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('spotifyRefreshToken', refreshToken);
    } else if (!localStorage.getItem('spotifyRefreshToken')) {
      // If no new refresh token is provided, but one exists in storage, keep it.
      // Only remove it explicitly on logout.
    }
    localStorage.setItem('spotifyExpiresIn', expiryTime.toString());

    setAuthState({
      accessToken,
      refreshToken: refreshToken || localStorage.getItem('spotifyRefreshToken'), // Persist existing RT if not updated
      expiresIn: expiryTime,
      user,
      isAuthenticated: true,
    });
  };

  const login = (accessToken: string, refreshToken: string | null, expiresInSeconds: number) => {
    storeAuthState(accessToken, refreshToken, expiresInSeconds, null); // User fetched separately
  };

  const logout = () => {
    localStorage.removeItem('spotifyAccessToken');
    localStorage.removeItem('spotifyRefreshToken');
    localStorage.removeItem('spotifyExpiresIn');
    localStorage.removeItem('spotifyUser');
    setAuthState(initialAuthState);
  };

  const refreshAccessToken = async (currentRefreshToken: string): Promise<boolean> => {
    try {
      const tokenUrl = 'https://accounts.spotify.com/api/token';
      const { clientId } = spotifyConfig;

      const body = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: currentRefreshToken,
        client_id: clientId,
      });

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      if (!response.ok) {
        // If refresh fails (e.g., refresh token revoked), logout the user
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to refresh token:', response.status, errorData);
        logout();
        return false;
      }

      const data = await response.json();
      // Spotify may or may not return a new refresh_token. If it does, use it.
      // Otherwise, the old refresh_token is still valid.
      storeAuthState(
        data.access_token,
        data.refresh_token || currentRefreshToken, // Use new RT if provided, else old one
        data.expires_in,
        authState.user // Preserve existing user data
      );
      return true;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      logout(); // Logout on any other error during refresh
      return false;
    }
  };

  const getValidAccessToken = async (): Promise<string | null> => {
    if (!authState.accessToken || !authState.expiresIn) {
      // If no token at all, nothing to return or refresh
      // Check localStorage directly as authState might not be updated yet from initial load
      const storedToken = localStorage.getItem('spotifyAccessToken');
      const storedRefreshToken = localStorage.getItem('spotifyRefreshToken');
      const storedExpiresIn = localStorage.getItem('spotifyExpiresIn');

      if (storedToken && storedExpiresIn) {
         const expiryTime = parseInt(storedExpiresIn, 10);
         if (new Date().getTime() < expiryTime - 60000) { // Check with buffer
           // A valid token exists in storage but not in state yet, update state
           setAuthState({
             accessToken: storedToken,
             refreshToken: storedRefreshToken,
             expiresIn: expiryTime,
             user: authState.user || null, // or fetch user if needed
             isAuthenticated: true,
           });
           return storedToken;
         } else if (storedRefreshToken) {
           // Token in storage is expired, but we have a refresh token
           console.log('Token in storage expired, attempting refresh from storage details...');
           const success = await refreshAccessToken(storedRefreshToken);
           // After refreshAccessToken, authState is updated, so read from there
           return success ? authState.accessToken : null;
         } else {
           // Token in storage expired, no refresh token
           logout(); // Clear out expired tokens
           return null;
         }
      }
      return null; // No token in state or storage
    }

    // Check if current token in state is still valid (e.g., with a 60-second buffer)
    const isTokenValid = new Date().getTime() < authState.expiresIn - 60000;

    if (isTokenValid) {
      return authState.accessToken;
    } else if (authState.refreshToken) {
      // Token is expired or close to expiring, try to refresh
      console.log('Access token expired or expiring soon, attempting refresh...');
      const success = await refreshAccessToken(authState.refreshToken);
      return success ? authState.accessToken : null; // Return new token or null if refresh failed
    } else {
      // Token is expired and no refresh token is available
      console.warn('Access token expired, no refresh token available. Logging out.');
      logout();
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, getValidAccessToken, user: authState.user, isAuthenticated: authState.isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext (remains the same)
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
