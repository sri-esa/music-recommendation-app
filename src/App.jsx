// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import SpotifyCallback from './pages/SpotifyCallback';
import LibraryPage from './pages/LibraryPage'; // New import
import { AuthProvider } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';

const App = () => {
  return (
    <AuthProvider>
      <PlayerProvider> {/* PlayerProvider is inside AuthProvider */}
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}> {/* Layout likely contains MusicPlayer */}
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="library" element={<LibraryPage />} /> {/* New route */}
              <Route path="callback" element={<SpotifyCallback />} />
            </Route>
          </Routes>
        </Router>
      </PlayerProvider>
    </AuthProvider>
  );
};

export default App;
