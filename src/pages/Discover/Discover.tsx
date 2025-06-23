import React, { useState, useMemo, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import CompactTrackCard from "../../components/CompactTrackCard/CompactTrackCard";
import styles from "./Discover.module.css";
import { fetchMultipleCoins } from "../../client/zora";
import { getTracks } from "../../client/supabase";
import {
  formatCreatedAt,
  getContentsFromUri,
  isTrackNew,
} from "../../client/helper";
import { CoinTrack, genres, MusicTrack } from "../../models";

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

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const { data, error } = await getTracks();
        if (error) throw error;

        const { coins } = await fetchMultipleCoins(
          data?.map((track) => track.deployed_address) || []
        );

        console.log("coins: ", coins);

        const formattedTracks = await Promise.all(
          coins.map(async (coin) => {
            const supply = Number(coin.totalSupply);
            const holders = coin.uniqueHolders ?? 0;
            const tokenUri = coin.tokenUri;

            let tokenDetails: MusicTrack | undefined = undefined;
            try {
              tokenDetails = await getContentsFromUri(tokenUri || "");
            } catch (e) {
              console.error(`Failed to fetch token details for ${tokenUri}`, e);
            }

            return {
              id: coin.address,
              title: coin.name,
              artistWallet: coin.creatorAddress,
              description: coin.description,
              mimeType: coin.mediaContent?.mimeType,
              mediaUrl: coin.mediaContent?.originalUri,
              artworkUrl: coin.mediaContent?.previewImage?.medium,
              createdAt: coin.createdAt,
              formattedDate: formatCreatedAt(coin?.createdAt ?? ""),
              isNew: isTrackNew(coin?.createdAt ?? ""),
              totalSupply: supply,
              uniqueHolders: holders,
              genre: tokenDetails?.attributes[0]?.value || "Unknown",
              artist: tokenDetails?.attributes[1]?.value || "Unknown Artist",
              premiumAudio: tokenDetails?.extra?.premium_audio || "",
              collaborators: tokenDetails!.extra?.collaborators || [],
            };
          })
        );

        console.log("Formatted Tracks: ", formattedTracks);
        setTracks(formattedTracks);
        return formattedTracks;
      } catch (error) {
        console.error("Error fetching coin data:", error);
        return []; // Return empty array on error
      }
    };
    fetchCoins();
  }, []);

  const filteredAndSortedTracks = useMemo(() => {
    // Filter by search query
    if (searchQuery) {
      setTracks((prevTracks) =>
        prevTracks.filter(
          (track) =>
            track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
            track.genre.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Filter by genre
    if (selectedGenre !== "All") {
      setTracks((prevTracks) =>
        prevTracks.filter((track) => track.genre === selectedGenre)
      );
    }

    // Sort tracks
    switch (sortBy) {
      case "newest":
        tracks.sort(
          (a, b) =>
            new Date(b.releaseDate).getTime() -
            new Date(a.releaseDate).getTime()
        );
        break;
      case "popular":
        tracks.sort((a, b) => b.playCount - a.playCount);
        break;
      case "price-low":
        tracks.sort((a, b) => a.coinPrice - b.coinPrice);
        break;
      case "price-high":
        tracks.sort((a, b) => b.coinPrice - a.coinPrice);
        break;
      case "holders":
        tracks.sort((a, b) => b.holders - a.holders);
        break;
      default:
        break;
    }

    return tracks;
  }, [searchQuery, selectedGenre, sortBy, tracks]);

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
        {genres.slice(0, 6).map((genre) => (
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
    </div>
  );
};

export default Discover;
