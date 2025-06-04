import { BrowserRouter as Router } from 'react-router-dom';
import Layout from './components/Layout';
import MusicPlayer from './components/MusicPlayer';

function App() {
  return (
    <Router>
      <Layout>
        <MusicPlayer />
      </Layout>
    </Router>
  );
}

export default App; 