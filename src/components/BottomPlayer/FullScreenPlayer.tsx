import React from "react";
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Share2,
} from "lucide-react";
import styles from "./FullScreenPlayer.module.css";
import { CoinTrack } from "../../models";

interface FullScreenPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrack: CoinTrack;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  currentTime: number;
  duration: number;
  audioRef: React.RefObject<HTMLAudioElement>;
  isShuffled: boolean;
  onShuffle: () => void;
  repeatMode: "none" | "one" | "all";
  onRepeat: () => void;
  playlist: CoinTrack[];
  currentIndex: number;
}

const FullScreenPlayer: React.FC<FullScreenPlayerProps> = ({
  isOpen,
  onClose,
  currentTrack,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  currentTime,
  duration,
  audioRef,
  isShuffled,
  onShuffle,
  repeatMode,
  onRepeat,
  playlist,
  currentIndex,
}) => {
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
  };

  const handleTrackSelect = (index: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const track = playlist[index];
    audio.currentTime = 0;
    audio.src = track.premiumAudio || track.mediaUrl;
    audio.play().catch(console.error);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.player}>
        {/* Header */}
        <div className={styles.header}>
          <button onClick={onClose} className={styles.closeButton}>
            <ChevronDown size={24} />
          </button>
          <div className={styles.headerInfo}>
            <span className={styles.playingFrom}>
              {isShuffled ? "Shuffled Playlist" : "Playing from Playlist"}
            </span>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.actionButton}>
              <Share2 size={20} />
            </button>
          </div>
        </div>

        {/* Main Content - responsive layout */}
        <div className="leftPanel">
          {/* Album Art */}
          <div className={styles.artworkContainer}>
            <img
              src={currentTrack.artworkUrl}
              alt={currentTrack.title}
              className={styles.artwork}
            />
          </div>

          {/* Track Info */}
          <div className={styles.trackInfo}>
            <h1 className={styles.title}>{currentTrack.title}</h1>
            <p className={styles.artist}>{currentTrack.artist}</p>
          </div>

          {/* Progress */}
          <div className={styles.progressContainer}>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className={styles.progressSlider}
              style={{
                background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${progress}%, rgba(255,255,255,0.2) ${progress}%, rgba(255,255,255,0.2) 100%)`,
              }}
            />
            <div className={styles.timeInfo}>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className={styles.controls}>
            <button
              onClick={onShuffle}
              className={`${styles.controlButton} ${
                isShuffled ? styles.active : ""
              }`}
            >
              <Shuffle size={24} />
            </button>
            <button onClick={onPrevious} className={styles.controlButton}>
              <SkipBack size={28} />
            </button>
            <button onClick={onPlayPause} className={styles.playButton}>
              {isPlaying ? <Pause size={32} /> : <Play size={32} />}
            </button>
            <button onClick={onNext} className={styles.controlButton}>
              <SkipForward size={28} />
            </button>
            <button 
              onClick={onRepeat}
              className={`${styles.controlButton} ${
                repeatMode !== "none" ? styles.active : ""
              }`}
            >
              <Repeat size={24} />
              {repeatMode === "one" && (
                <span style={{
                  position: "absolute",
                  top: "-2px",
                  right: "-2px",
                  fontSize: "8px",
                  fontWeight: "bold",
                  background: "#8b5cf6",
                  color: "white",
                  borderRadius: "50%",
                  width: "12px",
                  height: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  1
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Playlist */}
        <div className={`${styles.playlistContainer} rightPanel`}>
          <div className={styles.playlist}>
            {playlist.map((track, index) => (
              <div
                key={track.id}
                className={`${styles.playlistItem} ${
                  index === currentIndex ? styles.active : ""
                }`}
                onClick={() => handleTrackSelect(index)}
              >
                <img
                  src={track.artworkUrl}
                  alt={track.title}
                  className={styles.playlistArt}
                />
                <div className={styles.playlistInfo}>
                  <h4>{track.title}</h4>
                  <p>{track.artist}</p>
                </div>
                {index === currentIndex && isPlaying && (
                  <div className={styles.nowPlayingIndicator}>Now Playing</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullScreenPlayer;