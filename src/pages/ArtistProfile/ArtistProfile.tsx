import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Music, Users, TrendingUp, ExternalLink, Play, Pause } from 'lucide-react';
import TrackCard from '../../components/TrackCard/TrackCard';
import { Artist, Track, mockArtists, mockTracks } from '../../data/mockData';
import styles from './ArtistProfile.module.css';

const ArtistProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [artistTracks, setArtistTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const foundArtist = mockArtists.find(a => a.id === parseInt(id || '0'));
    setArtist(foundArtist || null);
    
    if (foundArtist) {
      const tracks = mockTracks.filter(track => track.artist === foundArtist.name);
      setArtistTracks(tracks);
    }
  }, [id]);

  const handleTrackPlay = (track: Track) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  if (!artist) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>
          <h2>Artist not found</h2>
          <Link to="/discover" className={styles.backButton}>
            Back to Discover
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.artistProfile}>
      <div className={styles.container}>
        {/* Hero Section */}
        <div className={styles.hero}>
          <div 
            className={styles.banner}
            style={{ backgroundImage: `url(${artist.banner})` }}
          >
            <div className={styles.bannerOverlay} />
          </div>
          
          <div className={styles.profileInfo}>
            <img 
              src={artist.avatar} 
              alt={artist.name}
              className={styles.avatar}
            />
            <div className={styles.artistDetails}>
              <h1 className={styles.artistName}>{artist.name}</h1>
              <p className={styles.artistBio}>{artist.bio}</p>
              
              <div className={styles.artistStats}>
                <div className={styles.statItem}>
                  <Users size={18} />
                  <span>{artist.followers.toLocaleString()} followers</span>
                </div>
                <div className={styles.statItem}>
                  <Music size={18} />
                  <span>{artist.totalTracks} tracks</span>
                </div>
                <div className={styles.statItem}>
                  <TrendingUp size={18} />
                  <span>{artist.totalEarnings} ETH earned</span>
                </div>
              </div>

              <div className={styles.socialLinks}>
                {artist.socialLinks.twitter && (
                  <a 
                    href={`https://twitter.com/${artist.socialLinks.twitter.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                  >
                    <ExternalLink size={16} />
                    Twitter
                  </a>
                )}
                {artist.socialLinks.instagram && (
                  <a 
                    href={`https://instagram.com/${artist.socialLinks.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                  >
                    <ExternalLink size={16} />
                    Instagram
                  </a>
                )}
                {artist.socialLinks.spotify && (
                  <a 
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                  >
                    <ExternalLink size={16} />
                    Spotify
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
              <Music size={20} />
              Tracks ({artistTracks.length})
            </h2>
          </div>

          {artistTracks.length > 0 ? (
            <div className={styles.tracksGrid}>
              {artistTracks.map((track) => (
                <TrackCard
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

        {/* Earnings Dashboard (if artist) */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <TrendingUp size={20} />
              Earnings Overview
            </h2>
          </div>

          <div className={styles.earningsGrid}>
            <div className={styles.earningsCard}>
              <div className={styles.earningsIcon}>
                <TrendingUp size={24} />
              </div>
              <div className={styles.earningsInfo}>
                <h3 className={styles.earningsValue}>{artist.totalEarnings} ETH</h3>
                <p className={styles.earningsLabel}>Total Earnings</p>
              </div>
            </div>

            <div className={styles.earningsCard}>
              <div className={styles.earningsIcon}>
                <Music size={24} />
              </div>
              <div className={styles.earningsInfo}>
                <h3 className={styles.earningsValue}>{artist.totalTracks}</h3>
                <p className={styles.earningsLabel}>Tracks Released</p>
              </div>
            </div>

            <div className={styles.earningsCard}>
              <div className={styles.earningsIcon}>
                <Users size={24} />
              </div>
              <div className={styles.earningsInfo}>
                <h3 className={styles.earningsValue}>{artist.followers}</h3>
                <p className={styles.earningsLabel}>Total Followers</p>
              </div>
            </div>

            <div className={styles.earningsCard}>
              <div className={styles.earningsIcon}>
                <Play size={24} />
              </div>
              <div className={styles.earningsInfo}>
                <h3 className={styles.earningsValue}>
                  {artistTracks.reduce((sum, track) => sum + track.playCount, 0).toLocaleString()}
                </h3>
                <p className={styles.earningsLabel}>Total Plays</p>
              </div>
            </div>
          </div>
        </div>

        {/* Collaborations */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <Users size={20} />
              Recent Collaborations
            </h2>
          </div>

          <div className={styles.collaborationsList}>
            {artistTracks.slice(0, 3).map((track) => (
              <div key={track.id} className={styles.collaborationItem}>
                <img 
                  src={track.artwork} 
                  alt={track.title}
                  className={styles.collabArtwork}
                />
                <div className={styles.collabInfo}>
                  <h3 className={styles.collabTitle}>{track.title}</h3>
                  <div className={styles.collabArtists}>
                    {track.collaborators.map((collab, index) => (
                      <span key={index} className={styles.collabArtist}>
                        {collab.name} ({collab.percentage}%)
                      </span>
                    ))}
                  </div>
                </div>
                <Link to={`/track/${track.id}`} className={styles.collabLink}>
                  View Track
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