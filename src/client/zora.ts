import { DeployCurrency } from "@zoralabs/coins-sdk";
import { Address } from "viem";

export type CreateCoinArgs = {
  name: string; // The name of the coin (e.g., "My Awesome Coin")
  symbol: string; // The trading symbol for the coin (e.g., "MAC")
  uri: string; // Metadata URI (an IPFS URI is recommended)
  chainId?: number; // The chain ID (defaults to base mainnet)
  owners?: Address[]; // Optional array of owner addresses, defaults to [payoutRecipient]
  payoutRecipient: Address; // Address that receives creator earnings
  platformReferrer?: Address; // Optional platform referrer address, earns referral fees
  // DeployCurrency.ETH or DeployCurrency.ZORA
  currency?: DeployCurrency; // Optional currency for trading (ETH or ZORA)
};
