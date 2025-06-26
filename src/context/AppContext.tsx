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
import { Address } from "viem";
import { createCoin, DeployCurrency } from "@zoralabs/coins-sdk";
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
import { baseSepolia } from "viem/chains";
import { SplitV2Client } from "@0xsplits/splits-sdk";

interface AppState {
  tracks: CoinTrack[];
  trackLoading: boolean;
  artists?: Artist[];
  artistLoading?: boolean;
}

export enum SplitV2Type {
  Push = "push",
  Pull = "pull",
}

interface AppContextType extends AppState {
  unlockTrack?: (trackId: number) => void;
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
  }) => void;
  tradeCoins: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [tracks, setTracks] = useState<any[]>([]);
  const { data: walletClient } = useWalletClient();
  const [trackLoading, setTrackLoading] = useState(false);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [artistLoading, setArtistLoading] = useState(false);

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
          };
        })
      );

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
        chainId: baseSepolia.id, // Base Sepolia chain ID
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
        chainId: Number(baseSepolia.id),
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
        uri: jsonUri.toString(),
        chainId: Number(baseSepolia.id), // baseSepolia.id
        owners: collaborators.map((c) => c.walletAddress as Address),
        payoutRecipient:
          collaborators.length > 1
            ? (splitAddress as Address) // use the split contract
            : (walletAddress.toLowerCase() as Address),
        platformReferrer:
          "0xb43C9F0F2bb65A37761E7867a6f1903799f45D65" as Address,
        currency: DeployCurrency.ETH,
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
    } catch (error) {
      console.error("Error adding track:", error);
      throw error; // Re-throw to handle in the component
    }
  };

  const tradeCoins = () =>
    // trackId: number,
    // type: "buy" | "sell",
    // amount: number
    {};

  return (
    <AppContext.Provider
      value={{
        tracks,
        trackLoading,
        artists,
        artistLoading,
        addTrack,
        tradeCoins,
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
