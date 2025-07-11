import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { createAppKit } from "@reown/appkit/react";
import {
  arbitrum,
  base,
  baseSepolia,
  mainnet,
  zoraSepolia,
  zoraTestnet,
} from "@reown/appkit/networks";
import { WagmiProvider } from "wagmi";
import { createPublicClient, http } from "viem";
import { SplitsProvider } from "@0xsplits/splits-sdk-react";

// 0. Setup queryClient
const queryClient = new QueryClient();

// 1. Get projectId from https://cloud.reown.com
const projectId = "14be22a881c24b68853f61a804b4cf8b";

// 2. Create a metadata object - optional
const metadata = {
  name: "vibe lock",
  description: "AppKit Example",
  url: "https://vibelock.netlify.app", // origin must match your domain & subdomain
  icons: ["https://assets.reown.com/reown-profile-pic.png"],
};

// 3. Set the networks
const networks = [
  mainnet,
  arbitrum,
  base,
  baseSepolia,
  zoraTestnet,
  zoraSepolia,
] as [
  typeof mainnet,
  typeof arbitrum,
  typeof base,
  typeof baseSepolia,
  typeof zoraTestnet,
  typeof zoraSepolia
];

// 4. Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
});

// 5. Create modal
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
  },
});

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

const splitsConfig = {
  chainId: base.id,
  publicClient,
  // apiConfig: {
  //   apiKey: `${import.meta.env.VITE_SPLIT_API_KEY}`, // You can create an API key by signing up on our app, and accessing your account settings at app.splits.org/settings.
  // }, // Splits GraphQL API key config, this is required for the data client to access the splits graphQL API.
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <SplitsProvider config={splitsConfig}>
          <App />
        </SplitsProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>
);
