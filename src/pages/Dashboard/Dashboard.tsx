import React, { useEffect, useState } from "react";
import {
  Music,
  TrendingUp,
  Users,
  // Play,
  Lock,
  // Unlock,
  // Eye,
  // Heart,
  Wallet,
} from "lucide-react";
import CompactTrackCard from "../../components/CompactTrackCard/CompactTrackCard";
import { useAppContext } from "../../context/AppContext";
import styles from "./Dashboard.module.css";
import { CoinTrack } from "../../models";
import { useWallet } from "../../hooks/useWallet";
import MobileHeader from "../../components/MobileHeader/MobileHeader";
import {
  formatMarketCap,
  formatMarketCapChange,
  formatRawBalance,
  getChangeColorClass,
  getHeldValue,
  getPricePerToken,
  getTokensHeld,
  getTotalPortfolioValue,
} from "../../client/helper";
import UnlockModal from "../../components/UnlockModal/UnlockModal";
import toast from "react-hot-toast";

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "owned" | "portfolio" | "activity"
  >("owned");
  const [currentTrack, setCurrentTrack] = useState<CoinTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [selectedTradeTrack, setSelectedTradeTrack] =
    useState<CoinTrack | null>(null);
  const [ownedTracks, setOwnedTracks] = useState<CoinTrack[]>([]);
  const [portfolioValue, setPortfolioValue] = useState("0");
  const [totalCoins, setTotalCoins] = useState("0");
  const { isConnected, walletAddress, connectWallet, isConnecting } =
    useWallet();

  const { tracks, trackLoading, profileBalances, tradeCoins } = useAppContext();
  // const totalPlays = 10000;

  useEffect(() => {
    if (!isConnected || !walletAddress) return;

    if (!trackLoading && tracks.length > 0) {
      const ownedTracks = tracks.filter(
        (track) =>
          track.collaborators?.some(
            (collab) =>
              collab?.wallet?.toLowerCase() === walletAddress?.toLowerCase()
          ) ||
          track.artistWallet?.toLowerCase() === walletAddress?.toLowerCase()
      );

      setOwnedTracks(ownedTracks);
    }
  }, [trackLoading, tracks, walletAddress, isConnected]);

  useEffect(() => {
    if (profileBalances && profileBalances.length > 0) {
      const totalValue = getTotalPortfolioValue(profileBalances);
      setPortfolioValue(totalValue);
      const totalCoinsHeld = profileBalances.length;
      setTotalCoins(totalCoinsHeld);
    }
  }, [profileBalances]);

  const handleTrackPlay = (track: CoinTrack) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const handleTradeClick = (trackId: string) => {
    const track = profileBalances.find((t: any) => t!.id === trackId);
    if (track) {
      setSelectedTradeTrack(track);
      setShowTradeModal(true);
    }
  };

  const handleTrade = async (
    trackAddress: string,
    amount: string,
    type: "eth" | "coin" | "usdc"
  ) => {
    try {
      const receipt = await toast.promise(
        tradeCoins({
          type: type,
          amount: amount,
          walletAddress: walletAddress!,
          coinAddress: trackAddress,
        }),
        {
          loading: "Processing trade...",
          success: "Trade successful!",
          error: `Trade failed`,
        }
      );

      return receipt;
    } catch (error) {
      throw new Error(
        `Trade failed: ${error instanceof Error ? error.message : error}`
      );
    }
  };

  const tabs = [
    { id: "owned", label: "Owned", icon: <Music size={16} /> },
    { id: "portfolio", label: "Portfolio", icon: <TrendingUp size={16} /> },
    // { id: "activity", label: "Activity", icon: <Eye size={16} /> },
  ];

  if (!isConnected) {
    return (
      <div className={styles.notConnected}>
        <MobileHeader title="Upload Track" showBack={true} />

        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>Connect Your Wallet</h1>
            <p className={styles.subtitle}>
              You need to connect your wallet to upload tracks and manage your
              music
            </p>
          </div>

          <div className={styles.stepContent}>
            <div
              className={styles.stepPanel}
              style={{ textAlign: "center", padding: "3rem 2rem" }}
            >
              <Wallet
                size={64}
                style={{ margin: "0 auto 2rem", color: "#8b5cf6" }}
              />
              <h2
                style={{ color: "var(--text-primary)", marginBottom: "1rem" }}
              >
                Wallet Required
              </h2>
              <p
                style={{
                  color: "var(--text-secondary)",
                  marginBottom: "2rem",
                  lineHeight: 1.5,
                }}
              >
                Connect your wallet to start uploading tracks, manage your
                music, and earn from your creations.
              </p>
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className={styles.publishButton}
                style={{ margin: "0 auto" }}
              >
                {isConnecting ? (
                  <>
                    <div
                      className={styles.spinner}
                      style={{ width: "18px", height: "18px" }}
                    />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet size={18} />
                    Connect Wallet
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* <MobileHeader title="Dashboard" showProfile={true} /> */}

      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Your Music Dashboard</h1>
          <p className={styles.subtitle}>
            Track your collection and investments
          </p>
        </div>

        {/* Stats Overview */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <Music className={styles.statIcon} />
              <span className={styles.statLabel}>Owned Tracks</span>
            </div>
            <div className={styles.statValue}>{ownedTracks.length}</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <TrendingUp className={styles.statIcon} />
              <span className={styles.statLabel}>Portfolio Value</span>
            </div>
            <div className={styles.statValue}>{portfolioValue}</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <Users className={styles.statIcon} />
              <span className={styles.statLabel}>Coins Held</span>
            </div>
            <div className={styles.statValue}>{totalCoins}</div>
          </div>

          {/* <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <Play className={styles.statIcon} />
              <span className={styles.statLabel}>Total Plays</span>
            </div>
            <div className={styles.statValue}>
              {totalPlays.toLocaleString()}
            </div>
          </div> */}
        </div>

        {/* Tab Navigation */}
        <div className={styles.tabNavigation}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`${styles.tabButton} ${
                activeTab === tab.id ? styles.active : ""
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className={styles.tabContent}>
          {/* Owned Tracks Tab */}
          {activeTab === "owned" && (
            <div className={styles.tabPanel}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Your Music Collection</h2>
                <p className={styles.sectionDescription}>
                  Tracks you've unlocked and own
                </p>
              </div>

              {ownedTracks.length > 0 ? (
                <div className={styles.tracksGrid}>
                  {ownedTracks.map((track: any) => (
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
                <div className={styles.emptyState}>
                  <Lock size={48} />
                  <h3>No owned tracks yet</h3>
                  <p>
                    Start building your collection by unlocking tracks you love
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Portfolio Tab */}
          {activeTab === "portfolio" && (
            <div className={styles.tabPanel}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Investment Portfolio</h2>
                <p className={styles.sectionDescription}>
                  Track your coin holdings and performance
                </p>
              </div>

              <div className={styles.portfolioList}>
                {profileBalances
                  .filter(
                    (portfolio: any) =>
                      portfolio && formatRawBalance(portfolio.balance) > 0
                  ) // Only show positions with coins
                  .map((portfolio: any) => (
                    <div key={portfolio.id} className={styles.portfolioItem}>
                      <div className={styles.portfolioHeader}>
                        <img
                          src={portfolio.artworkUrl}
                          alt={portfolio.title}
                          className={styles.portfolioArtwork}
                        />
                        <div className={styles.portfolioInfo}>
                          <h3 className={styles.portfolioTitle}>
                            {portfolio.title}
                          </h3>
                          <p className={styles.portfolioArtist}>
                            {portfolio.artist}
                          </p>
                          <div className={styles.portfolioMarketCap}>
                            <span className={styles.marketCapLabel}>
                              Market Cap:
                            </span>
                            <span className={styles.marketCapValue}>
                              {formatMarketCap(portfolio.marketCap)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className={styles.portfolioStats}>
                        <div className={styles.portfolioStat}>
                          <span className={styles.portfolioLabel}>
                            Your Coins
                          </span>
                          <span className={styles.portfolioValue}>
                            {getTokensHeld(portfolio.balance)}
                          </span>
                        </div>
                        <div className={styles.portfolioStat}>
                          <span className={styles.portfolioLabel}>
                            Coin Price
                          </span>
                          <span className={styles.portfolioValue}>
                            {getPricePerToken(
                              portfolio.marketCap,
                              portfolio.totalSupply
                            )}
                          </span>
                        </div>
                        <div className={styles.portfolioStat}>
                          <span className={styles.portfolioLabel}>
                            Total Value
                          </span>
                          <span className={styles.portfolioValue}>
                            {getHeldValue(
                              portfolio.balance,
                              portfolio.marketCap,
                              portfolio.totalSupply
                            )}
                          </span>
                        </div>
                        <div className={styles.portfolioStat}>
                          <span className={styles.portfolioLabel}>
                            24h Change
                          </span>
                          <span
                            className={`${styles.portfolioValue} ${
                              styles[getChangeColorClass(portfolio.volume24h)]
                            }`}
                          >
                            {formatMarketCapChange(portfolio.volume24h)}
                          </span>
                        </div>
                      </div>

                      <div className={styles.portfolioActions}>
                        <button
                          className={`${styles.portfolioButton} ${styles.primary}`}
                          onClick={() => handleTradeClick(portfolio.id)}
                        >
                          Trade
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Empty state if no positions */}
              {profileBalances.filter(
                (p: any) => p && formatRawBalance(p.balance) > 0
              ).length === 0 && (
                <div className={styles.emptyState}>
                  <TrendingUp size={48} />
                  <h3>No coin positions yet</h3>
                  <p>
                    Start investing in your favorite tracks to build your
                    portfolio
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === "activity" && (
            <div className={styles.tabPanel}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Recent Activity</h2>
                <p className={styles.sectionDescription}>
                  Your recent interactions and transactions
                </p>
              </div>

              <div className={styles.activityList}>
                {/* {state.transactions.map((transaction) => (
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
                          {transaction.type === "sell" ? "+" : "-"}
                          {(transaction.amount * transaction.price).toFixed(
                            4
                          )}{" "}
                          ETH
                        </span>
                      </div>
                    </div>
                  </div>
                ))} */}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trade Modal */}
      {showTradeModal && selectedTradeTrack && (
        // <TradeModal
        //   isOpen={showTradeModal}
        //   onClose={() => {
        //     setShowTradeModal(false);
        //     setSelectedTradeTrack(null);
        //   }}
        //   track={selectedTradeTrack}
        //   onTrade={handleTrade}
        // />
        <UnlockModal
          isOpen={showTradeModal}
          onClose={() => {
            setShowTradeModal(false);
            setSelectedTradeTrack(null);
          }}
          track={selectedTradeTrack}
          onUnlock={handleTrade}
          onSell={handleTrade}
        />
      )}
    </div>
  );
};

export default Dashboard;
