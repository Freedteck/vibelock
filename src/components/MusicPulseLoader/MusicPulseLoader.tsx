import React from "react";
import styles from "./MusicPulseLoader.module.css";

interface MusicPulseLoaderProps {
  size?: "small" | "medium" | "large";
  color?: string;
  text?: string;
}

const MusicPulseLoader: React.FC<MusicPulseLoaderProps> = ({
  size = "medium",
  color = "#8b5cf6", // Purple accent
  text = "Loading track...",
}) => {
  const sizeClass = styles[size];

  return (
    <div className={styles.loaderContainer}>
      <div className={`${styles.musicBars} ${sizeClass}`}>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={styles.bar}
            style={{
              backgroundColor: color,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
      <p className={styles.loadingText}>{text}</p>
    </div>
  );
};

export default MusicPulseLoader;
