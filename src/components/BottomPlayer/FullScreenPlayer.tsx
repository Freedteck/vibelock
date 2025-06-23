import React from "react";
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Heart,
  Share2,
} from "lucide-react";
import { Track } from "../../data/mockData";
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
            <span className={styles.playingFrom}>Playing from Playlist</span>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.actionButton}>
              <Share2 size={20} />
            </button>
          </div>
        </div>

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
          <button className={styles.controlButton}>
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
          <button className={styles.controlButton}>
            <Repeat size={24} />
          </button>
        </div>

        {/* Bottom Actions */}
        <div className={styles.bottomActions}>
          <button className={styles.actionButton}>
            <Heart size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FullScreenPlayer;
