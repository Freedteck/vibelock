// import { createContext, useContext, useState, ReactNode } from "react";
// import { CoinTrack } from "../models";
// import { uploadFileToPinata, uploadJsonToPinata } from "../client/pinata";
// import { viemSetup } from "../client/zora";
// import { Address } from "viem";
// import { createCoin, DeployCurrency } from "@zoralabs/coins-sdk";
// import { createTrack, Track } from "../client/supabase";
// import { useNavigate } from "react-router-dom";

// interface AppState {
//   tracks: CoinTrack[];
//   userPortfolio: UserPortfolio[];
//   transactions: Transaction[];
//   unlockedTracks: number[];
//   isWalletConnected: boolean;
// }

// interface AppContextType extends AppState {
//   unlockTrack: (trackId: number) => void;
//   addTrack: (track: CoinTrack) => void;
//   tradeCoins: (trackId: number, type: "buy" | "sell", amount: number) => void;
//   connectWallet: () => void;
//   disconnectWallet: () => void;
//   addTransaction: (tx: Transaction) => void;
// }

// const AppContext = createContext<AppContextType | null>(null);

// export function AppProvider({ children }: { children: ReactNode }) {
//   const [tracks, setTracks] = useState([]);
//   const [transactions, setTransactions] = useState([]);
//     const navigate = useNavigate();

//   const addTrack = async ({
//     trackData,
//     artistName,
//     walletAddress,
//     artworkFile,
//     previewFile,
//     fullFile,
//     collaborators,
//     walletClient,
//   }: {
//     trackData: { title: string; description: string; genre: string };
//     artistName: string;
//     walletAddress: string;
//     artworkFile: File;
//     previewFile: File;
//     fullFile: File;
//     collaborators: {
//       name: string;
//       walletAddress: string;
//       role: string;
//       percentage: number;
//     }[];
//     walletClient: any;
//   }) => {
//     try {
//       const coverUrl = await uploadFileToPinata(artworkFile);
//       const standardAudioUrl = await uploadFileToPinata(previewFile);
//       const premiumAudioUrl = await uploadFileToPinata(fullFile);

//       const metadata = {
//         name: trackData.title,
//         description: trackData.description,
//         image: coverUrl,
//         animation_url: standardAudioUrl,
//         content: {
//           mime: "audio/mpeg",
//           uri: standardAudioUrl,
//         },
//         attributes: [
//           { trait_type: "Genre", value: trackData.genre },
//           { trait_type: "Artist", value: artistName },
//         ],
//         extra: {
//           premium_audio: premiumAudioUrl,
//           collaborators,
//           artist_wallet: walletAddress,
//           split_contract:
//             collaborators.length > 1 ? "split_contract_address" : "",
//         },
//       };

//       const jsonUri = await uploadJsonToPinata(metadata);

//       const { publicClient } = viemSetup(walletAddress);
//       const coinParams = {
//         name: trackData.title,
//         symbol: "MUSIC",
//         uri: jsonUri.toString(),
//         chainId: 84532, // baseSepolia.id
//         owners: collaborators.map((c) => c.walletAddress as Address),
//         payoutRecipient: walletAddress.toLowerCase() as Address,
//         platformReferrer: walletAddress.toLowerCase() as Address,
//         currency: DeployCurrency.ETH,
//       };

//       const result = await createCoin(coinParams, walletClient, publicClient);

//       const track: Track = {
//         title: trackData.title,
//         deployed_address: result.address?.toString() || "",
//         wallet_address: walletAddress.toLowerCase(),
//       };

//       const { error } = await createTrack(track);
//       if (error) throw error;
//       // Navigate to success page or track detail
//       navigate("/dashboard");
//     } catch (err) {
//       console.error("Error in addTrack:", err);
//       alert("Failed to upload track.");
//     }
//   };

//   const tradeCoins = (
//     // trackId: number,
//     // type: "buy" | "sell",
//     // amount: number
//   ) => {
//     // const track = tracks.find((t) => t.id === trackId);
//     // if (!track) return;

//     // if (type === "buy") {
//     //   setTracks((prev) =>
//     //     prev.map((t) =>
//     //       t.id === trackId
//     //         ? {
//     //             ...t,
//     //             holders: t.holders + 1,
//     //             currentSupply: t.currentSupply + amount,
//     //           }
//     //         : t
//     //     )
//     //   );

//     //   setUserPortfolio((prev) => {
//     //     const existing = prev.find((p) => p.trackId === trackId);
//     //     const newEntry = {
//     //       trackId,
//     //       coinsHeld: (existing?.coinsHeld || 0) + amount,
//     //       purchasePrice: track.coinPrice,
//     //       currentValue: track.coinPrice,
//     //       percentageChange: 0,
//     //     };

//     //     return [...prev.filter((p) => p.trackId !== trackId), newEntry];
//     //   });
//     // }

//     // if (type === "sell") {
//     //   setTracks((prev) =>
//     //     prev.map((t) =>
//     //       t.id === trackId
//     //         ? { ...t, currentSupply: Math.max(0, t.currentSupply - amount) }
//     //         : t
//     //     )
//     //   );

//     //   setUserPortfolio((prev) => {
//     //     const existing = prev.find((p) => p.trackId === trackId);
//     //     const newHeld = (existing?.coinsHeld || 0) - amount;

//     //     if (newHeld <= 0) return prev.filter((p) => p.trackId !== trackId);

//     //     return prev.map((p) =>
//     //       p.trackId === trackId ? { ...p, coinsHeld: newHeld } : p
//     //     );
//     //   });
//     // }
//   };

//   const addTransaction = (tx: Transaction) => {
//     setTransactions((prev) => [tx, ...prev]);
//   };

//   return (
//     <AppContext.Provider
//       value={{
//         tracks,
//         userPortfolio,
//         transactions,
//         unlockTrack,
//         addTrack,
//         tradeCoins,
//         addTransaction,
//       }}
//     >
//       {children}
//     </AppContext.Provider>
//   );
// }

// export function useAppContext() {
//   const context = useContext(AppContext);
//   if (!context)
//     throw new Error("useAppContext must be used within AppProvider");
//   return context;
// }
