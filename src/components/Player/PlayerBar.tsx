import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  Heart,
  MoreHorizontal,
  Maximize2
} from 'lucide-react';
import { CoinTrack } from '../../models';
import { useAppContext } from '../../context/AppContext';
import { useWallet } from '../../hooks/useWallet';
import AudioVisualizer from './AudioVisualizer';
import FullScreenPlayer from './FullScreenPlayer';

interface PlayerBarProps {
  currentTrack: CoinTrack;
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
  volume: number;
  onVolumeChange: (volume: number) => void;
  isMuted: boolean;
  onMuteToggle: () => void;
}

const PlayerBar: React.FC<PlayerBarProps> = ({
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
  volume,
  onVolumeChange,
  isMuted,
  onMuteToggle
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [audioData, setAudioData] = useState<Uint8Array | null>(null);
  
  const { profileBalances } = useAppContext();
  const { walletAddress } = useWallet();

  const isUnlocked = profileBalances?.some((balance: any) => balance.id === currentTrack.id) ||
    currentTrack?.collaborators?.some((collab: any) => collab.walletAddress === walletAddress);

  const audioUrl = isUnlocked ? currentTrack.premiumAudio : currentTrack.mediaUrl;

  // Audio event handlers
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
        audio.play().catch(console.error);
      }
    };
    const handleError = () => {
      setIsLoading(false);
      console.error('Audio failed to load');
    };
    const handleEnded = () => {
      if (repeatMode === "one") {
        audio.currentTime = 0;
        audio.play();
      } else {
        onTrackEnd();
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack, isPlaying, repeatMode, onTrackEnd]);

  // Play/pause control
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying && audio.paused && !isLoading) {
      audio.play().catch(console.error);
    } else if (!isPlaying && !audio.paused) {
      audio.pause();
    }
  }, [isPlaying, currentTrack, isLoading]);

  // Volume control
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Reset on track change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    audio.currentTime = 0;
    setCurrentTime(0);
    setDuration(0);
  }, [currentTrack]);

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

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        crossOrigin="anonymous"
      />

      {/* Desktop Player Bar */}
      <div className="player-bar desktop-only">
        <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
          {/* Track Info */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <img
              src={currentTrack.artworkUrl}
              alt={currentTrack.title}
              className="w-14 h-14 rounded-lg object-cover shadow-lg"
            />
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-white truncate">
                {currentTrack.title}
              </h4>
              <p className="text-sm text-gray-400 truncate">
                {currentTrack.artist}
              </p>
            </div>
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`p-2 rounded-full transition-colors ${
                isLiked ? 'text-green-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Main Controls */}
          <div className="flex flex-col items-center gap-2 flex-1 max-w-2xl">
            <div className="flex items-center gap-4">
              <button
                onClick={onShuffle}
                className={`p-2 rounded-full transition-colors ${
                  isShuffled ? 'text-green-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Shuffle size={18} />
              </button>
              
              <button
                onClick={onPrevious}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <SkipBack size={20} />
              </button>
              
              <button
                onClick={onPlayPause}
                className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause size={20} />
                ) : (
                  <Play size={20} className="ml-0.5" />
                )}
              </button>
              
              <button
                onClick={onNext}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <SkipForward size={20} />
              </button>
              
              <button
                onClick={onRepeat}
                className={`p-2 rounded-full transition-colors relative ${
                  repeatMode !== 'none' ? 'text-green-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Repeat size={18} />
                {repeatMode === 'one' && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 text-black text-xs rounded-full flex items-center justify-center font-bold">
                    1
                  </span>
                )}
              </button>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-3 w-full">
              <span className="text-xs text-gray-400 w-10 text-right">
                {formatTime(currentTime)}
              </span>
              <div className="flex-1 relative group">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #1db954 0%, #1db954 ${progress}%, #4b5563 ${progress}%, #4b5563 100%)`
                  }}
                />
              </div>
              <span className="text-xs text-gray-400 w-10">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            <AudioVisualizer 
              audioRef={audioRef}
              isPlaying={isPlaying}
              onDataUpdate={setAudioData}
            />
            
            <button
              onClick={onMuteToggle}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            
            <div className="w-24 relative group">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #1db954 0%, #1db954 ${(isMuted ? 0 : volume) * 100}%, #4b5563 ${(isMuted ? 0 : volume) * 100}%, #4b5563 100%)`
                }}
              />
            </div>

            <button
              onClick={() => setShowFullScreen(true)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <Maximize2 size={18} />
            </button>

            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <MoreHorizontal size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Mini Player */}
      <div className="mobile-only fixed bottom-20 left-0 right-0 bg-gray-900 border-t border-gray-800 z-40">
        <div className="relative">
          {/* Progress Bar */}
          <div className="h-1 bg-gray-700">
            <div 
              className="h-full bg-green-400 transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Player Content */}
          <div 
            className="flex items-center justify-between p-3"
            onClick={() => setShowFullScreen(true)}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <img
                src={currentTrack.artworkUrl}
                alt={currentTrack.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-white truncate text-sm">
                  {currentTrack.title}
                </h4>
                <p className="text-xs text-gray-400 truncate">
                  {currentTrack.artist}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLiked(!isLiked);
                }}
                className={`p-2 ${isLiked ? 'text-green-400' : 'text-gray-400'}`}
              >
                <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayPause();
                }}
                className="p-2 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause size={24} />
                ) : (
                  <Play size={24} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full Screen Player */}
      <FullScreenPlayer
        isOpen={showFullScreen}
        onClose={() => setShowFullScreen(false)}
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
        volume={volume}
        onVolumeChange={onVolumeChange}
        isMuted={isMuted}
        onMuteToggle={onMuteToggle}
        audioData={audioData}
        isLiked={isLiked}
        onLikeToggle={() => setIsLiked(!isLiked)}
      />

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #1db954;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s;
        }
        
        .slider:hover::-webkit-slider-thumb,
        .group:hover .slider::-webkit-slider-thumb {
          opacity: 1;
        }
        
        .slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #1db954;
          cursor: pointer;
          border: none;
          opacity: 0;
          transition: opacity 0.2s;
        }
        
        .slider:hover::-moz-range-thumb,
        .group:hover .slider::-moz-range-thumb {
          opacity: 1;
        }
      `}</style>
    </>
  );
};

export default PlayerBar;