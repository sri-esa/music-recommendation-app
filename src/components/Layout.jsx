import { Link, Outlet, useLocation } from 'react-router-dom';
import { HomeIcon, UserIcon, MusicalNoteIcon, HeartIcon } from '@heroicons/react/24/outline';

const Layout = () => {
  const location = useLocation();
  
  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-dark">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-dark-200/50 backdrop-blur-2xl border-b border-glass z-50">
        <div className="px-6 py-4 flex items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent mr-8">
            Musicify
          </h1>
          
          <div className="flex items-center space-x-2">
            <Link 
              to="/" 
              className={`group flex items-center px-4 py-2 rounded-xl transition-all duration-300 ${
                isActiveRoute('/') 
                  ? 'bg-glass text-neon-blue shadow-neon-glow' 
                  : 'text-gray-400 hover:bg-dark-300/50 hover:text-neon-blue'
              }`}
            >
              <HomeIcon className="w-[18px] h-[18px] transition-transform duration-300 group-hover:scale-110" />
              <span className="ml-2 text-sm font-medium tracking-wide">Home</span>
            </Link>
            
            <Link 
              to="/dashboard" 
              className={`group flex items-center px-4 py-2 rounded-xl transition-all duration-300 ${
                isActiveRoute('/dashboard')
                  ? 'bg-glass text-neon-purple shadow-neon-glow-purple'
                  : 'text-gray-400 hover:bg-dark-300/50 hover:text-neon-purple'
              }`}
            >
              <MusicalNoteIcon className="w-[18px] h-[18px] transition-transform duration-300 group-hover:scale-110" />
              <span className="ml-2 text-sm font-medium tracking-wide">Dashboard</span>
            </Link>
            
            <Link 
              to="/library" 
              className={`group flex items-center px-4 py-2 rounded-xl transition-all duration-300 ${
                isActiveRoute('/library')
                  ? 'bg-glass text-neon-pink shadow-neon-glow-pink'
                  : 'text-gray-400 hover:bg-dark-300/50 hover:text-neon-pink'
              }`}
            >
              <HeartIcon className="w-[18px] h-[18px] transition-transform duration-300 group-hover:scale-110" />
              <span className="ml-2 text-sm font-medium tracking-wide">Library</span>
            </Link>
            
            <Link 
              to="/profile" 
              className={`group flex items-center px-4 py-2 rounded-xl transition-all duration-300 ${
                isActiveRoute('/profile')
                  ? 'bg-glass text-neon-green shadow-neon-glow-green'
                  : 'text-gray-400 hover:bg-dark-300/50 hover:text-neon-green'
              }`}
            >
              <UserIcon className="w-[18px] h-[18px] transition-transform duration-300 group-hover:scale-110" />
              <span className="ml-2 text-sm font-medium tracking-wide">Profile</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-8 bg-gradient-to-b from-dark to-dark-200 mt-16">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Music Player (Fixed at bottom) */}
      <div className="fixed bottom-0 left-0 right-0 bg-dark-200/80 border-t border-glass backdrop-blur-2xl">
        <div className="max-w-screen-xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden group">
                <img 
                  src="https://via.placeholder.com/48" 
                  alt="Album Art"
                  className="object-cover transform transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-neon-purple/20 to-transparent"></div>
              </div>
              <div>
                <h4 className="font-medium text-sm text-white/90">Song Title</h4>
                <p className="text-xs text-gray-400">Artist Name</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-8">
              <button className="text-gray-400 hover:text-neon-blue transition-all duration-300 hover:scale-110">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button className="relative group">
                <div className="absolute inset-0 bg-neon-purple rounded-full blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative bg-dark-300 rounded-full p-2.5 hover:bg-dark-400 transition-colors">
                  <svg className="w-4 h-4 text-neon-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  </svg>
                </div>
              </button>
              
              <button className="text-gray-400 hover:text-neon-blue transition-all duration-300 hover:scale-110">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <svg className="w-3.5 h-3.5 text-neon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M4.5 9v6a2 2 0 002 2h3a2 2 0 002-2v-6a2 2 0 00-2-2h-3a2 2 0 00-2 2z" />
              </svg>
              <div className="w-24 h-0.5 bg-dark-400 rounded-full overflow-hidden">
                <div className="w-1/2 h-full bg-gradient-to-r from-neon-blue to-neon-purple"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout; 