import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { CoinTrack, MusicTrack } from "../models";
import { uploadFileToPinata, uploadJsonToPinata } from "../client/pinata";
import { fetchMultipleCoins, viemSetup } from "../client/zora";
import { Address, parseEther } from "viem";
import {
  createCoin,
  DeployCurrency,
  getProfileBalances,
  tradeCoin,
  ValidMetadataURI,
} from "@zoralabs/coins-sdk";
import {
  Artist,
  createTrack,
  getArtists,
  getTracks,
  Track,
} from "../client/supabase";
import { useWalletClient } from "wagmi";
import {
  formatCreatedAt,
  getContentsFromUri,
  isTrackNew,
} from "../client/helper";
import { base } from "viem/chains";
import { SplitV2Client } from "@0xsplits/splits-sdk";

interface AppState {
  tracks: CoinTrack[];
  trackLoading: boolean;
  artists?: Artist[];
  artistLoading?: boolean;
  profileBalances?: any;
}

enum SplitV2Type {
  Push = "push",
  Pull = "pull",
}

interface AppContextType extends AppState {
  addTrack: ({
    trackData,
    artistName,
    walletAddress,
    artworkFile,
    previewFile,
    fullFile,
    collaborators,
  }: {
    trackData: { title: string; description: string; genre: string };
    artistName: string;
    walletAddress: string;
    artworkFile: File;
    previewFile: File;
    fullFile: File;
    collaborators: {
      name: string;
      walletAddress: string;
      role: string;
      percentage: number;
    }[];
  }) => Promise<any>;
  tradeCoins: ({
    type,
    amount,
    walletAddress,
    coinAddress,
  }: {
    type: "eth" | "coin" | "usdc";
    amount: string;
    walletAddress: string;
    coinAddress: string;
  }) => Promise<any>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [tracks, setTracks] = useState<any[]>([]);
  const { data: walletClient } = useWalletClient();
  const [trackLoading, setTrackLoading] = useState(false);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [artistLoading, setArtistLoading] = useState(false);
  const [profileBalances, setProfileBalances] = useState({});

  const fetchUserBalances = useCallback(async () => {
    const response = await getProfileBalances({
      identifier: walletClient?.account?.address as Address,
    });

    const profile: any = response.data?.profile;
    // const totalCoins = profile.coinBalances?.count || 0;
    const balances =
      profile.coinBalances?.edges.filter(
        (coin: any) => coin?.node?.coin?.symbol === "MUSIC"
      ) || [];

    // Format balances to match expected structure
    const formattedBalance = await Promise.all(
      balances.map(async (coin: any) => {
        const supply = Number(coin.node.coin.totalSupply);
        const holders = coin.node.coin.uniqueHolders ?? 0;
        const tokenUri = coin?.node?.coin?.tokenUri;
        const marketCap = coin.node.coin.marketCap || 0;
        const volume24h = coin.node.coin.volume24h || 0;

        let tokenDetails: MusicTrack | undefined = undefined;
        try {
          tokenDetails = await getContentsFromUri(tokenUri || "");
        } catch (e) {
          console.error(`Failed to fetch token details for ${tokenUri}`, e);
        }

        return {
          id: coin?.node?.coin?.address,
          balance: coin?.node?.balance,
          title: coin.node.coin.name,
          artistWallet: coin.node.coin.creatorAddress,
          description: coin.node.coin.description,
          mimeType: coin.node.coin.mediaContent?.mimeType,
          mediaUrl: coin.node.coin.mediaContent?.originalUri,
          artworkUrl: coin.node.coin.mediaContent?.previewImage?.medium,
          createdAt: coin.node.coin.createdAt,
          formattedDate: formatCreatedAt(coin?.node?.coin?.createdAt ?? ""),
          isNew: isTrackNew(coin?.node?.coin?.createdAt ?? ""),
          totalSupply: supply,
          uniqueHolders: holders,
          genre: tokenDetails?.attributes[0]?.value || "Unknown",
          artist: tokenDetails?.attributes[1]?.value || "Unknown Artist",
          premiumAudio: tokenDetails?.extra?.premium_audio || "",
          collaborators: tokenDetails!.extra?.collaborators || [],
          marketCap: marketCap,
          volume24h: volume24h,
        };
      })
    );

    setProfileBalances(formattedBalance);
  }, [walletClient]);

