import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Upload, User } from 'lucide-react';
import styles from './BottomNavigation.module.css';

const BottomNavigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/discover', label: 'Discover', icon: Search },
    { path: '/upload', label: 'Upload', icon: Upload },
    { path: '/dashboard', label: 'Profile', icon: User }
  ];

  return (
    <nav className={styles.bottomNav}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <Icon size={24} />
            <span className={styles.label}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNavigation;