import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, Users, Music, ChevronRight, Play } from "lucide-react";
import CompactTrackCard from "../../components/CompactTrackCard/CompactTrackCard";
import HorizontalScroll from "../../components/HorizontalScroll/HorizontalScroll";
import { mockArtists } from "../../data/mockData";
import styles from "./Home.module.css";
import { CoinTrack } from "../../models";
import { useAppContext } from "../../context/AppContext";

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
  const [featuredArtists] = useState(mockArtists.slice(0, 6));
  const [recentReleases, setRecentReleases] = useState<any[]>([]);
  const [featuredTrack, setFeaturedTrack] = useState<any>({});
  const [tracks, setTracks] = useState<any[]>([]);
  const { trackLoading, tracks: trackList } = useAppContext();

  useEffect(() => {
    if (!trackLoading) {
      setTracks(trackList);
      setTrendingTracks(trackList?.filter((track) => track.isNew).slice(0, 10));
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

  const handleTrackPlay = (track: CoinTrack) => {
    onTrackPlay(track);
  };

  return (
    <div className={styles.home}>
      {/* Featured Track Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.featuredTrack}>
            <img
              src={featuredTrack?.artworkUrl}
              alt={featuredTrack?.title}
              className={styles.featuredArtwork}
            />
            <div className={styles.featuredInfo}>
              <span className={styles.featuredLabel}>Featured Track</span>
              <h2 className={styles.featuredTitle}>{featuredTrack?.title}</h2>
              <p className={styles.featuredArtist}>
                by {featuredTrack?.artist}
              </p>
              <button
                onClick={() => handleTrackPlay(featuredTrack)}
                className={styles.playButton}
              >
                <Play size={20} />
                {currentTrack?.id === featuredTrack?.id && isPlaying
                  ? "Playing"
                  : "Play Now"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <Music className={styles.statIcon} />
            <div>
              <div className={styles.statNumber}>{tracks.length}</div>
              <div className={styles.statLabel}>Tracks</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <Users className={styles.statIcon} />
            <div>
              <div className={styles.statNumber}>5.4K</div>
              <div className={styles.statLabel}>Artists</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <TrendingUp className={styles.statIcon} />
            <div>
              <div className={styles.statNumber}>$127K</div>
              <div className={styles.statLabel}>Traded</div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Tracks */}
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

      {/* Featured Artists */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Featured Artists</h2>
          <Link to="/discover" className={styles.sectionLink}>
            View All <ChevronRight size={16} />
          </Link>
        </div>
        <div className={styles.artistsScroll}>
          {featuredArtists.map((artist) => (
            <Link
              key={artist.id}
              to={`/artist/${artist.id}`}
              className={styles.artistCard}
            >
              <img
                src={artist.avatar}
                alt={artist.name}
                className={styles.artistAvatar}
              />
              <div className={styles.artistInfo}>
                <h3 className={styles.artistName}>{artist.name}</h3>
                <p className={styles.artistStats}>
                  {artist.followers.toLocaleString()} followers
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Releases */}
      <HorizontalScroll title="Recent Releases">
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

      {/* Discover More */}
      <section className={styles.discoverSection}>
        <div className={styles.discoverCard}>
          <h3 className={styles.discoverTitle}>Discover More Music</h3>
          <p className={styles.discoverText}>
            Explore thousands of tracks from talented artists worldwide
          </p>
          <Link to="/discover" className={styles.discoverButton}>
            Explore Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
