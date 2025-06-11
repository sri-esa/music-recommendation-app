// src/context/PlayerContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';

declare global {
  interface Window {
    Spotify: any;
    onSpotifyWebPlaybackSDKReady: (() => void) | undefined;
  }
}

interface SpotifyPlayer {
  connect: () => Promise<boolean>;
  disconnect: () => void;
  getCurrentState: () => Promise<Spotify.PlaybackState | null>;
  getVolume: () => Promise<number>;
  setVolume: (volume: number) => Promise<void>;
  nextTrack: () => Promise<void>;
  previousTrack: () => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  seek: (position_ms: number) => Promise<void>;
  setName: (name: string) => Promise<void>;
  addListener: (event: string, callback: Function) => boolean;
  removeListener: (event: string, callback?: Function) => boolean;
  _options: {
    getOAuthToken: (cb: (token: string) => void) => void;
    id: string;
  };
}
interface SpotifyTrack {
  uri: string;
  id: string | null;
  type: 'track' | 'episode' | 'ad';
  media_type: 'audio' | 'video';
  name: string;
  is_playable: boolean;
  album: {
    uri: string;
    name: string;
    images: { url: string }[];
  };
  artists: { uri: string; name: string }[];
}
interface SpotifyPlaybackState {
  context: {
    uri: string | null;
    metadata: any | null;
  };
  disallows: {
    pausing?: boolean;
    resuming?: boolean;
    skipping_next?: boolean;
    skipping_prev?: boolean;
  };
  duration: number;
  paused: boolean;
  position: number;
  repeat_mode: 0 | 1 | 2;
  shuffle: boolean;
  track_window: {
    current_track: SpotifyTrack;
    previous_tracks: SpotifyTrack[];
    next_tracks: SpotifyTrack[];
  };
  timestamp: number;
 }

interface PlayerState {
  player: SpotifyPlayer | null;
  deviceId: string | null;
  isReady: boolean;
  playbackState: SpotifyPlaybackState | null;
  isActive: boolean;
 }


interface PlayerContextType extends PlayerState {
  playTrack: (spotifyUri: string, deviceIdOverride?: string) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  nextTrackCmd: () => Promise<void>; // Added
  previousTrackCmd: () => Promise<void>; // Added
}

const initialPlayerState: PlayerState = {
  player: null,
  deviceId: null,
  isReady: false,
  playbackState: null,
  isActive: false,
 };

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

interface PlayerProviderProps {
  children: React.ReactNode;
 }
type ScriptLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error';


