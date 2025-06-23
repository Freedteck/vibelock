import { getCoin, getCoins } from "@zoralabs/coins-sdk";
import { createPublicClient, createWalletClient, Hex, http } from "viem";
import { baseSepolia } from "viem/chains";

// Set up viem clients
export const viemSetup = (account: any) => {
  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });

  const walletClient = createWalletClient({
    account: account as Hex,
    chain: baseSepolia,
    transport: http(),
  });

  return { publicClient, walletClient };
};

export async function fetchSingleCoin(coinAddress: string) {
  const response = await getCoin({
    address: coinAddress,
    chain: baseSepolia.id, // Optional: Base chain set by default
  });

  const coin = response.data?.zora20Token;

  return { response, coin };
}

export async function fetchMultipleCoins(coinAddresses: string[]) {
  const coins = coinAddresses.map((address) => ({
    collectionAddress: address,
    chainId: baseSepolia.id,
  }));

  const response = await getCoins({ coins: coins });

  const coinData = response.data?.zora20Tokens || [];

  return { response, coins: coinData };
}
