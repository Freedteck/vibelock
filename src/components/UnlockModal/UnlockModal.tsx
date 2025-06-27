import React, { useState } from "react";
import { Lock, Unlock, TrendingUp, Users, Loader } from "lucide-react";
import Modal from "../Modal/Modal";
import styles from "./UnlockModal.module.css";
import { CoinTrack } from "../../models";

interface UnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: CoinTrack;
  onUnlock: (trackId: string) => Promise<void>;
}

const UnlockModal: React.FC<UnlockModalProps> = ({
  isOpen,
  onClose,
  track,
  onUnlock,
}) => {
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [step, setStep] = useState<"confirm" | "processing" | "success">(
    "confirm"
  );

  const handleUnlock = async () => {
    setIsUnlocking(true);
    setStep("processing");

    try {
      await onUnlock(track.id);
      setStep("success");
      setTimeout(() => {
        onClose();
        setStep("confirm");
        setIsUnlocking(false);
      }, 2000);
    } catch (error) {
      setIsUnlocking(false);
      setStep("confirm");
      console.error("Unlock failed:", error);
    }
  };

  const handleClose = () => {
    if (!isUnlocking) {
      onClose();
      setStep("confirm");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === "success" ? "Track Unlocked!" : "Unlock Track"}
      size="medium"
    >
      <div className={styles.container}>
        {step === "confirm" && (
          <>
            <div className={styles.trackInfo}>
              <img
                src={track.artworkUrl}
                alt={track.title}
                className={styles.artwork}
              />
              <div className={styles.details}>
                <h3 className={styles.title}>{track.title}</h3>
                <p className={styles.artist}>by {track.artist}</p>
                <div className={styles.stats}>
                  <div className={styles.stat}>
                    <TrendingUp size={16} />
                    <span>{0} ETH</span>
                  </div>
                  <div className={styles.stat}>
                    <Users size={16} />
                    <span>{track.uniqueHolders} holders</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.benefits}>
              <h4 className={styles.benefitsTitle}>What you'll get:</h4>
              <ul className={styles.benefitsList}>
                <li>Full track access (no preview limitations)</li>
                <li>High-quality audio download</li>
                <li>1 song coin for trading</li>
                <li>Support the artist directly</li>
                <li>Exclusive holder benefits</li>
              </ul>
            </div>

            <div className={styles.pricing}>
              <div className={styles.priceBreakdown}>
                <div className={styles.priceRow}>
                  <span>Track unlock</span>
                  <span>{0} ETH</span>
                </div>
                <div className={styles.priceRow}>
                  <span>Gas fee (estimated)</span>
                  <span>0.001 ETH</span>
                </div>
                <div className={`${styles.priceRow} ${styles.total}`}>
                  <span>Total</span>
                  <span>{(0 + 0.001).toFixed(4)} ETH</span>
                </div>
              </div>
            </div>

            <div className={styles.actions}>
              <button onClick={handleClose} className={styles.cancelButton}>
                Cancel
              </button>
              <button onClick={handleUnlock} className={styles.unlockButton}>
                <Lock size={18} />
                Unlock for {0} ETH
              </button>
            </div>
          </>
        )}

        {step === "processing" && (
          <div className={styles.processing}>
            <div className={styles.processingIcon}>
              <Loader size={48} className={styles.spinner} />
            </div>
            <h3 className={styles.processingTitle}>Unlocking Track...</h3>
            <p className={styles.processingText}>
              Please confirm the transaction in your wallet and wait for
              blockchain confirmation.
            </p>
            <div className={styles.processingSteps}>
              <div className={styles.step}>
                <div className={styles.stepIcon}>✓</div>
                <span>Transaction initiated</span>
              </div>
              <div className={styles.step}>
                <div className={styles.stepIcon}>
                  <Loader size={16} className={styles.spinner} />
                </div>
                <span>Waiting for confirmation...</span>
              </div>
              <div className={styles.step}>
                <div className={styles.stepIcon}>⏳</div>
                <span>Unlocking track</span>
              </div>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className={styles.success}>
            <div className={styles.successIcon}>
              <Unlock size={48} />
            </div>
            <h3 className={styles.successTitle}>
              Track Unlocked Successfully!
            </h3>
            <p className={styles.successText}>
              You now have full access to "{track.title}" and own 1 song coin.
            </p>
            <div className={styles.successStats}>
              <div className={styles.successStat}>
                <span className={styles.successLabel}>Coins Owned</span>
                <span className={styles.successValue}>1</span>
              </div>
              <div className={styles.successStat}>
                <span className={styles.successLabel}>Current Value</span>
                <span className={styles.successValue}>{0} ETH</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default UnlockModal;
