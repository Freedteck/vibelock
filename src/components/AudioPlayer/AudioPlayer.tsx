import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Shuffle,
  Repeat,
} from "lucide-react";
import styles from "./AudioPlayer.module.css";
import { useAppContext } from "../../context/AppContext";
import { CoinTrack } from "../../models";

interface AudioPlayerProps {
  currentTrack: CoinTrack | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  playlist: CoinTrack[];
  currentIndex: number;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  currentTrack,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  playlist,
  currentIndex,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"none" | "one" | "all">("none");
  const { profileBalances } = useAppContext();
  const [isUnlocked, setIsUnlocked] = useState(false);

  // const { state } = useAppContext();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => {
      setIsLoading(false);
      if (isPlaying && audio.paused) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Auto-play failed:", error);
          });
        }
      }
    };
    const handleError = () => {
      setIsLoading(false);
      console.error("Audio failed to load");
    };
    const handleEnded = () => {
      if (repeatMode === "one") {
        audio.currentTime = 0;
        audio.play();
      } else if (repeatMode === "all" || currentIndex < playlist.length - 1) {
        onNext();
      }
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("error", handleError);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [
    currentTrack,
    isPlaying,
    repeatMode,
    currentIndex,
    playlist.length,
    onNext,
  ]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying && audio.paused && !isLoading) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Playback failed:", error);
        });
      }
    } else if (!isPlaying && !audio.paused) {
      audio.pause();
    }
  }, [isPlaying, currentTrack, isLoading]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    audio.currentTime = 0;
    setCurrentTime(0);
    setDuration(0);
  }, [currentTrack]);

  useEffect(() => {
    if (currentTrack) {
      setIsUnlocked(
        profileBalances?.some((balance: any) => balance.id === currentTrack.id)
      );
    }
  }, [currentTrack, profileBalances]);

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
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const toggleRepeat = () => {
    setRepeatMode((prev) => {
      switch (prev) {
        case "none":
          return "all";
        case "all":
          return "one";
        case "one":
          return "none";
        default:
          return "none";
      }
    });
  };

  if (!currentTrack) return null;

  const audioUrl = isUnlocked
    ? currentTrack.premiumAudio
    : currentTrack.mediaUrl;

  return (
    <div
      className={`${styles.player} ${
        isMinimized ? styles.minimized : styles.expanded
      }`}
    >
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        crossOrigin="anonymous"
      />

      {/* Minimized Player */}
      <div className={styles.miniPlayer}>
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
            onClick={() => setIsShuffled(!isShuffled)}
            className={`${styles.controlButton} ${
              isShuffled ? styles.active : ""
            }`}
          >
            <Shuffle size={16} />
          </button>
          <button onClick={onPrevious} className={styles.controlButton}>
            <SkipBack size={18} />
          </button>
          <button
            onClick={onPlayPause}
            className={styles.playButton}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className={styles.spinner} />
            ) : isPlaying ? (
              <Pause size={20} />
            ) : (
              <Play size={20} />
            )}
          </button>
          <button onClick={onNext} className={styles.controlButton}>
            <SkipForward size={18} />
          </button>
          <button
            onClick={toggleRepeat}
            className={`${styles.controlButton} ${
              repeatMode !== "none" ? styles.active : ""
            }`}
          >
            <Repeat size={16} />
            {repeatMode === "one" && (
              <span className={styles.repeatOne}>1</span>
            )}
          </button>
        </div>

        <div className={styles.progressContainer}>
          <span className={styles.timeDisplay}>{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className={styles.progressBar}
            style={{
              background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${
                (currentTime / duration) * 100
              }%, #374151 ${(currentTime / duration) * 100}%, #374151 100%)`,
            }}
          />
          <span className={styles.timeDisplay}>{formatTime(duration)}</span>
        </div>

        <div className={styles.volumeContainer}>
          <button onClick={toggleMute} className={styles.volumeButton}>
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className={styles.volumeSlider}
          />
        </div>

        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className={styles.expandButton}
        >
          {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
        </button>
      </div>

      {/* Expanded Player */}
      {!isMinimized && (
        <div className={styles.expandedPlayer}>
          <div className={styles.waveform}>
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className={styles.waveformBar}
                style={{
                  height: `${Math.random() * 100 + 10}%`,
                  animationDelay: `${i * 0.1}s`,
                  opacity: i / 50 < currentTime / duration ? 1 : 0.3,
                }}
              />
            ))}
          </div>

          <div className={styles.playlistInfo}>
            <h3>Now Playing</h3>
            <p>
              {currentIndex + 1} of {playlist.length} tracks
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;
