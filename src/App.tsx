import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppProvider, useAppContext } from "./context/AppContext";
import Header from "./components/Header/Header";
import MobileHeader from "./components/MobileHeader/MobileHeader";
import BottomNavigation from "./components/BottomNavigation/BottomNavigation";
import BottomPlayer from "./components/BottomPlayer/BottomPlayer";
import NotificationModal from "./components/NotificationModal/NotificationModal";
import Home from "./pages/Home/Home";
import Discover from "./pages/Discover/Discover";
import TrackDetail from "./pages/TrackDetail/TrackDetail";
import Upload from "./pages/Upload/Upload";
import ArtistProfile from "./pages/ArtistProfile/ArtistProfile";
import Dashboard from "./pages/Dashboard/Dashboard";
import { useNotification } from "./hooks/useNotification";
import "./styles/globals.css";
import { setApiKey } from "@zoralabs/coins-sdk";
import CreateArtistProfile from "./pages/CreateArtistProfile/CreateArtistProfile";
import { CoinTrack } from "./models";

function AppContent() {
  const { tracks } = useAppContext();
  const [currentTrack, setCurrentTrack] = useState<CoinTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState<CoinTrack[]>(tracks);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [shuffledPlaylist, setShuffledPlaylist] = useState<CoinTrack[]>([]);
  const [isShuffled, setIsShuffled] = useState(false);

  const { notification, hideNotification } = useNotification();

  // TODO: Set Zora API Key
  useEffect(() => {
    setApiKey(`${import.meta.env.VITE_ZORA_API_KEY}`);
  }, []);

  const toggleShuffle = () => {
    if (!isShuffled) {
      // Create a shuffled copy of the playlist without the current track
      const shuffled = [...playlist];
      const currentTrackItem = shuffled.splice(currentTrackIndex, 1)[0];

      // Fisher-Yates shuffle algorithm
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      // Put current track at the beginning
      shuffled.unshift(currentTrackItem);
      setShuffledPlaylist(shuffled);
      setCurrentTrackIndex(0);
    }

    setIsShuffled(!isShuffled);
  };

  const handleTrackPlay = (
    track: CoinTrack,
    trackList: CoinTrack[] = tracks
  ) => {
    if (trackList) {
      setPlaylist(trackList);
      const index = trackList.findIndex((t) => t.id === track.id);
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
    const prevIndex =
      currentTrackIndex === 0
        ? activePlaylist.length - 1
        : currentTrackIndex - 1;

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

        <main style={{ paddingBottom: currentTrack ? "160px" : "80px" }}>
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
            <Route
              path="/create-artist-profile"
              element={<CreateArtistProfile />}
            />
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
          isShuffled={isShuffled}
          onShuffle={toggleShuffle}
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
