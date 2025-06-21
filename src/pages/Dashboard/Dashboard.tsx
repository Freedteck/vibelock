import React, { useState } from 'react';
import { Music, TrendingUp, Users, Play, Lock, Unlock, Eye, Heart } from 'lucide-react';
import TrackCard from '../../components/TrackCard/TrackCard';
import TradeModal from '../../components/TradeModal/TradeModal';
import { Track } from '../../data/mockData';
import { useAppContext } from '../../context/AppContext';
import styles from './Dashboard.module.css';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'owned' | 'portfolio' | 'activity'>('owned');
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [selectedTradeTrack, setSelectedTradeTrack] = useState<Track | null>(null);
  
  const { state, dispatch } = useAppContext();

  const ownedTracks = state.tracks.filter(track => state.unlockedTracks.includes(track.id));
  const portfolioValue = state.userPortfolio.reduce((sum, p) => sum + (p.coinsHeld * p.currentValue), 0);
  const totalCoins = state.userPortfolio.reduce((sum, p) => sum + p.coinsHeld, 0);
  const totalPlays = ownedTracks.reduce((sum, track) => sum + track.playCount, 0);
  
  const handleTrackPlay = (track: Track) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const handleTradeClick = (trackId: number) => {
    const track = state.tracks.find(t => t.id === trackId);
    if (track) {
      setSelectedTradeTrack(track);
      setShowTradeModal(true);
    }
  };

  const handleTrade = async (trackId: number, type: 'buy' | 'sell', amount: number) => {
    // Simulate blockchain transaction delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    dispatch({ 
      type: 'TRADE_COINS', 
      payload: { trackId, type, amount } 
    });

    // Add transaction record
    const track = state.tracks.find(t => t.id === trackId);
    if (track) {
      dispatch({
        type: 'ADD_TRANSACTION',
        payload: {
          id: `tx_${Date.now()}`,
          type: type === 'buy' ? 'purchase' : 'sell',
          trackId,
          amount,
          price: track.coinPrice,
          timestamp: new Date().toISOString(),
          status: 'completed'
        }
      });
    }
  };

  const tabs = [
    { id: 'owned', label: 'Owned Tracks', icon: <Music size={18} /> },
    { id: 'portfolio', label: 'Portfolio', icon: <TrendingUp size={18} /> },
    { id: 'activity', label: 'Activity', icon: <Eye size={18} /> }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'unlock': return <Unlock size={20} />;
      case 'purchase': return <TrendingUp size={20} />;
      case 'sell': return <TrendingUp size={20} />;
      default: return <Heart size={20} />;
    }
  };

  const getActivityDescription = (transaction: any) => {
    const track = state.tracks.find(t => t.id === transaction.trackId);
    if (!track) return 'Unknown transaction';

    switch (transaction.type) {
      case 'unlock':
        return `Unlocked "${track.title}" by ${track.artist}`;
      case 'purchase':
        return `Purchased ${transaction.amount} coin${transaction.amount !== 1 ? 's' : ''} of "${track.title}" by ${track.artist}`;
      case 'sell':
        return `Sold ${transaction.amount} coin${transaction.amount !== 1 ? 's' : ''} of "${track.title}" by ${track.artist}`;
      default:
        return `Interacted with "${track.title}" by ${track.artist}`;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>
            Manage your music collection and track your investments
          </p>
        </div>

        {/* Stats Overview */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Music size={24} />
            </div>
            <div className={styles.statInfo}>
              <h3 className={styles.statValue}>{ownedTracks.length}</h3>
              <p className={styles.statLabel}>Owned Tracks</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <TrendingUp size={24} />
            </div>
            <div className={styles.statInfo}>
              <h3 className={styles.statValue}>{portfolioValue.toFixed(4)} ETH</h3>
              <p className={styles.statLabel}>Portfolio Value</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Users size={24} />
            </div>
            <div className={styles.statInfo}>
              <h3 className={styles.statValue}>{totalCoins}</h3>
              <p className={styles.statLabel}>Coins Held</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Play size={24} />
            </div>
            <div className={styles.statInfo}>
              <h3 className={styles.statValue}>{totalPlays.toLocaleString()}</h3>
              <p className={styles.statLabel}>Total Plays</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={styles.tabNavigation}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`${styles.tabButton} ${
                activeTab === tab.id ? styles.active : ''
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className={styles.tabContent}>
          
          {/* Owned Tracks Tab */}
          {activeTab === 'owned' && (
            <div className={styles.tabPanel}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Your Music Collection</h2>
                <p className={styles.sectionDescription}>
                  Tracks you've unlocked and own
                </p>
              </div>

              {ownedTracks.length > 0 ? (
                <div className={styles.tracksGrid}>
                  {ownedTracks.map((track) => (
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
                <div className={styles.emptyState}>
                  <Lock size={48} />
                  <h3>No owned tracks yet</h3>
                  <p>Start building your collection by unlocking tracks you love</p>
                </div>
              )}
            </div>
          )}

          {/* Portfolio Tab */}
          {activeTab === 'portfolio' && (
            <div className={styles.tabPanel}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Investment Portfolio</h2>
                <p className={styles.sectionDescription}>
                  Track your coin holdings and their performance
                </p>
              </div>

              <div className={styles.portfolioList}>
                {state.userPortfolio.map((portfolio) => {
                  const track = state.tracks.find(t => t.id === portfolio.trackId);
                  if (!track) return null;

                  return (
                    <div key={portfolio.trackId} className={styles.portfolioItem}>
                      <img 
                        src={track.artwork} 
                        alt={track.title}
                        className={styles.portfolioArtwork}
                      />
                      <div className={styles.portfolioInfo}>
                        <h3 className={styles.portfolioTitle}>{track.title}</h3>
                        <p className={styles.portfolioArtist}>{track.artist}</p>
                      </div>
                      <div className={styles.portfolioStats}>
                        <div className={styles.portfolioStat}>
                          <span className={styles.portfolioLabel}>Coins Held</span>
                          <span className={styles.portfolioValue}>{portfolio.coinsHeld}</span>
                        </div>
                        <div className={styles.portfolioStat}>
                          <span className={styles.portfolioLabel}>Current Price</span>
                          <span className={styles.portfolioValue}>{track.coinPrice} ETH</span>
                        </div>
                        <div className={styles.portfolioStat}>
                          <span className={styles.portfolioLabel}>Value</span>
                          <span className={styles.portfolioValue}>
                            {(track.coinPrice * portfolio.coinsHeld).toFixed(4)} ETH
                          </span>
                        </div>
                        <div className={styles.portfolioStat}>
                          <span className={styles.portfolioLabel}>Change</span>
                          <span className={`${styles.portfolioValue} ${styles.positive}`}>
                            +{portfolio.percentageChange.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className={styles.portfolioActions}>
                        <button 
                          className={styles.portfolioButton}
                          onClick={() => handleTradeClick(portfolio.trackId)}
                        >
                          Trade
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className={styles.tabPanel}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Recent Activity</h2>
                <p className={styles.sectionDescription}>
                  Your recent interactions and transactions
                </p>
              </div>

              <div className={styles.activityList}>
                {state.transactions.map((transaction) => (
                  <div key={transaction.id} className={styles.activityItem}>
                    <div className={styles.activityIcon}>
                      {getActivityIcon(transaction.type)}
                    </div>
                    <div className={styles.activityInfo}>
                      <div className={styles.activityDescription}>
                        {getActivityDescription(transaction)}
                      </div>
                      <div className={styles.activityMeta}>
                        <span className={styles.activityTime}>
                          {formatTimeAgo(transaction.timestamp)}
                        </span>
                        <span className={styles.activityAmount}>
                          {transaction.type === 'sell' ? '+' : '-'}{(transaction.amount * transaction.price).toFixed(4)} ETH
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trade Modal */}
      {showTradeModal && selectedTradeTrack && (
        <TradeModal
          isOpen={showTradeModal}
          onClose={() => {
            setShowTradeModal(false);
            setSelectedTradeTrack(null);
          }}
          track={selectedTradeTrack}
          portfolio={state.userPortfolio.find(p => p.trackId === selectedTradeTrack.id) || {
            trackId: selectedTradeTrack.id,
            coinsHeld: 0,
            purchasePrice: 0,
            currentValue: selectedTradeTrack.coinPrice,
            percentageChange: 0
          }}
          onTrade={handleTrade}
        />
      )}
    </div>
  );
};

export default Dashboard;