  const fetchCoins = useCallback(async () => {
    setTrackLoading(true);
    try {
      const { data, error } = await getTracks();
      setTrackLoading(false);
      if (error) throw error;

      const { coins } = await fetchMultipleCoins(
        data?.map((track) => track.deployed_address) || []
      );

      const formattedTracks = await Promise.all(
        coins.map(async (coin) => {
          const supply = Number(coin.totalSupply);
          const holders = coin.uniqueHolders ?? 0;
          const tokenUri = coin.tokenUri;
          const marketCap = coin.marketCap || 0;
          const volume24h = coin.volume24h || 0;

          let tokenDetails: MusicTrack | undefined = undefined;
          try {
            tokenDetails = await getContentsFromUri(tokenUri || "");
          } catch (e) {
            console.error(`Failed to fetch token details for ${tokenUri}`, e);
          }

          return {
            id: coin.address,
            title: coin.name,
            artistWallet: coin.creatorAddress,
            description: coin.description,
            mimeType: coin.mediaContent?.mimeType,
            mediaUrl: coin.mediaContent?.originalUri,
            artworkUrl: coin.mediaContent?.previewImage?.medium,
            createdAt: coin.createdAt,
            formattedDate: formatCreatedAt(coin?.createdAt ?? ""),
            isNew: isTrackNew(coin?.createdAt ?? ""),
            totalSupply: supply,
            uniqueHolders: holders,
            genre: tokenDetails?.attributes[0]?.value || "Unknown",
            artist: tokenDetails?.attributes[1]?.value || "Unknown Artist",
            premiumAudio: tokenDetails?.extra?.premium_audio || "",
            collaborators: tokenDetails!.extra?.collaborators || [],
            marketCap: marketCap,
            volume24h: volume24h,
          };
        })
      );

      // console.log("Formatted Tracks:", formattedTracks);

      setTracks(formattedTracks);
      return formattedTracks;
    } catch (error) {
      console.error("Error fetching coin data:", error);
      return []; // Return empty array on error
    } finally {
      setTrackLoading(false);
    }
  }, []);

  const fetchArtists = useCallback(async () => {
    try {
      setArtistLoading(true);
      const { data, error } = await getArtists();
      if (error) throw error;
      setArtistLoading(false);

      setArtists(data || []);
    } catch (error) {
      console.error("Error fetching artists:", error);
      setArtistLoading(false);
      return [];
    }
  }, []);

  useEffect(() => {
    fetchCoins();
  }, [fetchCoins]);

  useEffect(() => {
    fetchArtists();
  }, [fetchArtists]);

  useEffect(() => {
    if (walletClient?.account?.address) {
      fetchUserBalances();
    } else {
      setProfileBalances([]);
    }
  }, [fetchUserBalances, walletClient]);

