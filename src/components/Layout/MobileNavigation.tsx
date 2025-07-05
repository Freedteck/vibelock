import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Upload, User, Music } from 'lucide-react';
import { CoinTrack } from '../../models';
import { useWallet } from '../../hooks/useWallet';

interface MobileNavigationProps {
  currentTrack: CoinTrack | null;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ currentTrack }) => {
  const location = useLocation();
  const { isConnected } = useWallet();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/discover', label: 'Search', icon: Search },
    { path: '/upload', label: 'Upload', icon: Upload, requiresAuth: true },
    { path: '/dashboard', label: 'Library', icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Adjust bottom padding based on player visibility
  const bottomPadding = currentTrack ? 'pb-32' : 'pb-20';

  return (
    <nav className={`mobile-nav mobile-only ${bottomPadding}`}>
      <div className="flex justify-around items-center py-2 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          
          // Hide upload if not connected
          if (item.requiresAuth && !isConnected) {
            return null;
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                isActive(item.path)
                  ? 'text-green-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon size={24} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavigation;