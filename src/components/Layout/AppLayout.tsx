import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import DesktopSidebar from './DesktopSidebar';
import MobileNavigation from './MobileNavigation';
import PlayerBar from '../Player/PlayerBar';
import { useTheme } from '../../hooks/useTheme';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useMediaSession } from '../../hooks/useMediaSession';
import { useAppContext } from '../../context/AppContext';
import { CoinTrack } from '../../models';

interface AppLayoutProps {
  currentTrack: CoinTrack | null;
  isPlaying: boolean;
  onTrackPlay: (track: CoinTrack, trackList?: CoinTrack[]) => void;
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

const AppLayout: React.FC<AppLayoutProps> = ({
  currentTrack,
  isPlaying,
  onTrackPlay,
  onPlayPause,
  onNext,
  onPrevious,
  onTrackEnd,
  playlist,
  currentIndex,
  isShuffled,
  onShuffle,
  repeatMode,
  onRepeat
}) => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Media Session API
  useMediaSession({
    track: currentTrack,
    isPlaying,
    onPlay: onPlayPause,
    onPause: onPlayPause,
    onNext,
    onPrevious
  });

  // Keyboard Shortcuts
  useKeyboardShortcuts({
    onPlayPause,
    onNext,
    onPrevious,
    onVolumeUp: () => setVolume(prev => Math.min(1, prev + 0.1)),
    onVolumeDown: () => setVolume(prev => Math.max(0, prev - 0.1)),
    onMute: () => setIsMuted(prev => !prev),
    onSearch: () => {
      // Focus search input if available
      const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
      searchInput?.focus();
    }
  });

  // Hide player on certain pages
  const hidePlayer = ['/upload', '/create-artist-profile'].includes(location.pathname);

  return (
    <div className="app-layout">
      {/* Desktop Sidebar */}
      <DesktopSidebar 
        currentTrack={currentTrack}
        theme={theme}
        onThemeToggle={toggleTheme}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>

        {/* Player Bar */}
        {!hidePlayer && currentTrack && (
          <PlayerBar
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onPlayPause={onPlayPause}
            onNext={onNext}
            onPrevious={onPrevious}
            onTrackEnd={onTrackEnd}
            playlist={playlist}
            currentIndex={currentIndex}
            isShuffled={isShuffled}
            onShuffle={onShuffle}
            repeatMode={repeatMode}
            onRepeat={onRepeat}
            volume={volume}
            onVolumeChange={setVolume}
            isMuted={isMuted}
            onMuteToggle={() => setIsMuted(!isMuted)}
          />
        )}
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation currentTrack={currentTrack} />
    </div>
  );
};

export default AppLayout;