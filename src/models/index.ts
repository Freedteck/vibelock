export interface MusicTrack {
  name: string;
  description: string;
  image: string;
  animation_url: string;
  content: {
    mime: string;
    uri: string;
  };
  attributes: [
    { trait_type: string; value: string },
    { trait_type: string; value: string }
  ];
  extra: {
    premium_audio: string;
    collaborators: {
      name: string;
      wallet: string;
      role: string;
      percentage: number;
    }[];
    artist_wallet: string;
    split_contract: string;
  };
}

export interface CoinMetadata {
  name: string;
  description: string;
  image: string;
  animation_url: string;
  content: {
    mime: string;
    uri: string;
  };
  properties: {
    category: string;
  };
}

export interface CoinTrack {
  id: string; // coin address
  title: string; // from coin.name
  artistWallet: string; // coin.creatorAddress
  description?: string; // optional
  mimeType: string; // coin.mediaContent.mimeType
  mediaUrl: string; // coin.mediaContent.originalUri
  artworkUrl: string; // coin.previewImage.medium
  createdAt: string; // original ISO string
  formattedDate: string; // human-readable
  isNew: boolean; // created within last 24h?
  totalSupply: number;
  uniqueHolders: number;
  genre?: string; // optional genre
  artist: string; // artist name
  premiumAudio?: string; // optional premium audio URL
  balance?: number; // user's balance of this track
  collaborators?: {
    name: string;
    wallet: string;
    role: string;
    percentage: number;
  }[]; // optional collaborators
  marketCap: number;
  volume24h?: number; // percentage change in market cap over 24h
}

export const genres = [
  "Electronic",
  "Hip-Hop",
  "Indie",
  "Ambient",
  "House",
  "Techno",
  "R&B",
  "Pop",
  "Rock",
  "Jazz",
];
