import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { useState, useEffect } from "react";

export const useWallet = () => {
  const { address, isConnected, status } = useAppKitAccount();
  const { open } = useAppKit();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (address) {
      setWalletAddress(address);
    }
    setIsConnecting(status === "connecting");
  }, [address, status]);

  const connectWallet = async () => {
    open();
  };

  return {
    isConnected,
    walletAddress,
    isConnecting,
    connectWallet,
  };
};
