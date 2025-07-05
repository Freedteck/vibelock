import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  TrendingUp, 
  Users, 
  Music, 
  ChevronRight, 
  Play, 
  Pause,
  Search
} from "lucide-react";
import CompactTrackCard from "../../components/CompactTrackCard/CompactTrackCard";
import HorizontalScroll from "../../components/HorizontalScroll/HorizontalScroll";
import styles from "./Home.module.css";
import { CoinTrack } from "../../models";
import { useAppContext } from "../../context/AppContext";
import { Artist } from "../../client/supabase";
import { formatUserAddress } from "../../client/helper";
import MusicPulseLoader from "../../components/MusicPulseLoader/MusicPulseLoader";

interface HomeProps {
  onTrackPlay: (track: CoinTrack, trackList?: CoinTrack[]) => void;
  currentTrack: CoinTrack | null;
  isPlaying: boolean;
}

const Home: React.FC<HomeProps> = ({
  onTrackPlay,
  currentTrack,
  isPlaying,
}) => {
  const [trendingTracks, setTrendingTracks] = useState<any[]>([]);
  const [featuredArtists, setFeaturedArtists] = useState<Artist[]>([]);
  const [recentReleases, setRecentReleases] = useState<any[]>([]);
  const [featuredTrack, setFeaturedTrack] = useState<any>({});
  const [tracks, setTracks] = useState<any[]>([]);
  const {
    trackLoading,
    tracks: trackList,
    artists,
    artistLoading,
  } = useAppContext();

  useEffect(() => {
    if (!trackLoading) {
      setTracks(trackList);
      setTrendingTracks(
        trackList?.filter((track) => track.uniqueHolders > 2).slice(0, 10)
      );
      setRecentReleases(
        trackList
          .sort((a: CoinTrack, b: CoinTrack) => {
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          })
          .slice(0, 10)
      );
      setFeaturedTrack(trackList.find((track) => track.isNew) || trackList[0]);
    }
  }, [trackLoading, trackList]);

  useEffect(() => {
    if (!artistLoading) {
      setFeaturedArtists(artists?.slice(0, 6) || []);
    }
  }, [artistLoading, artists]);

  const handleTrackPlay = (track: CoinTrack) => {
    onTrackPlay(track);
  };

  return (
    <div className={styles.home}>
      {/* Hero Section with Welcome */}
      {trackLoading ? (
        <div style={{ padding: "64px 16px" }}>
          <MusicPulseLoader size="large" text="Loading your music experience..." />
        </div>
      ) : (
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.welcomeSection}>
              <h1 className={styles.welcomeTitle}>Welcome to VibeLock</h1>
              <p className={styles.welcomeSubtitle}>
                Discover, unlock, and own the music you love
              </p>
            </div>

            <div className={styles.featuredTrack} onClick={() => handleTrackPlay(featuredTrack)}>
              <img
                src={featuredTrack?.artworkUrl}
                alt={featuredTrack?.title}
                className={styles.featuredArtwork}
              />
              <div className={styles.featuredInfo}>
                <div className={styles.featuredLabel}>
                  <TrendingUp size={14} />
                  Featured Track
                </div>
                <h2 className={styles.featuredTitle}>{featuredTrack?.title}</h2>
                <p className={styles.featuredArtist}>
                  by {featuredTrack?.artist}
                </p>
                <div className={styles.featuredStats}>
                  <div className={styles.featuredStat}>
                    <Users size={14} />
                    <span>{featuredTrack?.uniqueHolders} holders</span>
                  </div>
                  <div className={styles.featuredStat}>
                    <TrendingUp size={14} />
                    <span>${featuredTrack?.marketCap}</span>
                  </div>
                </div>
                <button className={styles.playButton}>
                  {currentTrack?.id === featuredTrack?.id && isPlaying ? (
                    <Pause size={18} />
                  ) : (
                    <Play size={18} />
                  )}
                  {currentTrack?.id === featuredTrack?.id && isPlaying
                    ? "Playing"
                    : "Play Now"}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Quick Stats */}
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Music size={28} />
            </div>
            <div className={styles.statNumber}>{tracks.length}</div>
            <div className={styles.statLabel}>Total Tracks</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Users size={28} />
            </div>
            <div className={styles.statNumber}>5.4K</div>
            <div className={styles.statLabel}>Active Users</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <TrendingUp size={28} />
            </div>
            <div className={styles.statNumber}>$127K</div>
            <div className={styles.statLabel}>Volume Traded</div>
          </div>
        </div>
      </section>

      {/* Trending Tracks */}
      {trackLoading ? (
        <div style={{ padding: "32px 16px" }}>
          <MusicPulseLoader text="Loading trending tracks..." />
        </div>
      ) : (
        <HorizontalScroll title="Trending Now">
          {trendingTracks.map((track) => (
            <CompactTrackCard
              key={track.id}
              track={track}
              onPlay={handleTrackPlay}
              isPlaying={currentTrack?.id === track.id && isPlaying}
              size="medium"
            />
          ))}
        </HorizontalScroll>
      )}

      {/* Featured Artists */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <div className={styles.sectionIcon}>
              <Users size={20} />
            </div>
            Featured Artists
          </h2>
          <Link to="/discover" className={styles.sectionLink}>
            View All <ChevronRight size={16} />
          </Link>
        </div>
        <div className={styles.artistsScroll}>
          {featuredArtists.map((artist) => (
            <Link
              key={artist?.id}
              to={`/artist/${artist?.id}`}
              className={styles.artistCard}
            >
              <img
                src={artist.profile_image}
                alt={artist.full_name}
                className={styles.artistAvatar}
              />
              <div className={styles.artistInfo}>
                <h3 className={styles.artistName}>{artist.full_name}</h3>
                <p className={styles.artistStats}>
                  {formatUserAddress(artist.wallet_address)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Releases */}
      {trackLoading ? (
        <div style={{ padding: "32px 16px" }}>
          <MusicPulseLoader text="Loading recent releases..." />
        </div>
      ) : (
        <HorizontalScroll title="Fresh Releases">
          {recentReleases.map((track) => (
            <CompactTrackCard
              key={track.id}
              track={track}
              onPlay={handleTrackPlay}
              isPlaying={currentTrack?.id === track.id && isPlaying}
              size="medium"
            />
          ))}
        </HorizontalScroll>
      )}

      {/* Discover More CTA */}
      <section className={styles.discoverSection}>
        <div className={styles.discoverCard}>
          <div className={styles.discoverContent}>
            <h3 className={styles.discoverTitle}>Ready to Explore?</h3>
            <p className={styles.discoverText}>
              Dive into our vast collection of unique tracks from talented artists around the world. 
              Discover your next favorite song and support independent creators.
            </p>
            <Link to="/discover" className={styles.discoverButton}>
              <Search size={20} />
              Start Exploring
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;