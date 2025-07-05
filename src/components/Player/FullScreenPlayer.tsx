import React from 'react';
import { useGestures } from '../../hooks/useGestures';
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
  MoreHorizontal,
  Volume2,
  VolumeX,
  List
} from 'lucide-react';
import { CoinTrack } from '../../models';
import AudioVisualizer from './AudioVisualizer';

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
  volume: number;
  onVolumeChange: (volume: number) => void;
  isMuted: boolean;
  onMuteToggle: () => void;
  audioData?: Uint8Array | null;
  isLiked: boolean;
  onLikeToggle: () => void;
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
  volume,
  onVolumeChange,
  isMuted,
  onMuteToggle,
  audioData,
  isLiked,
  onLikeToggle
}) => {
  const gestureRef = useGestures({
    onSwipeDown: onClose,
    onSwipeLeft: onNext,
    onSwipeRight: onPrevious,
    threshold: 50
  });

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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentTrack.title,
          text: `Check out ${currentTrack.title} by ${currentTrack.artist}`,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-black to-black z-50 flex flex-col animate-slide-up">
      <div ref={gestureRef} className="flex-1 flex flex-col safe-area-top">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-2">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white"
          >
            <ChevronDown size={24} />
          </button>
          
          <div className="text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wider">
              Playing from {isShuffled ? 'Shuffled ' : ''}Playlist
            </p>
          </div>
          
          <button
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white"
          >
            <MoreHorizontal size={20} />
          </button>
        </div>

        {/* Album Art & Visualizer */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-4">
          <div className="relative w-full max-w-sm aspect-square mb-8">
            <img
              src={currentTrack.artworkUrl}
              alt={currentTrack.title}
              className="w-full h-full object-cover rounded-2xl shadow-2xl"
            />
            
            {/* Floating visualizer */}
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-black/40 backdrop-blur-md rounded-full px-4 py-2">
                <AudioVisualizer
                  audioRef={audioRef}
                  isPlaying={isPlaying}
                  size="medium"
                  barCount={8}
                />
              </div>
            </div>
          </div>

          {/* Track Info */}
          <div className="text-center mb-8 w-full">
            <h1 className="text-2xl font-bold text-white mb-2 px-4">
              {currentTrack.title}
            </h1>
            <p className="text-lg text-gray-300 mb-4">
              {currentTrack.artist}
            </p>
            
            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={onLikeToggle}
                className={`p-3 rounded-full transition-colors ${
                  isLiked ? 'text-green-400' : 'text-gray-400'
                }`}
              >
                <Heart size={24} fill={isLiked ? 'currentColor' : 'none'} />
              </button>
              
              <button
                onClick={handleShare}
                className="p-3 rounded-full text-gray-400 hover:text-white transition-colors"
              >
                <Share2 size={24} />
              </button>
              
              <button className="p-3 rounded-full text-gray-400 hover:text-white transition-colors">
                <List size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-8 mb-6">
          <div className="relative mb-2">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer slider-full"
              style={{
                background: `linear-gradient(to right, #1db954 0%, #1db954 ${progress}%, #4b5563 ${progress}%, #4b5563 100%)`
              }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="px-8 mb-8">
          <div className="flex items-center justify-center gap-8 mb-6">
            <button
              onClick={onShuffle}
              className={`p-2 transition-colors ${
                isShuffled ? 'text-green-400' : 'text-gray-400'
              }`}
            >
              <Shuffle size={24} />
            </button>
            
            <button
              onClick={onPrevious}
              className="p-2 text-white hover:scale-110 transition-transform"
            >
              <SkipBack size={32} />
            </button>
            
            <button
              onClick={onPlayPause}
              className="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-2xl"
            >
              {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
            </button>
            
            <button
              onClick={onNext}
              className="p-2 text-white hover:scale-110 transition-transform"
            >
              <SkipForward size={32} />
            </button>
            
            <button
              onClick={onRepeat}
              className={`p-2 transition-colors relative ${
                repeatMode !== 'none' ? 'text-green-400' : 'text-gray-400'
              }`}
            >
              <Repeat size={24} />
              {repeatMode === 'one' && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 text-black text-xs rounded-full flex items-center justify-center font-bold">
                  1
                </span>
              )}
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={onMuteToggle}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            
            <div className="w-32 relative">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer slider-full"
                style={{
                  background: `linear-gradient(to right, #1db954 0%, #1db954 ${(isMuted ? 0 : volume) * 100}%, #4b5563 ${(isMuted ? 0 : volume) * 100}%, #4b5563 100%)`
                }}
              />
            </div>
          </div>
        </div>

        {/* Queue Info */}
        <div className="px-8 pb-8 safe-area-bottom">
          <div className="text-center text-sm text-gray-400">
            <p>
              {currentIndex + 1} of {playlist.length} • Next: {playlist[currentIndex + 1]?.title || 'End of queue'}
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider-full::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #1db954;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        
        .slider-full::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #1db954;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
};

export default FullScreenPlayer;