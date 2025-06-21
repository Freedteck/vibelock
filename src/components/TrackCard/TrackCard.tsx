import React, { useState } from 'react';
import { Play, Pause, Lock, Unlock, Users, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Track } from '../../data/mockData';
import { useAppContext } from '../../context/AppContext';
import UnlockModal from '../UnlockModal/UnlockModal';
import WalletModal from '../WalletModal/WalletModal';
import styles from './TrackCard.module.css';

interface TrackCardProps {
  track: Track;
  onPlay: (track: Track) => void;
  isPlaying: boolean;
  size?: 'small' | 'medium' | 'large';
}

const TrackCard: React.FC<TrackCardProps> = ({ 
  track, 
  onPlay, 
  isPlaying, 
  size = 'medium' 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const { state, dispatch } = useAppContext();
  
  const isUnlocked = state.unlockedTracks.includes(track.id);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onPlay(track);
  };

  const handleUnlockClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!state.isWalletConnected) {
      setShowWalletModal(true);
      return;
    }
    setShowUnlockModal(true);
  };

  const handleUnlock = async (trackId: number) => {
    // Simulate blockchain transaction delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    dispatch({ type: 'UNLOCK_TRACK', payload: trackId });
    
    // Add transaction record
    dispatch({
      type: 'ADD_TRANSACTION',
      payload: {
        id: `tx_${Date.now()}`,
        type: 'unlock',
        trackId,
        amount: 1,
        price: track.coinPrice,
        timestamp: new Date().toISOString(),
        status: 'completed'
      }
    });
  };

  return (
    <>
      <Link to={`/track/${track.id}`} className={`${styles.trackCard} ${styles[size]}`}>
        <div 
          className={styles.cardContent}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className={styles.artworkContainer}>
            <img 
              src={track.artwork} 
              alt={track.title}
              className={styles.artwork}
            />
            
            <div className={`${styles.playButton} ${isHovered ? styles.visible : ''}`}>
              <button onClick={handlePlayClick} className={styles.playButtonInner}>
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
            </div>

            <div className={styles.lockStatus}>
              {isUnlocked ? (
                <Unlock size={16} className={styles.unlocked} />
              ) : (
                <Lock size={16} className={styles.locked} />
              )}
            </div>
          </div>

          <div className={styles.trackInfo}>
            <h3 className={styles.title}>{track.title}</h3>
            <p className={styles.artist}>{track.artist}</p>
            
            <div className={styles.metadata}>
              <span className={styles.genre}>{track.genre}</span>
              <span className={styles.duration}>{track.duration}</span>
            </div>

            <div className={styles.collaborators}>
              {track.collaborators.slice(0, 2).map((collab, index) => (
                <div key={index} className={styles.collaborator}>
                  <span className={styles.collabName}>{collab.name}</span>
                  <span className={styles.collabPercentage}>{collab.percentage}%</span>
                </div>
              ))}
              {track.collaborators.length > 2 && (
                <span className={styles.moreCollabs}>+{track.collaborators.length - 2}</span>
              )}
            </div>

            <div className={styles.stats}>
              <div className={styles.price}>
                <TrendingUp size={14} />
                <span>{track.coinPrice} ETH</span>
              </div>
              <div className={styles.holders}>
                <Users size={14} />
                <span>{track.holders}</span>
              </div>
            </div>

            <div className={styles.actions}>
              {isUnlocked ? (
                <button className={styles.playFullButton} onClick={handlePlayClick}>
                  Play Full Track
                </button>
              ) : (
                <button 
                  className={styles.unlockButton}
                  onClick={handleUnlockClick}
                >
                  <Lock size={16} />
                  Unlock Track
                </button>
              )}
            </div>
          </div>
        </div>
      </Link>

      <UnlockModal
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        track={track}
        onUnlock={handleUnlock}
      />

      <WalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
      />
    </>
  );
};

export default TrackCard;