export const PlayerProvider: React.FC<PlayerProviderProps> = ({ children }) => {
  const { accessToken, getValidAccessToken, logout, isAuthenticated } = useAuth();
  const [playerState, setPlayerState] = useState<PlayerState>(initialPlayerState);
  const [scriptLoadingStatus, setScriptLoadingStatus] = useState<ScriptLoadingStatus>('idle');

  const initializePlayerInternal = useCallback(() => {
    if (!window.Spotify || !accessToken || playerState.player) {
      return;
    }
    const localPlayer = new window.Spotify.Player({
        name: 'Harmonia Web Player',
        getOAuthToken: (cb: (token: string) => void) => {
            getValidAccessToken().then((token) => {
            if (token) { cb(token); } else { logout(); console.error("Failed to get valid token for Spotify SDK"); }
            });
        },
        volume: 0.5,
    });

    localPlayer.addListener('ready', ({ device_id }: { device_id: string }) => {
      console.log('Spotify Player Ready with Device ID', device_id);
      setPlayerState(prev => ({ ...prev, player: localPlayer as unknown as SpotifyPlayer, deviceId: device_id, isReady: true }));
    });
    localPlayer.addListener('not_ready', ({ device_id }: { device_id: string }) => {
      console.log('Device ID has gone offline', device_id);
      setPlayerState(prev => ({ ...prev, isReady: false, isActive: prev.deviceId === device_id ? false : prev.isActive }));
    });
    localPlayer.addListener('player_state_changed', (state: Spotify.PlaybackState | null) => {
      console.log('Player state changed:', state);
      if (!state) { setPlayerState(prev => ({ ...prev, playbackState: null, isActive: false })); return; }
      setPlayerState(prev => ({ ...prev, playbackState: state as unknown as SpotifyPlaybackState, isActive: true }));
    });
    localPlayer.addListener('initialization_error', ({ message } : { message: string }) => { console.error('Failed to initialize Spotify Player', message); setScriptLoadingStatus('error'); });
    localPlayer.addListener('authentication_error', ({ message } : { message: string }) => { console.error('Failed to authenticate Spotify Player', message); logout(); });
    localPlayer.addListener('account_error', ({ message } : { message: string }) => { console.error('Spotify Player account error', message); });
    localPlayer.addListener('playback_error', ({ message } : { message: string }) => { console.error('Spotify Player playback error', message); });

    localPlayer.connect().then(success => {
        if (success) {
            console.log('The Web Playback SDK successfully connected to Spotify!');
        } else {
            console.error('Failed to connect the Web Playback SDK.');
        }
    });
    setPlayerState(prev => ({ ...prev, player: localPlayer as unknown as SpotifyPlayer }));
  }, [accessToken, getValidAccessToken, logout, playerState.player]);

  useEffect(() => {
    if (!isAuthenticated) {
        if (playerState.player) playerState.player.disconnect();
        setPlayerState(initialPlayerState);
        setScriptLoadingStatus('idle');
        return;
    }
    if (scriptLoadingStatus === 'idle' && isAuthenticated) {
      if (window.Spotify) {
        console.log('Spotify SDK already found in window.');
        setScriptLoadingStatus('loaded');
      } else {
        setScriptLoadingStatus('loading');
        console.log('Loading Spotify SDK script...');
        window.onSpotifyWebPlaybackSDKReady = () => {
            console.log('Spotify Web Playback SDK is ready.');
            setScriptLoadingStatus('loaded');
        };
        const script = document.createElement('script');
        script.id = 'spotify-sdk';
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        script.async = true; script.defer = true;
        script.onload = () => { console.log('Spotify SDK script tag finished loading into DOM.')};
        script.onerror = () => {
            console.error('Failed to load Spotify SDK script tag from network.');
            setScriptLoadingStatus('error'); window.onSpotifyWebPlaybackSDKReady = undefined;
        };
        document.body.appendChild(script);
      }
    }
  }, [scriptLoadingStatus, isAuthenticated, playerState.player]);

  useEffect(() => {
    if (scriptLoadingStatus === 'loaded' && isAuthenticated && !playerState.player) {
      initializePlayerInternal();
    }
    if (!isAuthenticated && playerState.player) {
        console.log("User logged out, disconnecting player.");
        playerState.player.disconnect();
        setPlayerState(initialPlayerState);
    }
  }, [scriptLoadingStatus, isAuthenticated, playerState.player, initializePlayerInternal]);

  useEffect(() => {
    return () => {
      if (playerState.player) {
        console.log("PlayerProvider unmounting, disconnecting player.");
        playerState.player.disconnect();
      }
      window.onSpotifyWebPlaybackSDKReady = undefined;
    };
  }, [playerState.player]);


  const playTrack = async (spotifyUri: string, deviceIdOverride?: string) => {
    if (!playerState.player || !playerState.isReady) { console.warn('Player not ready.'); return; }
    const currentDeviceId = deviceIdOverride || playerState.deviceId;
    if (!currentDeviceId) { console.warn('No device ID.'); return; }
    const token = await getValidAccessToken();
    if (!token) { console.error("No valid token for playback."); return; }
    try {
        await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${currentDeviceId}`, {
            method: 'PUT',
            body: JSON.stringify({ uris: [spotifyUri] }),
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
        });
        console.log(`Attempted to play ${spotifyUri} on device ${currentDeviceId}`);
    } catch (error) {
        console.error('Error playing track:', error)
    }
  };

  const togglePlayPause = async () => {
    if (!playerState.player || !playerState.playbackState || typeof playerState.player.pause !== 'function' || typeof playerState.player.resume !== 'function') {
        console.warn('Player or methods not available for toggle.'); return;
    }
    try {
        if (playerState.playbackState.paused) { await playerState.player.resume(); } else { await playerState.player.pause(); }
    } catch (error) {
        console.error("Error toggling play/pause:", error);
    }
  };

  const nextTrackCmd = async () => {
    if (playerState.player && typeof playerState.player.nextTrack === 'function') {
      try {
        await playerState.player.nextTrack();
        console.log("Skipped to next track via SDK.");
      } catch (error) {
        console.error("Error from SDK nextTrack:", error);
      }
    } else {
      console.warn("Player not available or nextTrack method missing.");
    }
  };

  const previousTrackCmd = async () => {
    if (playerState.player && typeof playerState.player.previousTrack === 'function') {
      try {
        await playerState.player.previousTrack();
        console.log("Skipped to previous track via SDK.");
      } catch (error) {
        console.error("Error from SDK previousTrack:", error);
      }
    } else {
      console.warn("Player not available or previousTrack method missing.");
    }
  };

  const contextValue: PlayerContextType = {
    ...playerState,
    playTrack,
    togglePlayPause,
    nextTrackCmd,
    previousTrackCmd,
  };

  return <PlayerContext.Provider value={contextValue}>{children}</PlayerContext.Provider>;
};

export const usePlayer = (): PlayerContextType => {
  const context = useContext(PlayerContext);
  if (context === undefined) { throw new Error('usePlayer must be used within an PlayerProvider'); }
  return context;
};
