import { motion, useMotionValue } from 'framer-motion';
import { HomeIcon, MagnifyingGlassIcon, MusicalNoteIcon, UserIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-cyber-black to-cyber-dark text-white font-rajdhani">
      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 bg-dark-glass backdrop-blur-xl z-40"
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="text-2xl font-orbitron font-bold bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-magenta bg-clip-text text-transparent"
          >
            MUSICIFY
          </motion.div>
          <nav className="hidden md:flex items-center space-x-8">
            {['Home', 'Discover', 'Profile'].map((item) => (
              <motion.a
                key={item}
                href="#"
                whileHover={{ 
                  scale: 1.1,
                  textShadow: '0 0 8px rgb(0, 255, 245)'
                }}
                className="text-lg hover:text-neon-cyan transition-colors"
              >
                {item}
              </motion.a>
            ))}
          </nav>
        </div>
      </motion.header>

      {/* Sidebar */}
      <motion.nav 
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        className="fixed left-0 top-0 bottom-0 w-20 bg-dark-glass backdrop-blur-xl pt-24 flex flex-col items-center space-y-8 z-30"
      >
        {[
          { icon: HomeIcon, label: 'Home' },
          { icon: MagnifyingGlassIcon, label: 'Search' },
          { icon: MusicalNoteIcon, label: 'Library' },
          { icon: UserIcon, label: 'Profile' }
        ].map(({ icon: Icon, label }) => (
          <motion.div
            key={label}
            whileHover={{ 
              scale: 1.2,
              filter: 'brightness(1.3)'
            }}
            className="relative group"
          >
            <div className="w-12 h-12 rounded-full bg-dark-glass flex items-center justify-center cursor-pointer
                          border border-transparent hover:border-neon-cyan transition-colors">
              <Icon className="w-6 h-6 text-white group-hover:text-neon-cyan transition-colors" />
            </div>
            <motion.span
              initial={{ opacity: 0, x: 20 }}
              whileHover={{ opacity: 1, x: 0 }}
              className="absolute left-full ml-4 whitespace-nowrap text-neon-cyan text-sm px-2 py-1 rounded-md bg-cyber-dark"
            >
              {label}
            </motion.span>
          </motion.div>
        ))}
      </motion.nav>

      {/* Main Content */}
      <main className="pt-24 pl-24 pr-4 relative z-10">
        {children}
      </main>

      {/* Right Panel - Recommendations */}
      <motion.aside
        initial={{ x: 100 }}
        animate={{ x: 0 }}
        className="fixed right-0 top-0 bottom-0 w-80 bg-dark-glass backdrop-blur-xl pt-24 px-4 hidden lg:block z-20"
      >
        <h2 className="text-xl font-orbitron mb-6 text-neon-magenta">Recommended</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="p-4 rounded-lg bg-cyber-dark border border-neon-purple/20 hover:border-neon-purple cursor-pointer group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple animate-glow-pulse" />
                <div>
                  <p className="font-medium group-hover:text-neon-purple transition-colors">Track Name</p>
                  <p className="text-sm text-gray-400">Artist Name</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.aside>
    </div>
  );
};

export default Layout; 