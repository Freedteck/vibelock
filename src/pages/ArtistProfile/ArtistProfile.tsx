import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Music, Users, TrendingUp, ExternalLink, Play } from "lucide-react";
import CompactTrackCard from "../../components/CompactTrackCard/CompactTrackCard";
import MobileHeader from "../../components/MobileHeader/MobileHeader";
import styles from "./ArtistProfile.module.css";
import { Artist, getArtist } from "../../client/supabase";
import { useAppContext } from "../../context/AppContext";
import { CoinTrack } from "../../models";

const ArtistProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [artistTracks, setArtistTracks] = useState<CoinTrack[]>([]);
  const [currentTrack, setCurrentTrack] = useState<CoinTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { tracks } = useAppContext();

  useEffect(() => {
    const fetchArtistByWallet = async () => {
      try {
        const { data, error } = await getArtist(id?.toLowerCase() || "");
        if (error) throw error;
        if (data) {
          const artistTracks = tracks.filter(
            (track) =>
              track.artistWallet.toLowerCase() ===
              data.wallet_address.toLowerCase()
          );
          setArtistTracks(artistTracks);
          setArtist(data || null);
        }
      } catch (error) {
        console.error("Error fetching artist by wallet:", error);
        setArtist(null);
      }
    };
    fetchArtistByWallet();
  }, [id, tracks]);

  const handleTrackPlay = (track: CoinTrack) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  if (!artist) {
    return (
      <div className={styles.artistProfile}>
        <MobileHeader title="Artist Not Found" showBack={true} />
        <div className={styles.container}>
          <div className={styles.notFound}>
            <h2>Artist not found</h2>
            <Link to="/discover" className={styles.backButton}>
              Back to Discover
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.artistProfile}>
      <MobileHeader title={artist.full_name} showBack={true} />

      <div className={styles.container}>
        {/* Hero Section */}
        <div className={styles.hero}>
          <div
            className={styles.banner}
            style={{ backgroundImage: `url(${artist?.banner_image})` }}
          >
            <div className={styles.bannerOverlay} />
          </div>

          <div className={styles.profileInfo}>
            <img
              src={artist?.profile_image}
              alt={artist.full_name}
              className={styles.avatar}
            />
            <div className={styles.artistDetails}>
              <h1 className={styles.artistName}>{artist.full_name}</h1>
              <p className={styles.artistBio}>{artist.bio}</p>

              <div className={styles.artistStats}>
                <div className={styles.statItem}>
                  <Users size={16} />
                  <span>{0}</span>
                </div>
                <div className={styles.statItem}>
                  <Music size={16} />
                  <span>{artistTracks.length} tracks</span>
                </div>
                <div className={styles.statItem}>
                  <TrendingUp size={16} />
                  <span>{0} ETH</span>
                </div>
              </div>

              <div className={styles.socialLinks}>
                {artist?.twitter && (
                  <a
                    href={`https://twitter.com/${artist?.twitter.replace(
                      "@",
                      ""
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                  >
                    <ExternalLink size={14} />
                    Twitter
                  </a>
                )}
                {artist?.instagram && (
                  <a
                    href={`https://instagram.com/${artist?.instagram.replace(
                      "@",
                      ""
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                  >
                    <ExternalLink size={14} />
                    Instagram
                  </a>
                )}
                {/* {artist?.spotify && (
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                  >
                    <ExternalLink size={14} />
                    Spotify
                  </a>
                )} */}
              </div>
            </div>
          </div>
        </div>

        {/* Tracks Section */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <Music size={18} />
              Tracks ({artistTracks.length})
            </h2>
          </div>

          {artistTracks.length > 0 ? (
            <div className={styles.tracksGrid}>
              {artistTracks.map((track) => (
                <CompactTrackCard
                  key={track.id}
                  track={track}
                  onPlay={handleTrackPlay}
                  isPlaying={currentTrack?.id === track.id && isPlaying}
                  size="medium"
                />
              ))}
            </div>
          ) : (
            <div className={styles.noTracks}>
              <Music size={48} />
              <h3>No tracks yet</h3>
              <p>This artist hasn't uploaded any tracks yet.</p>
            </div>
          )}
        </div>

        {/* Earnings Dashboard */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <TrendingUp size={18} />
              Earnings Overview
            </h2>
          </div>

          <div className={styles.earningsGrid}>
            <div className={styles.earningsCard}>
              <div className={styles.earningsIcon}>
                <TrendingUp size={20} />
              </div>
              <div className={styles.earningsInfo}>
                <h3 className={styles.earningsValue}>{0}</h3>
                <p className={styles.earningsLabel}>Total ETH</p>
              </div>
            </div>

            <div className={styles.earningsCard}>
              <div className={styles.earningsIcon}>
                <Music size={20} />
              </div>
              <div className={styles.earningsInfo}>
                <h3 className={styles.earningsValue}>{artistTracks.length}</h3>
                <p className={styles.earningsLabel}>Tracks</p>
              </div>
            </div>

            <div className={styles.earningsCard}>
              <div className={styles.earningsIcon}>
                <Users size={20} />
              </div>
              <div className={styles.earningsInfo}>
                <h3 className={styles.earningsValue}>{0}</h3>
                <p className={styles.earningsLabel}>Followers</p>
              </div>
            </div>

            <div className={styles.earningsCard}>
              <div className={styles.earningsIcon}>
                <Play size={20} />
              </div>
              <div className={styles.earningsInfo}>
                <h3 className={styles.earningsValue}>{0}</h3>
                <p className={styles.earningsLabel}>Total Plays</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Collaborations */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <Users size={18} />
              Recent Collaborations
            </h2>
          </div>

          <div className={styles.collaborationsList}>
            {artistTracks.slice(0, 3).map((track) => (
              <div key={track.id} className={styles.collaborationItem}>
                <img
                  src={track.artworkUrl}
                  alt={track.title}
                  className={styles.collabArtwork}
                />
                <div className={styles.collabInfo}>
                  <h3 className={styles.collabTitle}>{track.title}</h3>
                  <div className={styles.collabArtists}>
                    {track?.collaborators?.map((collab, index) => (
                      <span key={index} className={styles.collabArtist}>
                        {collab.name} ({collab.percentage}%)
                      </span>
                    ))}
                  </div>
                </div>
                <Link to={`/track/${track.id}`} className={styles.collabLink}>
                  View
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistProfile;
