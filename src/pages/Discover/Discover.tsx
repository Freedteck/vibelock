import React, { useState, useMemo, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import CompactTrackCard from "../../components/CompactTrackCard/CompactTrackCard";
import styles from "./Discover.module.css";
import { CoinTrack, genres } from "../../models";
import { useAppContext } from "../../context/AppContext";
import MusicPulseLoader from "../../components/MusicPulseLoader/MusicPulseLoader";

interface DiscoverProps {
  onTrackPlay: (track: CoinTrack) => void;
  currentTrack: CoinTrack | null;
  isPlaying: boolean;
}

const Discover: React.FC<DiscoverProps> = ({
  onTrackPlay,
  currentTrack,
  isPlaying,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [tracks, setTracks] = useState<any[]>([]);
  const { trackLoading, tracks: trackList } = useAppContext();

  useEffect(() => {
    if (!trackLoading) {
      setTracks(trackList);
    }
  }, [trackLoading, trackList]);

  const filteredAndSortedTracks = useMemo(() => {
    let result = [...tracks];

    // Filter by search query
    if (searchQuery) {
      result = result.filter(
        (track) =>
          track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
          track.genre.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by genre
    if (selectedGenre !== "All") {
      result = result.filter((track) => track.genre === selectedGenre);
    }

    // Sort tracks
    switch (sortBy) {
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.releaseDate).getTime() -
            new Date(a.releaseDate).getTime()
        );
        break;
      case "popular":
        result.sort((a, b) => b.playCount - a.playCount);
        break;
      case "price-low":
        result.sort((a, b) => a.coinPrice - b.coinPrice);
        break;
      case "price-high":
        result.sort((a, b) => b.coinPrice - a.coinPrice);
        break;
      case "holders":
        result.sort((a, b) => b.uniqueHolders - a.uniqueHolders);
        break;
    }

    return result;
  }, [tracks, searchQuery, selectedGenre, sortBy]);

  return (
    <div className={styles.discover}>
      {/* Search Section */}
      <div className={styles.searchSection}>
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search tracks, artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`${styles.filterButton} ${
            showFilters ? styles.active : ""
          }`}
        >
          <Filter size={20} />
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="holders">Most Holders</option>
            </select>
          </div>
        </div>
      )}

      {/* Genre Pills */}
      <div className={styles.genrePills}>
        <button
          onClick={() => setSelectedGenre("All")}
          className={`${styles.genrePill} ${
            selectedGenre === "All" ? styles.active : ""
          }`}
        >
          All
        </button>
        {genres.map((genre) => (
          <button
            key={genre}
            onClick={() => setSelectedGenre(genre)}
            className={`${styles.genrePill} ${
              selectedGenre === genre ? styles.active : ""
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <div className={styles.resultsInfo}>
        <p className={styles.resultsCount}>
          {filteredAndSortedTracks.length} track
          {filteredAndSortedTracks.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* Tracks Grid */}
      {trackLoading ? (
        <MusicPulseLoader size="large" text="Loading tracks..." />
      ) : (
        <div className={styles.tracksGrid}>
          {filteredAndSortedTracks.length > 0 ? (
            filteredAndSortedTracks.map((track) => (
              <CompactTrackCard
                key={track.id}
                track={track}
                onPlay={onTrackPlay}
                isPlaying={currentTrack?.id === track.id && isPlaying}
                size="medium"
              />
            ))
          ) : (
            <div className={styles.noResults}>
              <h3>No tracks found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Discover;
