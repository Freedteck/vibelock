import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, Star } from 'lucide-react';
import styles from './HorizontalScroll.module.css';

interface HorizontalScrollProps {
  children: React.ReactNode;
  title: string;
  showNavigation?: boolean;
}

const HorizontalScroll: React.FC<HorizontalScrollProps> = ({ 
  children, 
  title, 
  showNavigation = true 
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    
    const scrollAmount = 280; // Width of one card plus gap
    const currentScroll = scrollRef.current.scrollLeft;
    const newScroll = direction === 'left' 
      ? currentScroll - scrollAmount 
      : currentScroll + scrollAmount;
    
    scrollRef.current.scrollTo({
      left: newScroll,
      behavior: 'smooth'
    });
  };

  const getIcon = () => {
    if (title.includes('Trending')) {
      return <TrendingUp size={20} />;
    }
    if (title.includes('Fresh') || title.includes('Recent')) {
      return <Star size={20} />;
    }
    return null;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {getIcon()}
          {title}
        </h2>
        {showNavigation && (
          <div className={styles.navigation}>
            <button 
              onClick={() => scroll('left')} 
              className={styles.navButton}
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => scroll('right')} 
              className={styles.navButton}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
      
      <div 
        ref={scrollRef}
        className={styles.scrollContainer}
      >
        {children}
      </div>
    </div>
  );
};

export default HorizontalScroll;