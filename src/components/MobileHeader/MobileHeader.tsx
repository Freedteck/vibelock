import React from "react";
import { useLocation } from "react-router-dom";
import { ArrowLeft, Music, User, Wallet } from "lucide-react";
import { useWallet } from "../../hooks/useWallet";
import styles from "./MobileHeader.module.css";

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  showProfile?: boolean;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  showBack = false,
  showProfile = true,
}) => {
  const location = useLocation();
  const { isConnected, connectWallet } = useWallet();

  const getTitle = () => {
    if (title) return title;

    switch (location.pathname) {
      case "/":
        return "VibeLock";
      case "/discover":
        return "Discover";
      case "/upload":
        return "Upload";
      case "/dashboard":
        return "Profile";
      default:
        return "VibeLock";
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        {showBack ? (
          <button
            onClick={() => window.history.back()}
            className={styles.backButton}
          >
            <ArrowLeft size={24} />
          </button>
        ) : (
          <div className={styles.logo}>
            <Music size={24} className={styles.logoIcon} />
          </div>
        )}
      </div>

      <div className={styles.center}>
        <h1 className={styles.title}>{getTitle()}</h1>
      </div>

      <div className={styles.right} onClick={connectWallet}>
        {showProfile && (
          <div className={styles.profileSection}>
            {isConnected ? (
              <div className={styles.userAvatar}>
                <User size={20} />
              </div>
            ) : (
              <div className={styles.walletIndicator}>
                <Wallet size={20} />
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default MobileHeader;
