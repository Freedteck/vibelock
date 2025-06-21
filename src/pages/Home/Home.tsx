import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Users, Music, ChevronRight } from 'lucide-react';
import TrackCard from '../../components/TrackCard/TrackCard';
import { mockTracks, mockArtists, Track } from '../../data/mockData';
import { useAppContext } from '../../context/AppContext';
import styles from './Home.module.css';

interface HomeProps {
  onTrackPlay: (track: Track, trackList?: Track[]) => void;
  currentTrack: Track | null;
  isPlaying: boolean;
}

const Home: React.FC<HomeProps> = ({ onTrackPlay, currentTrack, isPlaying }) => {
  const { state } = useAppContext();
  const [trendingTracks] = useState(state.tracks.slice(0, 6));
  const [featuredArtists] = useState(mockArtists.slice(0, 4));
  const [recentReleases] = useState(state.tracks.slice(3, 9));

  const handleTrackPlay = (track: Track) => {
    onTrackPlay(track, state.tracks);
  };

  return (
    <div className={styles.home}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Unlock the Beat, <span className={styles.gradientText}>Own the Vibe</span>
          </h1>
          <p className={styles.heroDescription}>
            Discover exclusive music previews, support your favorite artists, and unlock full tracks 
            by purchasing song coins. Welcome to the future of music ownership.
          </p>
          <div className={styles.heroStats}>
            <div className={styles.statItem}>
              <Music className={styles.statIcon} />
              <div>
                <div className={styles.statNumber}>{state.tracks.length.toLocaleString()}</div>
                <div className={styles.statLabel}>Tracks</div>
              </div>
            </div>
            <div className={styles.statItem}>
              <Users className={styles.statIcon} />
              <div>
                <div className={styles.statNumber}>5,467</div>
                <div className={styles.statLabel}>Artists</div>
              </div>
            </div>
            <div className={styles.statItem}>
              <TrendingUp className={styles.statIcon} />
              <div>
                <div className={styles.statNumber}>$127K</div>
                <div className={styles.statLabel}>Traded</div>
              </div>
            </div>
          </div>
          <div className={styles.heroActions}>
            <Link to="/discover" className={styles.primaryButton}>
              Explore Music
            </Link>
            <Link to="/upload" className={styles.secondaryButton}>
              Upload Track
            </Link>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.floatingCards}>
            {trendingTracks.slice(0, 3).map((track, index) => (
              <div 
                key={track.id}
                className={`${styles.floatingCard} ${styles[`float${index + 1}`]}`}
                onClick={() => handleTrackPlay(track)}
              >
                <img src={track.artwork} alt={track.title} />
                <div className={styles.cardOverlay}>
                  <div className={styles.cardTitle}>{track.title}</div>
                  <div className={styles.cardArtist}>{track.artist}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Tracks */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <TrendingUp className={styles.sectionIcon} />
            Trending Now
          </h2>
          <Link to="/discover" className={styles.sectionLink}>
            View All <ChevronRight size={16} />
          </Link>
        </div>
        <div className={styles.tracksGrid}>
          {trendingTracks.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              onPlay={handleTrackPlay}
              isPlaying={currentTrack?.id === track.id && isPlaying}
              size="medium"
            />
          ))}
        </div>
      </section>

      {/* Featured Artists */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <Users className={styles.sectionIcon} />
            Featured Artists
          </h2>
          <Link to="/discover" className={styles.sectionLink}>
            View All <ChevronRight size={16} />
          </Link>
        </div>
        <div className={styles.artistsGrid}>
          {featuredArtists.map((artist) => (
            <Link 
              key={artist.id}
              to={`/artist/${artist.id}`}
              className={styles.artistCard}
            >
              <div className={styles.artistBanner}>
                <img src={artist.banner} alt={artist.name} />
              </div>
              <div className={styles.artistInfo}>
                <img 
                  src={artist.avatar} 
                  alt={artist.name}
                  className={styles.artistAvatar}
                />
                <div className={styles.artistDetails}>
                  <h3 className={styles.artistName}>{artist.name}</h3>
                  <p className={styles.artistStats}>
                    {artist.followers.toLocaleString()} followers • {artist.totalTracks} tracks
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Releases */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <Music className={styles.sectionIcon} />
            Recent Releases
          </h2>
          <Link to="/discover" className={styles.sectionLink}>
            View All <ChevronRight size={16} />
          </Link>
        </div>
        <div className={styles.tracksGrid}>
          {recentReleases.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              onPlay={handleTrackPlay}
              isPlaying={currentTrack?.id === track.id && isPlaying}
              size="medium"
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;