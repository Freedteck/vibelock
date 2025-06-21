import React, { useState } from 'react';
import { Play, Pause, Lock, Unlock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Track } from '../../data/mockData';
import { useAppContext } from '../../context/AppContext';
import styles from './CompactTrackCard.module.css';

interface CompactTrackCardProps {
  track: Track;
  onPlay: (track: Track) => void;
  isPlaying: boolean;
  size?: 'small' | 'medium';
}

const CompactTrackCard: React.FC<CompactTrackCardProps> = ({ 
  track, 
  onPlay, 
  isPlaying,
  size = 'medium'
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const { state } = useAppContext();
  
  const isUnlocked = state.unlockedTracks.includes(track.id);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onPlay(track);
  };

  const handleTouchStart = () => setIsPressed(true);
  const handleTouchEnd = () => setIsPressed(false);

  return (
    <Link 
      to={`/track/${track.id}`} 
      className={`${styles.card} ${styles[size]} ${isPressed ? styles.pressed : ''}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className={styles.artworkContainer}>
        <img 
          src={track.artwork} 
          alt={track.title}
          className={styles.artwork}
        />
        
        <button 
          onClick={handlePlayClick} 
          className={styles.playButton}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>

        <div className={styles.lockStatus}>
          {isUnlocked ? (
            <Unlock size={12} className={styles.unlocked} />
          ) : (
            <Lock size={12} className={styles.locked} />
          )}
        </div>
      </div>

      <div className={styles.info}>
        <h3 className={styles.title}>{track.title}</h3>
        <p className={styles.artist}>{track.artist}</p>
        <div className={styles.price}>{track.coinPrice} ETH</div>
      </div>
    </Link>
  );
};

export default CompactTrackCard;