  const addTrack = async ({
    trackData,
    artistName,
    walletAddress,
    artworkFile,
    previewFile,
    fullFile,
    collaborators,
  }: {
    trackData: { title: string; description: string; genre: string };
    artistName: string;
    walletAddress: string;
    artworkFile: File;
    previewFile: File;
    fullFile: File;
    collaborators: {
      name: string;
      walletAddress: string;
      role: string;
      percentage: number;
    }[];
  }) => {
    try {
      const coverUrl = await uploadFileToPinata(artworkFile);
      const standardAudioUrl = await uploadFileToPinata(previewFile);
      const premiumAudioUrl = await uploadFileToPinata(fullFile);

      if (!walletClient?.account?.address) {
        throw new Error("Wallet not connected. Please connect your wallet.");
      }
      const { publicClient } = viemSetup(walletAddress);

      const splitsClient = new SplitV2Client({
        chainId: base.id, // Base chain ID
        publicClient, // viem public client (optional, required if using any of the contract functions)
        walletClient, // viem wallet client (optional, required if using any contract write functions. must have an account already attached)
        includeEnsNames: false,
        apiConfig: {
          apiKey: `${import.meta.env.VITE_SPLIT_API_KEY}`, // You can create an API key by signing up on our app, and accessing your account settings at app.splits.org/settings.
        }, // Splits GraphQL API key config, this is required for the data client to access the splits graphQL API.
      });

      const args = {
        recipients: collaborators.map((c) => ({
          address: c.walletAddress.toLowerCase() as Address,
          percentAllocation: c.percentage,
        })),
        distributorFeePercent: 1.0,
        totalAllocationPercent: 100.0,
        splitType: SplitV2Type.Push,
        ownerAddress: walletClient.account.address.toLowerCase() as Address,
        creatorAddress: walletClient.account.address.toLowerCase() as Address,
        chainId: Number(base.id),
      };
      let splitAddress = "";
      if (collaborators.length > 1) {
        const split = await splitsClient.createSplit(args);
        console.log(split);

        splitAddress = split.splitAddress ?? "";
      }

      const metadata = {
        name: trackData.title,
        description: trackData.description,
        image: coverUrl,
        animation_url: standardAudioUrl,
        content: {
          mime: "audio/mpeg",
          uri: standardAudioUrl,
        },
        attributes: [
          { trait_type: "Genre", value: trackData.genre },
          { trait_type: "Artist", value: artistName },
        ],
        extra: {
          premium_audio: premiumAudioUrl,
          collaborators,
          artist_wallet: walletAddress,
          split_contract: collaborators.length > 1 ? splitAddress : "",
        },
      };

      const jsonUri = await uploadJsonToPinata(metadata);

      const coinParams = {
        name: trackData.title,
        symbol: "MUSIC",
        uri: jsonUri as ValidMetadataURI,
        chainId: Number(base.id),
        owners: collaborators.map((c) => c.walletAddress as Address),
        payoutRecipient:
          collaborators.length > 1
            ? (splitAddress as Address) // use the split contract
            : (walletAddress.toLowerCase() as Address),
        platformReferrer:
          "0xb43C9F0F2bb65A37761E7867a6f1903799f45D65" as Address,
        currency: DeployCurrency.ZORA,
      };

      if (!walletClient) {
        throw new Error("Wallet client is not available.");
      }
      const result = await createCoin(coinParams, walletClient, publicClient);

      const track: Track = {
        title: trackData.title,
        deployed_address: result.address?.toString() || "",
        wallet_address: walletAddress.toLowerCase(),
      };

      const { error } = await createTrack(track);
      if (error) throw error;
      fetchCoins();
      fetchUserBalances();
      return result;
    } catch (error) {
      console.error("Error adding track:", error);
      throw error; // Re-throw to handle in the component
    }
  };

  const tradeCoins = async ({
    type,
    amount,
    walletAddress,
    coinAddress,
  }: {
    type: "eth" | "coin" | "usdc";
    amount: string;
    walletAddress: string;
    coinAddress: string;
  }) => {
    if (!walletClient) {
      throw new Error("Wallet client is not available.");
    }

    let tradeParameters: any;

    if (type === "eth") {
      tradeParameters = {
        sell: { type: "eth" },
        buy: {
          type: "erc20",
          address: coinAddress,
        },
        amountIn: parseEther(amount),
        slippage: 0.05, // 5% slippage tolerance
        sender: walletAddress,
      };
    } else if (type === "usdc") {
      tradeParameters = {
        sell: {
          type: "erc20",
          address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC address
        },
        buy: {
          type: "erc20",
          address: coinAddress,
        },
        amountIn: BigInt(+amount * 10 ** 6),
        slippage: 0.05, // 5% slippage tolerance
        sender: walletAddress,
      };
    } else {
      tradeParameters = {
        sell: { type: "erc20", address: coinAddress },
        buy: {
          type: "eth",
        },
        amountIn: parseEther(amount),
        slippage: 0.15, // 5% slippage tolerance
        sender: walletAddress,
      };
    }

    const { publicClient } = viemSetup(walletAddress);
    const receipt = await tradeCoin({
      tradeParameters,
      walletClient,
      account: walletClient.account,
      publicClient,
    });

    await fetchCoins();
    await fetchUserBalances();
    return receipt;
  };

  return (
    <AppContext.Provider
      value={{
        tracks,
        trackLoading,
        artists,
        artistLoading,
        addTrack,
        tradeCoins,
        profileBalances,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context)
    throw new Error("useAppContext must be used within AppProvider");
  return context;
}
