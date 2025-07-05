import React, { useState, useEffect, useCallback } from "react";
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
import { useWallet } from "../../hooks/useWallet";
import { Comment, createComment, getComments } from "../../client/supabase";
import { formatCreatedAt, formatUserAddress } from "../../client/helper";
import toast from "react-hot-toast";

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
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);

  const { tracks, trackLoading, tradeCoins, profileBalances } = useAppContext();
  const { isConnected, walletAddress } = useWallet();

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

  useEffect(() => {
    if (track) {
      setIsUnlocked(
        profileBalances?.some((balance: any) => balance.id === track.id) ||
          track.collaborators.some(
            (collab: any) => collab.walletAddress === walletAddress
          )
      );
    }
  }, [track, profileBalances, walletAddress]);

  const fetchComments = useCallback(async () => {
    if (track) {
      const { data, error } = await getComments(track.id);
      if (error) {
        throw new Error(`Failed to fetch comments: ${error.message}`);
      } else {
        setComments(data || []);
      }
    }
  }, [track]);

  useEffect(() => {
    fetchComments().catch((error) => {
      console.error("Error fetching comments:", error);
    });
  }, [fetchComments]);

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
    if (!isConnected) {
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

  const handleCommentSubmit = async () => {
    if (comment.trim()) {
      const newComment: Comment = {
        coin_address: track.id,
        commenter_wallet: walletAddress!,
        message: comment.trim(),
      };

      const { error } = await toast.promise(createComment(newComment), {
        loading: "Posting comment...",
        success: "Comment posted successfully!",
        error: "Failed to post comment",
      });
      if (error) {
        console.error("Failed to post comment:", error);
        return;
      }
      fetchComments().catch((error) => {
        console.error("Error fetching comments after posting:", error);
      });
      setComment("");
    }
  };

  const handleTrade = async (
    trackAddress: string,
    amount: string,
    type: "eth" | "coin" | "usdc"
  ) => {
    try {
      const receipt = await toast.promise(
        tradeCoins({
          type: type,
          amount: amount,
          walletAddress: walletAddress!,
          coinAddress: trackAddress,
        }),
        {
          loading: "Unlocking track...",
          success: "Track unlocked successfully!",
          error: `Failed to unlock track`,
        }
      );

      return receipt;
    } catch (error) {
      throw new Error(
        `Trade failed: ${error instanceof Error ? error.message : error}`
      );
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
            <Link
              to={`/artist/${track.artistWallet}`}
              className={styles.artist}
            >
              {track.artist}
            </Link>

            <div className={styles.stats}>
              <div className={styles.statItem}>
                <TrendingUp size={16} />
                <span>${track.marketCap}</span>
              </div>
              <div className={styles.statItem}>
                <Users size={16} />
                <span>{track.uniqueHolders}</span>
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
              Unlock for Premium
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
                    {comment.commenter_wallet.slice(2, 4).toUpperCase()}
                  </div>
                  <div className={styles.commentContent}>
                    <div className={styles.commentHeader}>
                      <span className={styles.commentAuthor}>
                        {formatUserAddress(comment.commenter_wallet)}
                      </span>
                      <span className={styles.commentTime}>
                        {formatCreatedAt(comment.created_at || "")}
                      </span>
                    </div>
                    <p className={styles.commentText}>{comment.message}</p>
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
        onUnlock={handleTrade}
      />

      <WalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
      />
    </div>
  );
};

export default TrackDetail;
