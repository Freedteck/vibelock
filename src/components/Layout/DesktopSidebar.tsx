import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Search, 
  Upload, 
  User, 
  Music, 
  Heart,
  Clock,
  TrendingUp,
  Sun,
  Moon,
  Settings
} from 'lucide-react';
import { CoinTrack } from '../../models';
import { useWallet } from '../../hooks/useWallet';

interface DesktopSidebarProps {
  currentTrack: CoinTrack | null;
  theme: string;
  onThemeToggle: () => void;
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  currentTrack,
  theme,
  onThemeToggle
}) => {
  const location = useLocation();
  const { isConnected } = useWallet();

  const mainNavItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/discover', label: 'Search', icon: Search },
  ];

  const libraryItems = [
    { path: '/dashboard', label: 'Your Library', icon: Music },
    { path: '/favorites', label: 'Liked Songs', icon: Heart },
    { path: '/recent', label: 'Recently Played', icon: Clock },
    { path: '/trending', label: 'Trending', icon: TrendingUp },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="desktop-sidebar desktop-only h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
            <Music size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold gradient-text">VibeLock</span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <div className="space-y-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                  isActive(item.path)
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Upload Button */}
        {isConnected && (
          <div className="pt-4">
            <Link
              to="/upload"
              className="flex items-center gap-3 px-3 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-all"
            >
              <Upload size={20} />
              <span className="font-medium">Upload</span>
            </Link>
          </div>
        )}

        {/* Library Section */}
        <div className="pt-6">
          <h3 className="px-3 text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Your Library
          </h3>
          <div className="space-y-1">
            {libraryItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                    isActive(item.path)
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recently Played */}
        {currentTrack && (
          <div className="pt-6">
            <h3 className="px-3 text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Recently Played
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-800/30">
                <img
                  src={currentTrack.artworkUrl}
                  alt={currentTrack.title}
                  className="w-10 h-10 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {currentTrack.title}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {currentTrack.artist}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-800 space-y-3">
        {/* Theme Toggle */}
        <button
          onClick={onThemeToggle}
          className="flex items-center gap-3 w-full px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          <span className="text-sm">
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>

        {/* Settings */}
        <Link
          to="/settings"
          className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all"
        >
          <Settings size={18} />
          <span className="text-sm">Settings</span>
        </Link>

        {/* User Profile */}
        {isConnected && (
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <span className="text-sm">Profile</span>
          </Link>
        )}
      </div>
    </aside>
  );
};

export default DesktopSidebar;