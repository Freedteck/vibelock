import React, { useState } from "react";
import { Play, Pause, Lock, Unlock, Users } from "lucide-react";
import { Link } from "react-router-dom";
import styles from "./CompactTrackCard.module.css";
import { CoinTrack } from "../../models";

interface CompactTrackCardProps {
  track: CoinTrack;
  onPlay: (track: CoinTrack) => void;
  isPlaying: boolean;
  size?: "small" | "medium";
}

const CompactTrackCard: React.FC<CompactTrackCardProps> = ({
  track,
  onPlay,
  isPlaying,
  size = "medium",
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const isUnlocked = true;

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
      className={`${styles.card} ${styles[size]} ${
        isPressed ? styles.pressed : ""
      }`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className={styles.artworkContainer}>
        {track.isNew && <div className={styles.newBadge}>NEW</div>}
        <img
          src={track.artworkUrl}
          alt={track.title}
          className={styles.artwork}
        />

        <button onClick={handlePlayClick} className={styles.playButton}>
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
        <p className={styles.artist}>By {track.artist}</p>
        <div className={styles.holders}>
          <Users size={12} />
          <span>
            {track?.uniqueHolders} Holder{track?.uniqueHolders > 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default CompactTrackCard;
