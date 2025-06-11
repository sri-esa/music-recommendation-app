// src/components/MusicPlayer.tsx
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, PresentationControls } from '@react-three/drei';
import { PlayIcon, PauseIcon, ForwardIcon, BackwardIcon } from '@heroicons/react/24/solid';
// Removed MusicalNoteSolidIcon import, will use generic SVG for placeholder
import { useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';

// Simplified AlbumModel - dynamic texture is out of scope for this step
function AlbumModel({ imageUrl }: { imageUrl?: string }) {
  return (
    <mesh>
      <boxGeometry args={[2, 2, 0.2]} />
      <meshStandardMaterial color={imageUrl ? "#555" : "#BD00FF"} />
    </mesh>
  );
}

// Helper to format milliseconds to mm:ss
const formatTime = (ms: number | undefined): string => {
  if (ms === undefined || isNaN(ms)) return '0:00';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const MusicPlayer = () => {
  const {
    playbackState,
    isReady,
    isActive,
    togglePlayPause,
    nextTrackCmd,     // Added
    previousTrackCmd  // Added
  } = usePlayer();

  const currentTrack = playbackState?.track_window?.current_track;
  const duration = playbackState?.duration;
  const position = playbackState?.position;
  const isPlaying = playbackState ? !playbackState.paused : false;
  const progressPercent = duration && position != null ? (position / duration) * 100 : 0;


   if (!isReady || !isActive) {
        return (
          <div className="max-w-4xl mx-auto mt-8">
            <div className="relative bg-dark-glass backdrop-blur-xl rounded-2xl p-8 border border-neon-purple/20 text-center">
              <p className="text-gray-400 text-lg">
                {isReady ? 'Spotify player is ready. Play from another device or start a track here.' : 'Spotify Player not available or not active.'}
              </p>
              <p className="text-xs text-gray-500 mt-2">Ensure you have Spotify Premium and the app is authorized.</p>
            </div>
          </div>
        );
   }
   if (!currentTrack) {
        return (
            <div className="max-w-4xl mx-auto mt-8">
                <div className="relative bg-dark-glass backdrop-blur-xl rounded-2xl p-8 border border-neon-purple/20 text-center">
                <p className="text-gray-400">Nothing currently playing or player state not yet received.</p>
                <div className="h-[150px] w-[150px] bg-gray-700/30 rounded-md mx-auto my-4 flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                </div>
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-orbitron text-gray-600 mb-2">No Track Loaded</h2>
                    <p className="text-gray-500">Select a song to start playing</p>
                </div>
                <div className="flex items-center justify-center space-x-8 mt-8 opacity-50">
                    <BackwardIcon className="w-8 h-8 text-gray-600" />
                    <PlayIcon className="w-8 h-8 text-gray-600" />
                    <ForwardIcon className="w-8 h-8 text-gray-600" />
                </div>
                </div>
            </div>
        );
   }


  return (
    <div className="max-w-4xl mx-auto mt-8">
      <div className="relative bg-dark-glass backdrop-blur-xl rounded-2xl p-8 border border-neon-purple/20">
        <div className="flex justify-center mb-4">
            {currentTrack.album.images?.[0]?.url && (
                <img src={currentTrack.album.images[0].url} alt={currentTrack.album.name} className="w-48 h-48 rounded-lg shadow-lg border-2 border-neon-purple/50" />
            )}
        </div>
        {/* 3D Album Visualization - Kept for structure, dynamic update is complex */}
        {/* <div className="h-[200px] mb-4 md:h-[300px]">
          <Canvas camera={{ position: [0, 0, 3.5], fov: 45 }}>
            <ambientLight intensity={0.8} />
            <pointLight position={[5, 5, 5]} intensity={0.5}/>
            <PresentationControls
              global zoom={0.9} rotation={[0, -Math.PI / 6, 0]}
              polar={[-Math.PI / 6, Math.PI / 6]} azimuth={[-Math.PI / 6, Math.PI / 6]}
            >
              <AlbumModel imageUrl={currentTrack.album.images?.[0]?.url} />
            </PresentationControls>
          </Canvas>
        </div> */}
        <div className="text-center mb-6">
          <motion.h2 
            className="text-2xl font-orbitron text-neon-cyan mb-1"
            key={currentTrack.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0, textShadow: ['0 0 8px rgb(0, 255, 245)', '0 0 16px rgb(0, 255, 245)', '0 0 8px rgb(0, 255, 245)'] }}
            transition={{ duration: 0.5, textShadow: { duration: 2, repeat: Infinity } }}
          >
            {currentTrack.name}
          </motion.h2>
          <p className="text-gray-400 text-sm">{currentTrack.artists.map(a => a.name).join(', ')}</p>
        </div>
        <div className="mb-6">
          <div className="h-1.5 bg-cyber-dark rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple"
              initial={{ width: '0%' }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3, ease: "linear" }}
            />
          </div>
          <div className="flex justify-between mt-1.5 text-xs text-gray-500">
            <span>{formatTime(position)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-6">
          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
            className="text-gray-400 hover:text-neon-cyan transition-colors disabled:opacity-50"
            onClick={previousTrackCmd} // Use previousTrackCmd
            disabled={playbackState?.disallows?.skipping_prev || !isActive}
          >
            <BackwardIcon className="w-7 h-7 md:w-8 md:h-8" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
            onClick={togglePlayPause}
            className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple p-0.5 group disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={
                (isPlaying && playbackState?.disallows?.pausing) ||
                (!isPlaying && playbackState?.disallows?.resuming) ||
                !isActive
            }
          >
            <div className="w-full h-full rounded-full bg-cyber-dark flex items-center justify-center">
              {isPlaying ? (
                <PauseIcon className="w-7 h-7 md:w-8 md:h-8 text-neon-cyan group-hover:text-neon-purple transition-colors" />
              ) : (
                <PlayIcon className="w-7 h-7 md:w-8 md:h-8 text-neon-cyan group-hover:text-neon-purple transition-colors" />
              )}
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
            className="text-gray-400 hover:text-neon-cyan transition-colors disabled:opacity-50"
            onClick={nextTrackCmd} // Use nextTrackCmd
            disabled={playbackState?.disallows?.skipping_next || !isActive}
          >
            <ForwardIcon className="w-7 h-7 md:w-8 md:h-8" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
