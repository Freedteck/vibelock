import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Music,
  Users,
  ExternalLink,
  // Play
} from "lucide-react";
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
            style={{
              backgroundImage: `url(${
                artist?.banner_image ||
                "https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=800"
              })`,
            }}
          >
            <div className={styles.bannerOverlay} />
          </div>

          <div className={styles.profileInfo}>
            <img
              src={
                artist?.profile_image ||
                "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150"
              }
              alt={artist.full_name}
              className={styles.avatar}
            />
            <div className={styles.artistDetails}>
              <h1 className={styles.artistName}>{artist.full_name}</h1>
              <p className={styles.artistBio}>
                {artist.bio ||
                  "A passionate artist creating amazing music for the world to enjoy."}
              </p>

              {/* <div className={styles.artistStats}>
                <div className={styles.statItem}>
                  <Users className={styles.statIcon} size={20} />
                  <div className={styles.statValue}>1.2K</div>
                  <div className={styles.statLabel}>Followers</div>
                </div>
                <div className={styles.statItem}>
                  <Music className={styles.statIcon} size={20} />
                  <div className={styles.statValue}>{artistTracks.length}</div>
                  <div className={styles.statLabel}>Tracks</div>
                </div>
                <div className={styles.statItem}>
                  <Play className={styles.statIcon} size={20} />
                  <div className={styles.statValue}>45.2K</div>
                  <div className={styles.statLabel}>Plays</div>
                </div>
              </div> */}

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
                    <ExternalLink size={16} />
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
                    <ExternalLink size={16} />
                    Instagram
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tracks Section */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}>
                <Music size={18} />
              </div>
              Music Collection
            </h2>
            <p className={styles.sectionDescription}>
              Discover all tracks by {artist.full_name}
            </p>
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
              <Music size={64} />
              <h3>No tracks yet</h3>
              <p>
                This artist hasn't uploaded any tracks yet. Check back soon for
                new releases!
              </p>
            </div>
          )}
        </div>

        {/* Recent Collaborations */}
        {artistTracks.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <div className={styles.sectionIcon}>
                  <Users size={18} />
                </div>
                Featured Collaborations
              </h2>
              <p className={styles.sectionDescription}>
                Tracks featuring collaborations with other artists
              </p>
            </div>

            <div className={styles.collaborationsList}>
              {artistTracks
                .filter(
                  (track) =>
                    track.collaborators && track.collaborators.length > 1
                )
                .slice(0, 3)
                .map((track) => (
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
                    <Link
                      to={`/track/${track.id}`}
                      className={styles.collabLink}
                    >
                      Listen
                    </Link>
                  </div>
                ))}

              {artistTracks.filter(
                (track) => track.collaborators && track.collaborators.length > 1
              ).length === 0 && (
                <div className={styles.noTracks}>
                  <Users size={48} />
                  <h3>No collaborations yet</h3>
                  <p>This artist hasn't collaborated with others yet.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistProfile;
