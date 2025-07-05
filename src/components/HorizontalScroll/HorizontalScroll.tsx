import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
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
    
    const scrollAmount = 300; // Width of one card plus gap
    const currentScroll = scrollRef.current.scrollLeft;
    const newScroll = direction === 'left' 
      ? currentScroll - scrollAmount 
      : currentScroll + scrollAmount;
    
    scrollRef.current.scrollTo({
      left: newScroll,
      behavior: 'smooth'
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <div className={styles.titleIcon}>
            <TrendingUp size={18} />
          </div>
          {title}
        </h2>
        {showNavigation && (
          <div className={styles.navigation}>
            <button 
              onClick={() => scroll('left')} 
              className={styles.navButton}
            >
              <ChevronLeft size={22} />
            </button>
            <button 
              onClick={() => scroll('right')} 
              className={styles.navButton}
            >
              <ChevronRight size={22} />
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