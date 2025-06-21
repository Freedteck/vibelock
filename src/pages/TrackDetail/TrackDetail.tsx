import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Pause, Lock, Unlock, Users, TrendingUp, MessageCircle, Share2, Heart } from 'lucide-react';
import { Track } from '../../data/mockData';
import { useAppContext } from '../../context/AppContext';
import UnlockModal from '../../components/UnlockModal/UnlockModal';
import styles from './TrackDetail.module.css';

interface TrackDetailProps {
  onTrackPlay: (track: Track) => void;
  currentTrack: Track | null;
  isPlaying: boolean;
}

const TrackDetail: React.FC<TrackDetailProps> = ({ onTrackPlay, currentTrack, isPlaying }) => {
  const { id } = useParams<{ id: string }>();
  const [track, setTrack] = useState<Track | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([
    {
      id: 1,
      author: 'User123',
      text: 'This track is absolutely incredible! The production quality is top-notch.',
      timestamp: '2 hours ago'
    },
    {
      id: 2,
      author: 'MusicLover',
      text: "Can't wait to unlock the full version. Preview sounds amazing!",
      timestamp: '5 hours ago'
    }
  ]);

  const { state, dispatch } = useAppContext();

  useEffect(() => {
    const foundTrack = state.tracks.find(t => t.id === parseInt(id || '0'));
    setTrack(foundTrack || null);
  }, [id, state.tracks]);

  const isUnlocked = track ? state.unlockedTracks.includes(track.id) : false;

  if (!track) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>
          <h2>Track not found</h2>
          <Link to="/discover" className={styles.backButton}>
            Back to Discover
          </Link>
        </div>
      </div>
    );
  }

  const handlePlayClick = () => {
    onTrackPlay(track);
  };

  const handleUnlockClick = () => {
    if (!state.isWalletConnected) {
      alert('Please connect your wallet first');
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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: track.title,
        text: `Check out ${track.title} by ${track.artist}`,
        url: window.location.href
      }).catch(() => {
        navigator.clipboard.writeText(window.location.href);
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleCommentSubmit = () => {
    if (comment.trim()) {
      const newComment = {
        id: Date.now(),
        author: 'You',
        text: comment,
        timestamp: 'Just now'
      };
      setComments([newComment, ...comments]);
      setComment('');
    }
  };

  return (
    <div className={styles.trackDetail}>
      <div className={styles.container}>
        {/* Hero Section */}
        <div className={styles.hero}>
          <div className={styles.artworkContainer}>
            <img 
              src={track.artwork} 
              alt={track.title}
              className={styles.artwork}
            />
            <div className={styles.playOverlay}>
              <button onClick={handlePlayClick} className={styles.playButton}>
                {currentTrack?.id === track.id && isPlaying ? (
                  <Pause size={32} />
                ) : (
                  <Play size={32} />
                )}
              </button>
            </div>
            <div className={styles.lockStatus}>
              {isUnlocked ? (
                <Unlock size={20} className={styles.unlocked} />
              ) : (
                <Lock size={20} className={styles.locked} />
              )}
            </div>
          </div>

          <div className={styles.trackInfo}>
            <div className={styles.metadata}>
              <span className={styles.genre}>{track.genre}</span>
              <span className={styles.duration}>{track.duration}</span>
            </div>
            
            <h1 className={styles.title}>{track.title}</h1>
            <Link to={`/artist/${1}`} className={styles.artist}>
              by {track.artist}
            </Link>

            <div className={styles.stats}>
              <div className={styles.statItem}>
                <TrendingUp size={18} />
                <span>{track.coinPrice} ETH</span>
              </div>
              <div className={styles.statItem}>
                <Users size={18} />
                <span>{track.holders} holders</span>
              </div>
              <div className={styles.statItem}>
                <Play size={18} />
                <span>{track.playCount.toLocaleString()} plays</span>
              </div>
            </div>

            <div className={styles.actions}>
              {isUnlocked ? (
                <button className={styles.playFullButton} onClick={handlePlayClick}>
                  <Play size={18} />
                  Play Full Track
                </button>
              ) : (
                <button 
                  className={styles.unlockButton}
                  onClick={handleUnlockClick}
                >
                  <Lock size={18} />
                  Unlock for {track.coinPrice} ETH
                </button>
              )}
              
              <div className={styles.secondaryActions}>
                <button 
                  onClick={() => setIsLiked(!isLiked)}
                  className={`${styles.actionButton} ${isLiked ? styles.liked : ''}`}
                >
                  <Heart size={18} />
                </button>
                <button onClick={handleShare} className={styles.actionButton}>
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Collaborators Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Collaborators</h2>
          <div className={styles.collaborators}>
            {track.collaborators.map((collab, index) => (
              <div key={index} className={styles.collaborator}>
                <div className={styles.collabAvatar}>
                  {collab.name.charAt(0)}
                </div>
                <div className={styles.collabInfo}>
                  <h3 className={styles.collabName}>{collab.name}</h3>
                  <p className={styles.collabRole}>{collab.role}</p>
                </div>
                <div className={styles.collabPercentage}>
                  {collab.percentage}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trading History */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Trading History</h2>
          <div className={styles.tradingChart}>
            <div className={styles.chartPlaceholder}>
              <TrendingUp size={48} />
              <p>Price Chart Coming Soon</p>
              <div className={styles.priceInfo}>
                <span className={styles.currentPrice}>Current: {track.coinPrice} ETH</span>
                <span className={styles.priceChange}>+12.5% (24h)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <MessageCircle size={20} />
            Comments
          </h2>
          <div className={styles.comments}>
            <div className={styles.commentForm}>
              <textarea 
                placeholder="Share your thoughts..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className={styles.commentInput}
              />
              <button 
                onClick={handleCommentSubmit}
                className={styles.commentSubmit}
                disabled={!comment.trim()}
              >
                Post Comment
              </button>
            </div>
            
            <div className={styles.commentsList}>
              {comments.map((comment) => (
                <div key={comment.id} className={styles.comment}>
                  <div className={styles.commentAvatar}>
                    {comment.author.charAt(0)}
                  </div>
                  <div className={styles.commentContent}>
                    <div className={styles.commentHeader}>
                      <span className={styles.commentAuthor}>{comment.author}</span>
                      <span className={styles.commentTime}>{comment.timestamp}</span>
                    </div>
                    <p className={styles.commentText}>{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <UnlockModal
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        track={track}
        onUnlock={handleUnlock}
      />
    </div>
  );
};

export default TrackDetail;