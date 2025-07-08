/**
 * Format an Ethereum address by shortening the middle part.
 * Example: 0x1234567890abcdef1234567890abcdef12345678 → 0x1234...5678
 */
export function formatUserAddress(address?: string): string {
  if (!address || address.length < 10) return "";

  const start = address.slice(0, 6);
  const end = address.slice(-4);
  return `${start}...${end}`;
}

export function formatCreatedAt(createdAt: string, locale = "en-US"): string {
  const date = new Date(createdAt);
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function isTrackNew(createdAt: string): boolean {
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const diffMs = now - created;
  return diffMs >= 0 && diffMs < 24 * 60 * 60 * 1000;
}

export async function getContentsFromUri(uri: string): Promise<any> {
  try {
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error(`Failed to fetch content from ${uri}`);
    }
    return await response.json().then((data) => {
      return data;
    });
  } catch (error) {
    console.error("Error fetching content:", error);
    return "";
  }
}

// ====== Improved Portfolio Helper Functions ======

/**
 * Convert Wei/Atto values to readable numbers
 * @param {string} rawValue - The raw balance string (e.g., "1000000000000000000")
 * @param {number} decimals - Token decimals (default: 18)
 * @returns {number} - Formatted number
 */
export const formatRawBalance = (rawValue: any, decimals = 18) => {
  if (!rawValue || rawValue === "0") return 0;

  const rawBigInt = BigInt(rawValue);
  const divisor = BigInt(10) ** BigInt(decimals);
  const result = Number(rawBigInt) / Number(divisor);

  return result;
};

/**
 * Format currency with appropriate decimal places
 * @param {number} value - The number to format
 * @param {string} symbol - Currency symbol (e.g., "$")
 * @param {number} minDecimals - Minimum decimal places
 * @param {number} maxDecimals - Maximum decimal places
 * @returns {string} - Formatted string
 */
const formatCurrency = (
  value: any,
  symbol = "$",
  minDecimals = 2,
  maxDecimals = 6
) => {
  if (value === 0) return `${symbol}0.00`;

  // For very small values, show more decimals
  if (value < 0.01) {
    return `${symbol}${value.toFixed(maxDecimals)}`;
  }

  // For normal values, show standard decimals
  return `${symbol}${value.toFixed(minDecimals)}`;
};

/**
 * Format large numbers with K, M, B suffixes
 * @param {number} value - The number to format
 * @returns {string} - Formatted string (e.g., "1.2K", "5.6M")
 */
const formatLargeNumber = (value: any) => {
  if (value === 0) return "0";

  const absValue = Math.abs(value);

  if (absValue >= 1000000000) {
    return (value / 1000000000).toFixed(1) + "B";
  } else if (absValue >= 1000000) {
    return (value / 1000000).toFixed(1) + "M";
  } else if (absValue >= 1000) {
    return (value / 1000).toFixed(1) + "K";
  }

  return value.toString();
};

/**
 * Format percentage change with proper sign
 * @param {string|number} change - The percentage change
 * @returns {string} - Formatted string (e.g., "+8.63%", "-2.84%")
 */
const formatPercentageChange = (change: any) => {
  const numChange = typeof change === "string" ? parseFloat(change) : change;
  if (isNaN(numChange)) return "0.00%";

  const sign = "$";
  return `${sign}${numChange.toFixed(2)}`;
};

// ====== Main Portfolio Helper Functions ======

/**
 * Get the number of tokens held (convert from Wei)
 * @param {string} rawBalance - Raw balance string from the API
 * @returns {string} - Formatted token count (e.g., "10,000" or "1.5K")
 */
export const getTokensHeld = (rawBalance: any) => {
  const tokens = formatRawBalance(rawBalance);
  return formatLargeNumber(tokens);
};

/**
 * Calculate price per token in USD
 * @param {string} marketCap - Market cap in USD
 * @param {number} totalSupply - Total supply of tokens
 * @returns {string} - Formatted price (e.g., "$0.000052")
 */
export const getPricePerToken = (marketCap: any, totalSupply: any) => {
  const marketCapNum = parseFloat(marketCap);
  const pricePerToken = marketCapNum / totalSupply;

  return formatCurrency(pricePerToken, "$", 2, 8);
};

/**
 * Calculate the USD value of held tokens
 * @param {string} rawBalance - Raw balance string
 * @param {string} marketCap - Market cap in USD
 * @param {number} totalSupply - Total supply of tokens
 * @returns {string} - Formatted USD value
 */
export const getHeldValue = (
  rawBalance: any,
  marketCap: any,
  totalSupply: any
) => {
  const tokens = formatRawBalance(rawBalance);
  const marketCapNum = parseFloat(marketCap);
  const pricePerToken = marketCapNum / totalSupply;
  const totalValue = tokens * pricePerToken;

  return formatCurrency(totalValue, "$", 2, 6);
};

/**
 * Format market cap change (24h)
 * @param {string} delta - Percentage change
 * @returns {string} - Formatted change with color class
 */
export const formatMarketCapChange = (delta: any) => {
  return formatPercentageChange(delta);
};

/**
 * Get color class for percentage change
 * @param {string} delta - Percentage change
 * @returns {string} - CSS class name
 */
export const getChangeColorClass = (delta: any) => {
  const numDelta = parseFloat(delta);
  if (numDelta > 0) return "positive";
  if (numDelta < 0) return "negative";
  return "neutral";
};

/**
 * Format market cap value
 * @param {string} marketCap - Market cap in USD
 * @returns {string} - Formatted market cap
 */
export const formatMarketCap = (marketCap: any) => {
  const value = parseFloat(marketCap);
  return formatCurrency(value, "$", 2, 2);
};

// ====== Portfolio Summary Helpers ======

/**
 * Calculate total portfolio value
 * @param {Array} portfolioBalances - Array of portfolio items
 * @returns {string} - Total portfolio value
 */
export const getTotalPortfolioValue = (portfolioBalances: any) => {
  const total = portfolioBalances?.reduce((sum: any, item: any) => {
    if (!item) return sum;

    const tokens = formatRawBalance(item.balance);
    const marketCapNum = parseFloat(item.marketCap);
    const pricePerToken = marketCapNum / item.totalSupply;
    const itemValue = tokens * pricePerToken;

    return sum + itemValue;
  }, 0);

  return formatCurrency(total, "$", 2, 2);
};

/**
 * Calculate total tokens held across all positions
 * @param {Array} portfolioBalances - Array of portfolio items
 * @returns {string} - Total tokens held
 */
export const getTotalTokensHeld = (portfolioBalances: any) => {
  const total = portfolioBalances?.reduce((sum: any, item: any) => {
    if (!item) return sum;
    return sum + formatRawBalance(item.balance);
  }, 0);

  return formatLargeNumber(total);
};
