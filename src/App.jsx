// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register'; // Assuming Register is still relevant for other auth methods or future use
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import SpotifyCallback from './pages/SpotifyCallback'; // Import the new component
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider

const App = () => {
  return (
    <AuthProvider> {/* Wrap the entire app or at least the parts needing auth */}
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            {/* Add the callback route */}
            <Route path="callback" element={<SpotifyCallback />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
