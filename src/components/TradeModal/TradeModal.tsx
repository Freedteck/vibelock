import React, { useState } from "react";
import { TrendingUp, TrendingDown, Loader, DollarSign } from "lucide-react";
import Modal from "../Modal/Modal";
import styles from "./TradeModal.module.css";
import { CoinTrack } from "../../models";

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: CoinTrack;
  onTrade: (
    trackId: string,
    type: "buy" | "sell",
    amount: number
  ) => Promise<void>;
}

const TradeModal: React.FC<TradeModalProps> = ({
  isOpen,
  onClose,
  track,
  onTrade,
}) => {
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState(1);
  const [isTrading, setIsTrading] = useState(false);
  const [step, setStep] = useState<"setup" | "processing" | "success">("setup");

  const maxSell = 300;
  // const maxBuy = Math.min(50, track.maxSupply - track.currentSupply); // Limit to 50 or available supply
  const maxBuy = 1000000;
  const totalCost = amount * 20;
  const estimatedGas = 0.001;

  const handleTrade = async () => {
    setIsTrading(true);
    setStep("processing");

    try {
      await onTrade(track.id, tradeType, amount);
      setStep("success");
      setTimeout(() => {
        onClose();
        setStep("setup");
        setIsTrading(false);
        setAmount(1);
      }, 2000);
    } catch (error) {
      setIsTrading(false);
      setStep("setup");
      console.error("Trade failed:", error);
    }
  };

  const handleClose = () => {
    if (!isTrading) {
      onClose();
      setStep("setup");
      setAmount(1);
    }
  };

  const canTrade = () => {
    if (tradeType === "buy") {
      return amount > 0 && amount <= maxBuy;
    } else {
      return amount > 0 && amount <= maxSell;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        step === "success" ? "Trade Completed!" : `Trade ${track.title} Coins`
      }
      size="medium"
    >
      <div className={styles.container}>
        {step === "setup" && (
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
                    <span>Current Price</span>
                    <span>{20} ETH</span>
                  </div>
                  <div className={styles.stat}>
                    <span>You Own</span>
                    <span>{20} coins</span>
                  </div>
                  <div className={styles.stat}>
                    <span>Available Supply</span>
                    <span>{500000} coins</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.tradeTypeSelector}>
              <button
                onClick={() => setTradeType("buy")}
                className={`${styles.typeButton} ${
                  tradeType === "buy" ? styles.active : ""
                } ${styles.buy}`}
              >
                <TrendingUp size={18} />
                Buy
              </button>
              <button
                onClick={() => setTradeType("sell")}
                className={`${styles.typeButton} ${
                  tradeType === "sell" ? styles.active : ""
                } ${styles.sell}`}
              >
                <TrendingDown size={18} />
                Sell
              </button>
            </div>

            <div className={styles.amountSelector}>
              <label className={styles.label}>Amount to {tradeType}</label>
              <div className={styles.amountInput}>
                <input
                  type="number"
                  min="1"
                  max={tradeType === "buy" ? maxBuy : maxSell}
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value) || 1)}
                  className={styles.input}
                />
                <span className={styles.unit}>coins</span>
              </div>
              <div className={styles.amountControls}>
                <button
                  onClick={() => setAmount(1)}
                  className={styles.presetButton}
                >
                  1
                </button>
                <button
                  onClick={() => setAmount(5)}
                  className={styles.presetButton}
                  disabled={5 > (tradeType === "buy" ? maxBuy : maxSell)}
                >
                  5
                </button>
                <button
                  onClick={() => setAmount(10)}
                  className={styles.presetButton}
                  disabled={10 > (tradeType === "buy" ? maxBuy : maxSell)}
                >
                  10
                </button>
                <button
                  onClick={() =>
                    setAmount(tradeType === "buy" ? maxBuy : maxSell)
                  }
                  className={styles.presetButton}
                >
                  Max
                </button>
              </div>
              <p className={styles.maxInfo}>
                Max {tradeType}: {tradeType === "buy" ? maxBuy : maxSell} coins
              </p>
            </div>

            <div className={styles.summary}>
              <h4 className={styles.summaryTitle}>Transaction Summary</h4>
              <div className={styles.summaryRow}>
                <span>
                  {amount} coins × {20} ETH
                </span>
                <span>{totalCost.toFixed(4)} ETH</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Gas fee (estimated)</span>
                <span>{estimatedGas} ETH</span>
              </div>
              <div className={`${styles.summaryRow} ${styles.total}`}>
                <span>Total {tradeType === "buy" ? "Cost" : "Received"}</span>
                <span>
                  {tradeType === "buy"
                    ? (totalCost + estimatedGas).toFixed(4)
                    : (totalCost - estimatedGas).toFixed(4)}{" "}
                  ETH
                </span>
              </div>
            </div>

            <div className={styles.actions}>
              <button onClick={handleClose} className={styles.cancelButton}>
                Cancel
              </button>
              <button
                onClick={handleTrade}
                disabled={!canTrade()}
                className={`${styles.tradeButton} ${styles[tradeType]}`}
              >
                {tradeType === "buy" ? (
                  <TrendingUp size={18} />
                ) : (
                  <TrendingDown size={18} />
                )}
                {tradeType === "buy" ? "Buy" : "Sell"} {amount} Coin
                {amount !== 1 ? "s" : ""}
              </button>
            </div>
          </>
        )}

        {step === "processing" && (
          <div className={styles.processing}>
            <div className={styles.processingIcon}>
              <Loader size={48} className={styles.spinner} />
            </div>
            <h3 className={styles.processingTitle}>Processing Trade...</h3>
            <p className={styles.processingText}>
              Please confirm the transaction in your wallet and wait for
              blockchain confirmation.
            </p>
          </div>
        )}

        {step === "success" && (
          <div className={styles.success}>
            <div className={styles.successIcon}>
              <DollarSign size={48} />
            </div>
            <h3 className={styles.successTitle}>Trade Successful!</h3>
            <p className={styles.successText}>
              You have successfully {tradeType === "buy" ? "purchased" : "sold"}{" "}
              {amount} coin{amount !== 1 ? "s" : ""} of "{track.title}".
            </p>
            <div className={styles.successStats}>
              <div className={styles.successStat}>
                <span className={styles.successLabel}>
                  Coins {tradeType === "buy" ? "Purchased" : "Sold"}
                </span>
                <span className={styles.successValue}>{amount}</span>
              </div>
              <div className={styles.successStat}>
                <span className={styles.successLabel}>
                  Total {tradeType === "buy" ? "Cost" : "Received"}
                </span>
                <span className={styles.successValue}>
                  {tradeType === "buy"
                    ? (totalCost + estimatedGas).toFixed(4)
                    : (totalCost - estimatedGas).toFixed(4)}{" "}
                  ETH
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default TradeModal;
