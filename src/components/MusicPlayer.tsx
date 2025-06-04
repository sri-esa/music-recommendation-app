import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, PresentationControls } from '@react-three/drei';
import { PlayIcon, PauseIcon, ForwardIcon, BackwardIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';

function AlbumModel() {
  // Note: You'll need to add your own .glb model file
  // const { scene } = useGLTF('/album.glb');
  return (
    <mesh>
      <boxGeometry args={[2, 2, 0.1]} />
      <meshStandardMaterial color="#BD00FF" />
    </mesh>
  );
}

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <div className="relative bg-dark-glass backdrop-blur-xl rounded-2xl p-8 border border-neon-purple/20">
        {/* 3D Album Visualization */}
        <div className="h-[400px] mb-8">
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <PresentationControls
              global
              zoom={0.8}
              rotation={[0, -Math.PI / 4, 0]}
              polar={[-Math.PI / 4, Math.PI / 4]}
              azimuth={[-Math.PI / 4, Math.PI / 4]}
            >
              <AlbumModel />
            </PresentationControls>
          </Canvas>
        </div>

        {/* Song Info */}
        <div className="text-center mb-8">
          <motion.h2 
            className="text-2xl font-orbitron text-neon-cyan mb-2"
            animate={{ 
              textShadow: ['0 0 8px rgb(0, 255, 245)', '0 0 16px rgb(0, 255, 245)', '0 0 8px rgb(0, 255, 245)']
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Cyberpunk Dreams
          </motion.h2>
          <p className="text-gray-400">Virtual Artist</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-1 bg-cyber-dark rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple"
              initial={{ width: '0%' }}
              animate={{ width: '60%' }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-400">
            <span>2:30</span>
            <span>4:15</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-8">
          <motion.button
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className="text-neon-cyan hover:text-neon-purple transition-colors"
          >
            <BackwardIcon className="w-8 h-8" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple p-[2px] group"
          >
            <div className="w-full h-full rounded-full bg-cyber-dark flex items-center justify-center">
              {isPlaying ? (
                <PauseIcon className="w-8 h-8 text-neon-cyan group-hover:text-neon-purple transition-colors" />
              ) : (
                <PlayIcon className="w-8 h-8 text-neon-cyan group-hover:text-neon-purple transition-colors" />
              )}
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className="text-neon-cyan hover:text-neon-purple transition-colors"
          >
            <ForwardIcon className="w-8 h-8" />
          </motion.button>
        </div>

        {/* Visualizer */}
        <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden">
          <motion.div 
            className="flex justify-between h-full"
            animate={{
              scaleY: [1, 2, 1],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatType: "mirror",
            }}
          >
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="w-0.5 bg-neon-cyan mx-px"
                initial={{ height: '100%' }}
                animate={{ 
                  height: ['40%', '100%', '60%', '90%', '40%'],
                  backgroundColor: ['#00FFF5', '#BD00FF', '#00FFF5']
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.05,
                }}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer; 