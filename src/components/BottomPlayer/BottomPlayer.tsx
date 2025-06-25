import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, ChevronUp } from "lucide-react";
import FullScreenPlayer from "./FullScreenPlayer";
import styles from "./BottomPlayer.module.css";
import { CoinTrack } from "../../models";

interface BottomPlayerProps {
  currentTrack: CoinTrack | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  playlist: CoinTrack[];
  currentIndex: number;
  isShuffled: boolean;
  onShuffle: () => void;
}

const BottomPlayer: React.FC<BottomPlayerProps> = ({
  currentTrack,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  playlist,
  currentIndex,
  isShuffled,
  onShuffle,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
    };
  }, [currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying && audio.paused) {
      audio.play().catch(console.error);
    } else if (!isPlaying && !audio.paused) {
      audio.pause();
    }
  }, [isPlaying, currentTrack]);

  if (!currentTrack) return null;

  const isUnlocked = true;
  const audioUrl = isUnlocked
    ? currentTrack.premiumAudio
    : currentTrack.mediaUrl;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        crossOrigin="anonymous"
      />

      {/* Mini Player */}
      <div className={styles.bottomPlayer}>
        <div className={styles.progressBar}>
          <div className={styles.progress} style={{ width: `${progress}%` }} />
        </div>

        <div
          className={styles.playerContent}
          onClick={() => setIsExpanded(true)}
        >
          <div className={styles.trackInfo}>
            <img
              src={currentTrack.artworkUrl}
              alt={currentTrack.title}
              className={styles.albumArt}
            />
            <div className={styles.trackDetails}>
              <h4 className={styles.trackTitle}>{currentTrack.title}</h4>
              <p className={styles.trackArtist}>{currentTrack.artist}</p>
            </div>
          </div>

          <div className={styles.controls}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrevious();
              }}
              className={styles.controlButton}
            >
              <SkipBack size={20} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlayPause();
              }}
              className={styles.playButton}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              className={styles.controlButton}
            >
              <SkipForward size={20} />
            </button>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(true);
            }}
            className={styles.expandButton}
          >
            <ChevronUp size={20} />
          </button>
        </div>
      </div>

      {/* Full Screen Player */}
      <FullScreenPlayer
        isOpen={isExpanded}
        onClose={() => setIsExpanded(false)}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onPlayPause={onPlayPause}
        onNext={onNext}
        onPrevious={onPrevious}
        currentTime={currentTime}
        duration={duration}
        audioRef={audioRef}
        isShuffled={isShuffled}
        onShuffle={onShuffle}
        playlist={playlist}
        currentIndex={currentIndex}
      />
    </>
  );
};

export default BottomPlayer;
