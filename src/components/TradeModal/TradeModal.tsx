import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Loader,
  DollarSign,
  ChevronDown,
} from "lucide-react";
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
    amount: number,
    currency: "eth" | "usdc"
  ) => Promise<void>;
  isUnlockMode?: boolean;
  userBalance?: {
    eth: number;
    usdc: number;
    coins: number;
  };
}

const TradeModal: React.FC<TradeModalProps> = ({
  isOpen,
  onClose,
  track,
  onTrade,
  isUnlockMode = false,
  userBalance = { eth: 0, usdc: 0, coins: 0 },
}) => {
  const [tradeType, setTradeType] = useState<"buy" | "sell">(
    isUnlockMode ? "buy" : "buy"
  );
  const [amount, setAmount] = useState(isUnlockMode ? 0 : 1);
  const [currency, setCurrency] = useState<"eth" | "usdc">("eth");
  const [isTrading, setIsTrading] = useState(false);
  const [step, setStep] = useState<"setup" | "processing" | "success">("setup");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Calculate current price per coin from market cap and total supply
  const currentPriceUSD =
    parseFloat(`${track.marketCap || 0}`) /
    parseFloat(`${track.totalSupply || 1}`);
  const ethToUsdRate = 3500; // Mock ETH to USD rate - replace with real data
  const usdcToUsdRate = 1; // USDC is pegged to USD

  useEffect(() => {
    if (isUnlockMode) {
      setTradeType("buy");
    }
  }, [isUnlockMode]);

  const formatCurrency = (
    value: number,
    type: "usd" | "eth" | "usdc" | "coins"
  ) => {
    switch (type) {
      case "usd":
        return `$${value.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
      case "eth":
        return `${value.toFixed(6)} ETH`;
      case "usdc":
        return `${value.toFixed(2)} USDC`;
      case "coins":
        return `${value.toLocaleString()} coins`;
      default:
        return value.toString();
    }
  };

  const formatMarketData = () => {
    const marketCap = parseFloat(`${track.marketCap || 0}`);
    const marketCapDelta = parseFloat(`${track.volume24h || 0}`);
    const totalSupply = parseFloat(`${track.totalSupply || 0}`);

    return {
      marketCap: formatCurrency(marketCap, "usd"),
      marketCapDelta: `${
        marketCapDelta >= 0 ? "+" : ""
      }${marketCapDelta.toFixed(2)}%`,
      totalSupply: formatCurrency(totalSupply, "coins"),
      pricePerCoin: formatCurrency(currentPriceUSD, "usd"),
    };
  };

  const calculateTrade = () => {
    if (tradeType === "buy") {
      if (isUnlockMode) {
        // For unlock mode, calculate coins received based on amount spent
        const pricePerCoin =
          currency === "eth"
            ? currentPriceUSD / ethToUsdRate
            : currentPriceUSD / usdcToUsdRate;
        const coinsReceived = amount / pricePerCoin;
        return {
          coinsReceived,
          totalCost: amount,
          amountReceived: 0,
        };
      } else {
        // For regular buy, calculate cost based on number of coins
        const pricePerCoin =
          currency === "eth"
            ? currentPriceUSD / ethToUsdRate
            : currentPriceUSD / usdcToUsdRate;
        const totalCost = amount * pricePerCoin;
        return {
          coinsReceived: amount,
          totalCost,
          amountReceived: 0,
        };
      }
    } else {
      // For sell, calculate amount received based on coins sold
      const pricePerCoin =
        currency === "eth"
          ? currentPriceUSD / ethToUsdRate
          : currentPriceUSD / usdcToUsdRate;
      const amountReceived = amount * pricePerCoin;
      return {
        coinsReceived: 0,
        totalCost: 0,
        amountReceived,
      };
    }
  };

  const { coinsReceived, totalCost, amountReceived } = calculateTrade();

  const handleTrade = async () => {
    setIsTrading(true);
    setStep("processing");

    console.log("Trade Details:", {
      trackId: track.id,
      type: tradeType,
      amount: isUnlockMode && tradeType === "buy" ? coinsReceived : amount,
      currency,
      totalCost: tradeType === "buy" ? totalCost : 0,
      amountReceived: tradeType === "sell" ? amountReceived : 0,
      coinsReceived: tradeType === "buy" ? coinsReceived : 0,
    });

    try {
      await onTrade(
        track.id,
        tradeType,
        isUnlockMode && tradeType === "buy" ? coinsReceived : amount,
        currency
      );
      setStep("success");
      setTimeout(() => {
        onClose();
        setStep("setup");
        setIsTrading(false);
        setAmount(isUnlockMode ? 0 : 1);
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
      setAmount(isUnlockMode ? 0 : 1);
    }
  };

  const canTrade = () => {
    if (tradeType === "buy") {
      const maxBalance =
        currency === "eth" ? userBalance.eth : userBalance.usdc;
      return amount > 0 && totalCost <= maxBalance;
    } else {
      return amount > 0 && amount <= userBalance.coins;
    }
  };

  const getMaxAmount = () => {
    if (tradeType === "buy") {
      return currency === "eth" ? userBalance.eth : userBalance.usdc;
    } else {
      return userBalance.coins;
    }
  };

  const handleMaxClick = () => {
    const maxAmount = getMaxAmount();
    setAmount(maxAmount);
  };

  const marketData = formatMarketData();

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        step === "success"
          ? "Trade Completed!"
          : `${isUnlockMode ? "Unlock" : "Trade"} ${track.title} Coins`
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
                    <span>Price per Coin</span>
                    <span>{marketData.pricePerCoin}</span>
                  </div>
                  <div className={styles.stat}>
                    <span>Market Cap</span>
                    <span>{marketData.marketCap}</span>
                  </div>
                  <div className={styles.stat}>
                    <span>24h Volume</span>
                    <span
                      className={
                        parseFloat(`${track.volume24h || 0}`) >= 0
                          ? styles.positive
                          : styles.negative
                      }
                    >
                      {marketData.marketCapDelta}
                    </span>
                  </div>
                  <div className={styles.stat}>
                    <span>You Own</span>
                    <span>{formatCurrency(userBalance.coins, "coins")}</span>
                  </div>
                </div>
              </div>
            </div>

            {!isUnlockMode && (
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
            )}

            <div className={styles.currencySelector}>
              <label className={styles.label}>
                {tradeType === "buy" ? "Pay with" : "Receive in"}
              </label>
              <div className={styles.dropdown}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={styles.dropdownButton}
                >
                  <span className={styles.currencyOption}>
                    {currency === "eth" ? "ETH" : "USDC"}
                  </span>
                  <ChevronDown size={16} />
                </button>
                {dropdownOpen && (
                  <div className={styles.dropdownMenu}>
                    <button
                      onClick={() => {
                        setCurrency("eth");
                        setDropdownOpen(false);
                      }}
                      className={styles.dropdownItem}
                    >
                      ETH
                    </button>
                    <button
                      onClick={() => {
                        setCurrency("usdc");
                        setDropdownOpen(false);
                      }}
                      className={styles.dropdownItem}
                    >
                      USDC
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.amountSelector}>
              <label className={styles.label}>
                {tradeType === "buy"
                  ? isUnlockMode
                    ? `Amount to spend (${currency.toUpperCase()})`
                    : `Amount to ${tradeType} (coins)`
                  : `Amount to ${tradeType} (coins)`}
              </label>
              <div className={styles.amountInput}>
                <input
                  type="number"
                  min="0"
                  step={tradeType === "buy" && isUnlockMode ? "0.000001" : "1"}
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className={styles.input}
                />
                <span className={styles.unit}>
                  {tradeType === "buy" && isUnlockMode
                    ? currency.toUpperCase()
                    : "coins"}
                </span>
              </div>
              <div className={styles.amountControls}>
                {tradeType === "sell" && (
                  <>
                    <button
                      onClick={() => setAmount(1)}
                      className={styles.presetButton}
                    >
                      1
                    </button>
                    <button
                      onClick={() => setAmount(10)}
                      className={styles.presetButton}
                    >
                      10
                    </button>
                    <button
                      onClick={() => setAmount(100)}
                      className={styles.presetButton}
                    >
                      100
                    </button>
                  </>
                )}
                <button
                  onClick={handleMaxClick}
                  className={styles.presetButton}
                >
                  Max
                </button>
              </div>
              <p className={styles.maxInfo}>
                Available:{" "}
                {tradeType === "buy"
                  ? formatCurrency(
                      currency === "eth" ? userBalance.eth : userBalance.usdc,
                      currency
                    )
                  : formatCurrency(userBalance.coins, "coins")}
              </p>
            </div>

            <div className={styles.summary}>
              <h4 className={styles.summaryTitle}>Transaction Summary</h4>
              {tradeType === "buy" ? (
                <>
                  <div className={styles.summaryRow}>
                    <span>You pay</span>
                    <span>{formatCurrency(totalCost, currency)}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>You receive</span>
                    <span>{formatCurrency(coinsReceived, "coins")}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.summaryRow}>
                    <span>You sell</span>
                    <span>{formatCurrency(amount, "coins")}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>You receive</span>
                    <span>{formatCurrency(amountReceived, currency)}</span>
                  </div>
                </>
              )}
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
                {isUnlockMode ? "Unlock" : tradeType === "buy" ? "Buy" : "Sell"}
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
              {tradeType === "buy"
                ? formatCurrency(coinsReceived, "coins")
                : formatCurrency(amount, "coins")}{" "}
              of "{track.title}".
            </p>
            <div className={styles.successStats}>
              <div className={styles.successStat}>
                <span className={styles.successLabel}>
                  {tradeType === "buy" ? "Amount Paid" : "Amount Received"}
                </span>
                <span className={styles.successValue}>
                  {tradeType === "buy"
                    ? formatCurrency(totalCost, currency)
                    : formatCurrency(amountReceived, currency)}
                </span>
              </div>
              <div className={styles.successStat}>
                <span className={styles.successLabel}>
                  {tradeType === "buy" ? "Coins Received" : "Coins Sold"}
                </span>
                <span className={styles.successValue}>
                  {tradeType === "buy"
                    ? formatCurrency(coinsReceived, "coins")
                    : formatCurrency(amount, "coins")}
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
