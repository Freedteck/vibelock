import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Music, Search, Menu, X, User, Wallet } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { useNotification } from "../../hooks/useNotification";
import styles from "./Header.module.css";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { formatUserAddress } from "../../client/helper";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { state, dispatch } = useAppContext();
  const { showSuccess, showError } = useNotification();
  const location = useLocation();
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/discover", label: "Discover" },
    { path: "/upload", label: "Upload" },
    { path: "/dashboard", label: "Dashboard" },
  ];

  const handleConnectWallet = () => {
    open();
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo */}
        <Link to="/" className={styles.logo} onClick={handleNavClick}>
          <Music className={styles.logoIcon} />
          <span className={styles.logoText}>VibeLock</span>
        </Link>

        {/* Search Bar - Desktop */}
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

        {/* Navigation - Desktop */}
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.navLink} ${
                location.pathname === item.path ? styles.navLinkActive : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Wallet & User */}
        <div className={styles.userSection}>
          <button
            onClick={handleConnectWallet}
            className={`${styles.walletButton} ${
              state.isWalletConnected ? styles.walletConnected : ""
            }`}
          >
            <Wallet size={18} />
            <div className={styles.appBtn} id="btn"></div>

            {isConnected
              ? formatUserAddress(address?.toLowerCase())
              : "Connect"}
          </button>

          {isConnected && (
            <div className={styles.userAvatar}>
              <User size={20} />
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className={styles.mobileMenuButton}
          onClick={handleMenuToggle}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ""}`}>
        <div className={styles.mobileSearchContainer}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <nav className={styles.mobileNav}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.mobileNavLink} ${
                location.pathname === item.path ? styles.navLinkActive : ""
              }`}
              onClick={handleNavClick}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
