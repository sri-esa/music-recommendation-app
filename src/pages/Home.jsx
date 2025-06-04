import { Link } from 'react-router-dom';
import { 
  MusicalNoteIcon, 
  UserGroupIcon, 
  HeartIcon, 
  RocketLaunchIcon 
} from '@heroicons/react/24/outline';

const features = [
  {
    icon: MusicalNoteIcon,
    title: 'Millions of Songs',
    description: 'Listen to your favorite music from a vast library of songs.'
  },
  {
    icon: UserGroupIcon,
    title: 'Personalized Experience',
    description: 'Get recommendations based on your music taste.'
  },
  {
    icon: HeartIcon,
    title: 'Create Collections',
    description: 'Save your favorite songs and create custom playlists.'
  },
  {
    icon: RocketLaunchIcon,
    title: 'Ad-free Music',
    description: 'Enjoy uninterrupted music streaming experience.'
  }
];

const Home = () => {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          Your Music, Your Way
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          Stream millions of songs and podcasts on the go. Listen to your favorite artists and discover new music.
        </p>
        <div className="space-x-4">
          <Link to="/register" className="btn btn-primary">
            Get Started
          </Link>
          <Link to="/login" className="btn btn-secondary">
            Sign In
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <div key={index} className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition-colors">
            <feature.icon className="w-12 h-12 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-400">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="mt-16 text-center bg-gradient-to-r from-green-500 to-blue-600 p-8 rounded-lg">
        <h2 className="text-3xl font-bold mb-4">Ready to Start Listening?</h2>
        <p className="text-lg mb-6">Join millions of music lovers and start your journey today.</p>
        <Link to="/register" className="btn bg-white text-gray-900 hover:bg-gray-100">
          Create Free Account
        </Link>
      </div>
    </div>
  );
};

export default Home; 