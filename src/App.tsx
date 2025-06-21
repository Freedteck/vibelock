import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Header from './components/Header/Header';
import MobileHeader from './components/MobileHeader/MobileHeader';
import BottomNavigation from './components/BottomNavigation/BottomNavigation';
import BottomPlayer from './components/BottomPlayer/BottomPlayer';
import NotificationModal from './components/NotificationModal/NotificationModal';
import Home from './pages/Home/Home';
import Discover from './pages/Discover/Discover';
import TrackDetail from './pages/TrackDetail/TrackDetail';
import Upload from './pages/Upload/Upload';
import ArtistProfile from './pages/ArtistProfile/ArtistProfile';
import Dashboard from './pages/Dashboard/Dashboard';
import { Track } from './data/mockData';
import { useNotification } from './hooks/useNotification';
import './styles/globals.css';

function AppContent() {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [shuffledPlaylist, setShuffledPlaylist] = useState<Track[]>([]);
  const [isShuffled, setIsShuffled] = useState(false);

  const { notification, hideNotification } = useNotification();

  const handleTrackPlay = (track: Track, trackList?: Track[]) => {
    if (trackList) {
      setPlaylist(trackList);
      const index = trackList.findIndex(t => t.id === track.id);
      setCurrentTrackIndex(index);
    }

    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (playlist.length === 0) return;

    const activePlaylist = isShuffled ? shuffledPlaylist : playlist;
    const nextIndex = (currentTrackIndex + 1) % activePlaylist.length;
    
    setCurrentTrackIndex(nextIndex);
    setCurrentTrack(activePlaylist[nextIndex]);
    setIsPlaying(true);
  };

  const handlePrevious = () => {
    if (playlist.length === 0) return;

    const activePlaylist = isShuffled ? shuffledPlaylist : playlist;
    const prevIndex = currentTrackIndex === 0 ? activePlaylist.length - 1 : currentTrackIndex - 1;
    
    setCurrentTrackIndex(prevIndex);
    setCurrentTrack(activePlaylist[prevIndex]);
    setIsPlaying(true);
  };

  return (
    <Router>
      <div className="App">
        {/* Desktop Header */}
        <Header />
        
        {/* Mobile Header */}
        <MobileHeader />
        
        <main style={{ paddingBottom: currentTrack ? '160px' : '80px' }}>
          <Routes>
            <Route 
              path="/" 
              element={
                <Home 
                  onTrackPlay={handleTrackPlay}
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                />
              } 
            />
            <Route 
              path="/discover" 
              element={
                <Discover 
                  onTrackPlay={handleTrackPlay}
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                />
              } 
            />
            <Route 
              path="/track/:id" 
              element={
                <TrackDetail 
                  onTrackPlay={handleTrackPlay}
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                />
              } 
            />
            <Route path="/upload" element={<Upload />} />
            <Route path="/artist/:id" element={<ArtistProfile />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
        
        {/* Bottom Player */}
        <BottomPlayer
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onNext={handleNext}
          onPrevious={handlePrevious}
          playlist={playlist}
          currentIndex={currentTrackIndex}
        />

        {/* Bottom Navigation */}
        <BottomNavigation />

        <NotificationModal
          isOpen={notification.isOpen}
          onClose={hideNotification}
          type={notification.type}
          title={notification.title}
          message={notification.message}
        />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;