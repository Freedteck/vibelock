import React, { useState } from "react";
import {
  Lock,
  Unlock,
  TrendingUp,
  Users,
  Loader,
  ChevronDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import Modal from "../Modal/Modal";
import styles from "./UnlockModal.module.css";
import { CoinTrack } from "../../models";
import { getPricePerToken } from "../../client/helper";

interface UnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: CoinTrack;
  onUnlock: (
    trackId: string,
    amount: string,
    type: "eth" | "coin" | "usdc"
  ) => Promise<any>;
  onSell?: (
    // Add optional sell handler
    trackId: string,
    amount: string,
    type: "eth" | "usdc" | "coin"
  ) => Promise<any>;
}

type Currency = "ETH" | "USDC";
type TransactionType = "buy" | "sell";

const UnlockModal: React.FC<UnlockModalProps> = ({
  isOpen,
  onClose,
  track,
  onUnlock,
  onSell,
}) => {
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [step, setStep] = useState<"confirm" | "processing" | "success">(
    "confirm"
  );
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("ETH");
  const [amount, setAmount] = useState<string>("");
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [transactionType, setTransactionType] =
    useState<TransactionType>("buy");

  const handleTransaction = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setIsUnlocking(true);
    setStep("processing");

    try {
      if (transactionType === "buy") {
        await onUnlock(
          track.id,
          amount,
          selectedCurrency.toLowerCase() as "eth" | "coin" | "usdc"
        );
      } else if (transactionType === "sell" && onSell) {
        await onSell(track.id, amount, "coin");
      }
      setIsUnlocking(false);
      setStep("success");
    } catch (error: Error | any) {
      setIsUnlocking(false);
      setStep("confirm");
      console.error("Transaction failed:", error.message || error);
    }
  };

  const handleClose = () => {
    if (!isUnlocking) {
      onClose();
      setStep("confirm");
      setAmount("");
      setTransactionType("buy");
    }
  };

  const handleCurrencySelect = (currency: Currency) => {
    setSelectedCurrency(currency);
    setShowCurrencyDropdown(false);
  };

  // const toggleTransactionType = () => {
  //   setTransactionType(prev => prev === "buy" ? "sell" : "buy");
  // };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        step === "success"
          ? transactionType === "buy"
            ? "Track Unlocked!"
            : "Coins Sold!"
          : transactionType === "buy"
          ? "Buy Coins"
          : "Sell Coins"
      }
      size="medium"
    >
      <div className={styles.container}>
        {step === "confirm" && (
          <>
            <div className={styles.transactionTypeToggle}>
              <button
                className={`${styles.toggleButton} ${
                  transactionType === "buy" ? styles.active : ""
                }`}
                onClick={() => setTransactionType("buy")}
              >
                <ArrowUp size={16} />
                Buy
              </button>
              <button
                className={`${styles.toggleButton} ${
                  transactionType === "sell" ? styles.active : ""
                }`}
                onClick={() => setTransactionType("sell")}
                disabled={!onSell} // Disable if no sell handler provided
              >
                <ArrowDown size={16} />
                Sell
              </button>
            </div>

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
                    <span>
                      {getPricePerToken(track.marketCap, track.totalSupply)} per
                      coin
                    </span>
                  </div>
                  <div className={styles.stat}>
                    <Users size={16} />
                    <span>{track.uniqueHolders} holders</span>
                  </div>
                </div>
              </div>
            </div>

            {transactionType === "buy" ? (
              <div className={styles.benefits}>
                <h4 className={styles.benefitsTitle}>What you'll get:</h4>
                <ul className={styles.benefitsList}>
                  <li>Full track access (no preview limitations)</li>
                  <li>High-quality audio download</li>
                  <li>Song coins for trading</li>
                  <li>Support the artist directly</li>
                  <li>Exclusive holder benefits</li>
                </ul>
              </div>
            ) : (
              <div className={styles.benefits}>
                <h4 className={styles.benefitsTitle}>What you'll receive:</h4>
                <ul className={styles.benefitsList}>
                  <li>Immediate payment in your chosen currency</li>
                  <li>No longer earn royalties from this track</li>
                  <li>Lose access to exclusive holder benefits</li>
                  <li>Track will return to preview mode</li>
                </ul>
              </div>
            )}

            <div className={styles.purchaseSection}>
              <h4 className={styles.purchaseTitle}>
                {transactionType === "buy" ? "Purchase" : "Sale"} Details
              </h4>

              <div className={styles.currencySelector}>
                <label className={styles.label}>
                  {transactionType === "buy" ? "Pay with:" : "Receive as:"}
                </label>
                <div className={styles.dropdown}>
                  <button
                    className={styles.dropdownButton}
                    onClick={() =>
                      setShowCurrencyDropdown(!showCurrencyDropdown)
                    }
                  >
                    <span className={styles.currencyOption}>
                      <span
                        className={`${styles.currencyIcon} ${
                          styles[selectedCurrency.toLowerCase()]
                        }`}
                      >
                        {selectedCurrency === "ETH" ? "Ξ" : "$"}
                      </span>
                      {selectedCurrency}
                    </span>
                    <ChevronDown size={16} />
                  </button>
                  {showCurrencyDropdown && (
                    <div className={styles.dropdownMenu}>
                      <button
                        className={styles.dropdownItem}
                        onClick={() => handleCurrencySelect("ETH")}
                      >
                        <span
                          className={`${styles.currencyIcon} ${styles.eth}`}
                        >
                          Ξ
                        </span>
                        ETH
                      </button>
                      <button
                        className={styles.dropdownItem}
                        onClick={() => handleCurrencySelect("USDC")}
                      >
                        <span
                          className={`${styles.currencyIcon} ${styles.usdc}`}
                        >
                          $
                        </span>
                        USDC
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.amountInput}>
                <label className={styles.label}>
                  {transactionType === "buy"
                    ? `Amount to spend (${selectedCurrency}):`
                    : `Amount of coins to sell:`}
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={
                    transactionType === "buy"
                      ? `Enter ${selectedCurrency} amount`
                      : "Enter number of coins"
                  }
                  className={styles.input}
                  min="0"
                  step={
                    transactionType === "buy" && selectedCurrency === "ETH"
                      ? "0.001"
                      : "1"
                  }
                />
              </div>
            </div>

            {amount && parseFloat(amount) > 0 && (
              <div className={styles.pricing}>
                <div className={styles.priceBreakdown}>
                  <div className={styles.priceRow}>
                    <span>
                      {transactionType === "buy" ? "Purchase" : "Sale"} amount
                    </span>
                    <span>
                      {parseFloat(amount).toFixed(
                        transactionType === "buy" && selectedCurrency === "ETH"
                          ? 4
                          : 2
                      )}{" "}
                      {transactionType === "buy" ? selectedCurrency : "coins"}
                    </span>
                  </div>
                  <div className={styles.priceRow}>
                    <span>
                      Estimated{" "}
                      {transactionType === "buy"
                        ? "coins received"
                        : "proceeds"}
                    </span>
                    <span>
                      {transactionType === "buy"
                        ? `${(parseFloat(amount) * 10).toFixed(2)} coins` // Assuming $10 per token
                        : `${(parseFloat(amount) * 10).toFixed(
                            selectedCurrency === "ETH" ? 4 : 2
                          )} ${selectedCurrency}`}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className={styles.actions}>
              <button onClick={handleClose} className={styles.cancelButton}>
                Cancel
              </button>
              <button
                onClick={handleTransaction}
                className={
                  transactionType === "buy"
                    ? styles.unlockButton
                    : styles.sellButton
                }
                disabled={!amount || parseFloat(amount) <= 0}
              >
                {transactionType === "buy" ? (
                  <>
                    <Lock size={18} />
                    Buy coins
                  </>
                ) : (
                  <>
                    <Unlock size={18} />
                    Sell coins
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {step === "processing" && (
          <div className={styles.processing}>
            <div className={styles.processingIcon}>
              <Loader size={48} className={styles.spinner} />
            </div>
            <h3 className={styles.processingTitle}>
              Processing {transactionType === "buy" ? "Purchase" : "Sale"}...
            </h3>
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
                <span>
                  {transactionType === "buy"
                    ? "Unlocking track & minting coins"
                    : "Redeeming coins & transferring funds"}
                </span>
              </div>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className={styles.success}>
            <div className={styles.successIcon}>
              {transactionType === "buy" ? (
                <Unlock size={48} />
              ) : (
                <TrendingUp size={48} />
              )}
            </div>
            <h3 className={styles.successTitle}>
              {transactionType === "buy"
                ? "Coins Purchased Successfully!"
                : "Coins Sold Successfully!"}
            </h3>
            <p className={styles.successText}>
              {transactionType === "buy"
                ? `You now have full access to "${track.title}" and this MUSIC coins.`
                : `You've successfully sold your coins for ${parseFloat(
                    amount
                  ).toFixed(
                    selectedCurrency === "ETH" ? 4 : 2
                  )} ${selectedCurrency}.`}
            </p>
            {/* <div className={styles.successStats}>
              <div className={styles.successStat}>
                <span className={styles.successLabel}>
                  {transactionType === "buy"
                    ? "Coins Received"
                    : "Coins Sold"}
                </span>
                <span className={styles.successValue}>
                  {transactionType === "buy"
                    ? `${(parseFloat(amount) * 10).toFixed(2)}`
                    : amount}{" "}
                  {transactionType === "buy" ? "" : "coins"}
                </span>
              </div>
              <div className={styles.successStat}>
                <span className={styles.successLabel}>
                  {transactionType === "buy"
                    ? "Amount Spent"
                    : "Amount Received"}
                </span>
                <span className={styles.successValue}>
                  {transactionType === "buy"
                    ? `${parseFloat(amount).toFixed(
                        selectedCurrency === "ETH" ? 4 : 2
                      )} ${selectedCurrency}`
                    : `${(parseFloat(amount) * 10).toFixed(
                        selectedCurrency === "ETH" ? 4 : 2
                      )} ${selectedCurrency}`}
                </span>
              </div>
            </div> */}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default UnlockModal;
