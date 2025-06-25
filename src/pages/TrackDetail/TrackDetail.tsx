import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Play,
  Pause,
  Lock,
  Unlock,
  Users,
  TrendingUp,
  MessageCircle,
  Share2,
  Heart,
} from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import UnlockModal from "../../components/UnlockModal/UnlockModal";
import WalletModal from "../../components/WalletModal/WalletModal";
import MobileHeader from "../../components/MobileHeader/MobileHeader";
import styles from "./TrackDetail.module.css";
import { CoinTrack } from "../../models";

interface TrackDetailProps {
  onTrackPlay: (track: CoinTrack) => void;
  currentTrack: CoinTrack | null;
  isPlaying: boolean;
}

const TrackDetail: React.FC<TrackDetailProps> = ({
  onTrackPlay,
  currentTrack,
  isPlaying,
}) => {
  const { id } = useParams<{ id: string }>();
  const [track, setTrack] = useState<any>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([
    {
      id: 1,
      author: "MusicFan",
      text: "This track is absolutely incredible! 🔥",
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      author: "CryptoVibes",
      text: "Can't wait to unlock the full version!",
      timestamp: "5 hours ago",
    },
  ]);

  const { tracks, trackLoading } = useAppContext();

  useEffect(() => {
    if (!trackLoading && tracks.length > 0 && id) {
      const foundTrack = tracks.find((t) => t.id === id);

      if (foundTrack) {
        setTrack(foundTrack);
      } else {
        console.warn(`Track with ID ${id} not found`);
        setTrack(null);
      }
    }
  }, [id, trackLoading, tracks]);

  const isUnlocked = false;

  if (!track) {
    return (
      <div className={styles.container}>
        <MobileHeader title="Track Not Found" showBack={true} />
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
    if (!showWalletModal) {
      setShowWalletModal(true);
      return;
    }
    setShowUnlockModal(true);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: track.title,
          text: `Check out ${track.title} by ${track.artist}`,
          url: window.location.href,
        })
        .catch(() => {
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
        author: "You",
        text: comment,
        timestamp: "Just now",
      };
      setComments([newComment, ...comments]);
      setComment("");
    }
  };

  return (
    <div className={styles.trackDetail}>
      <MobileHeader title={track.title} showBack={true} />

      <div className={styles.container}>
        {/* Hero Section */}
        <div className={styles.hero}>
          <div className={styles.artworkContainer}>
            <img
              src={track.artworkUrl}
              alt={track.title}
              className={styles.artwork}
            />
            <div className={styles.playOverlay}>
              <button onClick={handlePlayClick} className={styles.playButton}>
                {currentTrack?.id === track.id && isPlaying ? (
                  <Pause size={24} />
                ) : (
                  <Play size={24} />
                )}
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
            <div className={styles.metadata}>
              <span className={styles.genre}>{track.genre}</span>
              <span className={styles.duration}>{track.duration}</span>
            </div>

            <h1 className={styles.title}>{track.title}</h1>
            <Link to={`/artist/${1}`} className={styles.artist}>
              {track.artist}
            </Link>

            <div className={styles.stats}>
              <div className={styles.statItem}>
                <TrendingUp size={16} />
                <span>{track.coinPrice} ETH</span>
              </div>
              <div className={styles.statItem}>
                <Users size={16} />
                <span>{track.holders}</span>
              </div>
              <div className={styles.statItem}>
                <Play size={16} />
                <span>{track?.playCount?.toString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actions}>
          {isUnlocked ? (
            <button className={styles.playFullButton} onClick={handlePlayClick}>
              <Play size={18} />
              Play Full Track
            </button>
          ) : (
            <button className={styles.unlockButton} onClick={handleUnlockClick}>
              <Lock size={18} />
              Unlock for {track.coinPrice} ETH
            </button>
          )}

          <div className={styles.secondaryActions}>
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`${styles.actionButton} ${
                isLiked ? styles.liked : ""
              }`}
            >
              <Heart size={18} />
            </button>
            <button onClick={handleShare} className={styles.actionButton}>
              <Share2 size={18} />
            </button>
          </div>
        </div>

        {/* Collaborators Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Collaborators</h2>
          <div className={styles.collaboratorsScroll}>
            {track.collaborators.map((collab: any, index: number) => (
              <div key={index} className={styles.collaboratorChip}>
                <div className={styles.collabAvatar}>
                  {collab.name.charAt(0)}
                </div>
                <div className={styles.collabInfo}>
                  <span className={styles.collabName}>{collab.name}</span>
                  <span className={styles.collabRole}>{collab.role}</span>
                </div>
                <span className={styles.collabPercentage}>
                  {collab.percentage}%
                </span>
              </div>
            ))}
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
                Post
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
                      <span className={styles.commentAuthor}>
                        {comment.author}
                      </span>
                      <span className={styles.commentTime}>
                        {comment.timestamp}
                      </span>
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
        onUnlock={(): Promise<void> => Promise.resolve()}
      />

      <WalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
      />
    </div>
  );
};

export default TrackDetail;
