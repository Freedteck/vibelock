import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, ChevronUp } from "lucide-react";
import FullScreenPlayer from "./FullScreenPlayer";
import styles from "./BottomPlayer.module.css";
import { CoinTrack } from "../../models";
import { useAppContext } from "../../context/AppContext";
import { useWallet } from "../../hooks/useWallet";

interface BottomPlayerProps {
  currentTrack: CoinTrack | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onTrackEnd: () => void;
  playlist: CoinTrack[];
  currentIndex: number;
  isShuffled: boolean;
  onShuffle: () => void;
  repeatMode: "none" | "one" | "all";
  onRepeat: () => void;
}

const BottomPlayer: React.FC<BottomPlayerProps> = ({
  currentTrack,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  onTrackEnd,
  playlist,
  currentIndex,
  isShuffled,
  onShuffle,
  repeatMode,
  onRepeat,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const { profileBalances } = useAppContext();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { walletAddress } = useWallet();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (repeatMode === "one") {
        audio.currentTime = 0;
        audio.play();
      } else {
        onTrackEnd();
      }
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentTrack, repeatMode, onTrackEnd]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying && audio.paused) {
      audio.play().catch(console.error);
    } else if (!isPlaying && !audio.paused) {
      audio.pause();
    }
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    if (currentTrack) {
      setIsUnlocked(
        profileBalances?.some(
          (balance: any) => balance.id === currentTrack.id
        ) ||
          currentTrack?.collaborators?.some(
            (collab: any) => collab.walletAddress === walletAddress
          )
      );
    }
  }, [currentTrack, profileBalances, walletAddress]);

  if (!currentTrack) return null;

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
        repeatMode={repeatMode}
        onRepeat={onRepeat}
        playlist={playlist}
        currentIndex={currentIndex}
      />
    </>
  );
};

export default BottomPlayer;