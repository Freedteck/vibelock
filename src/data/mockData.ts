export interface Track {
  id: number;
  title: string;
  artist: string;
  genre: string;
  duration: string;
  previewUrl: string;
  fullUrl: string;
  artwork: string;
  coinPrice: number;
  holders: number;
  isUnlocked: boolean;
  collaborators: Collaborator[];
  tradingHistory: TradingPoint[];
  description?: string;
  releaseDate: string;
  playCount: number;
  maxSupply: number;
  currentSupply: number;
  uniqueHolders?: number;
}

export interface Collaborator {
  name: string;
  role: string;
  percentage: number;
}

export interface TradingPoint {
  timestamp: string;
  price: number;
  volume: number;
}

export interface Artist {
  id: number;
  name: string;
  avatar: string;
  banner: string;
  bio: string;
  followers: number;
  totalTracks: number;
  totalEarnings: number;
  socialLinks: {
    twitter?: string;
    instagram?: string;
    spotify?: string;
  };
}

export interface UserPortfolio {
  trackId: number;
  coinsHeld: number;
  purchasePrice: number;
  currentValue: number;
  percentageChange: number;
}

export interface Transaction {
  id: string;
  type: "unlock" | "purchase" | "sell";
  trackId: number;
  amount: number;
  price: number;
  timestamp: string;
  status: "pending" | "completed" | "failed";
}

// Real audio URLs for testing
const audioUrls = {
  preview: [
    "https://www.soundjay.com/misc/sounds/fail-buzzer-02.wav",
    "https://actions.google.com/sounds/v1/alarms/bugle_tune.ogg",
    "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    "https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg",
    "https://www.soundjay.com/misc/sounds/fail-buzzer-02.wav",
    "https://actions.google.com/sounds/v1/alarms/bugle_tune.ogg",
  ],
  full: [
    "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    "https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg",
    "https://www.soundjay.com/misc/sounds/fail-buzzer-02.wav",
    "https://actions.google.com/sounds/v1/alarms/bugle_tune.ogg",
    "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    "https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg",
  ],
};

export const mockTracks: Track[] = [
  {
    id: 1,
    title: "Midnight Drive",
    artist: "SynthWave",
    genre: "Electronic",
    duration: "3:24",
    previewUrl: audioUrls.preview[0],
    fullUrl: audioUrls.full[0],
    artwork:
      "https://images.pexels.com/photos/1144261/pexels-photo-1144261.jpeg?auto=compress&cs=tinysrgb&w=300",
    coinPrice: 0.0025,
    holders: 89,
    isUnlocked: false,
    releaseDate: "2024-01-15",
    playCount: 12547,
    maxSupply: 1000,
    currentSupply: 89,
    description:
      "A synthwave journey through neon-lit streets and midnight highways. This track captures the essence of retro-futuristic vibes with modern production.",
    collaborators: [
      { name: "SynthWave", role: "Artist", percentage: 50 },
      { name: "BeatMaker", role: "Producer", percentage: 35 },
      { name: "LyricFlow", role: "Writer", percentage: 15 },
    ],
    tradingHistory: [
      { timestamp: "2024-01-15", price: 0.002, volume: 150 },
      { timestamp: "2024-01-16", price: 0.0022, volume: 200 },
      { timestamp: "2024-01-17", price: 0.0025, volume: 180 },
    ],
  },
  {
    id: 2,
    title: "Neon Dreams",
    artist: "Luna Beats",
    genre: "Ambient",
    duration: "4:12",
    previewUrl: audioUrls.preview[1],
    fullUrl: audioUrls.full[1],
    artwork:
      "https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=300",
    coinPrice: 0.0035,
    holders: 156,
    isUnlocked: true,
    releaseDate: "2024-01-10",
    playCount: 8934,
    maxSupply: 800,
    currentSupply: 156,
    description:
      "Ethereal ambient soundscapes that transport you to a world of neon-lit dreams and cosmic wonder.",
    collaborators: [
      { name: "Luna Beats", role: "Artist", percentage: 70 },
      { name: "Cosmic Producer", role: "Producer", percentage: 30 },
    ],
    tradingHistory: [
      { timestamp: "2024-01-10", price: 0.003, volume: 120 },
      { timestamp: "2024-01-11", price: 0.0032, volume: 180 },
      { timestamp: "2024-01-12", price: 0.0035, volume: 200 },
    ],
  },
  {
    id: 3,
    title: "City Lights",
    artist: "Digital Nomad",
    genre: "Hip-Hop",
    duration: "2:58",
    previewUrl: audioUrls.preview[2],
    fullUrl: audioUrls.full[2],
    artwork:
      "https://images.pexels.com/photos/2246476/pexels-photo-2246476.jpeg?auto=compress&cs=tinysrgb&w=300",
    coinPrice: 0.0018,
    holders: 234,
    isUnlocked: false,
    releaseDate: "2024-01-08",
    playCount: 15678,
    maxSupply: 1200,
    currentSupply: 234,
    description:
      "Urban beats that capture the pulse of the city. Raw energy meets polished production in this hip-hop masterpiece.",
    collaborators: [
      { name: "Digital Nomad", role: "Artist", percentage: 60 },
      { name: "Street Beats", role: "Producer", percentage: 40 },
    ],
    tradingHistory: [
      { timestamp: "2024-01-08", price: 0.0015, volume: 300 },
      { timestamp: "2024-01-09", price: 0.0017, volume: 250 },
      { timestamp: "2024-01-10", price: 0.0018, volume: 280 },
    ],
  },
  {
    id: 4,
    title: "Ocean Waves",
    artist: "Aqua Sound",
    genre: "Ambient",
    duration: "5:33",
    previewUrl: audioUrls.preview[3],
    fullUrl: audioUrls.full[3],
    artwork:
      "https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=300",
    coinPrice: 0.0042,
    holders: 67,
    isUnlocked: true,
    releaseDate: "2024-01-05",
    playCount: 9876,
    maxSupply: 500,
    currentSupply: 67,
    description:
      "Immersive ocean soundscapes with gentle waves and ambient textures for deep relaxation.",
    collaborators: [
      { name: "Aqua Sound", role: "Artist", percentage: 80 },
      { name: "Nature Sounds", role: "Sound Designer", percentage: 20 },
    ],
    tradingHistory: [
      { timestamp: "2024-01-05", price: 0.004, volume: 80 },
      { timestamp: "2024-01-06", price: 0.0041, volume: 90 },
      { timestamp: "2024-01-07", price: 0.0042, volume: 85 },
    ],
  },
  {
    id: 5,
    title: "Electric Pulse",
    artist: "Voltage",
    genre: "Techno",
    duration: "6:15",
    previewUrl: audioUrls.preview[4],
    fullUrl: audioUrls.full[4],
    artwork:
      "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=300",
    coinPrice: 0.0031,
    holders: 198,
    isUnlocked: false,
    releaseDate: "2024-01-12",
    playCount: 18234,
    maxSupply: 900,
    currentSupply: 198,
    description:
      "High-energy techno with pulsing basslines and electric synths that will move any dancefloor.",
    collaborators: [
      { name: "Voltage", role: "Artist", percentage: 65 },
      { name: "Bass Master", role: "Producer", percentage: 35 },
    ],
    tradingHistory: [
      { timestamp: "2024-01-12", price: 0.003, volume: 220 },
      { timestamp: "2024-01-13", price: 0.0031, volume: 240 },
      { timestamp: "2024-01-14", price: 0.0031, volume: 210 },
    ],
  },
  {
    id: 6,
    title: "Starlight Serenade",
    artist: "Cosmic Melody",
    genre: "Indie",
    duration: "4:45",
    previewUrl: audioUrls.preview[5],
    fullUrl: audioUrls.full[5],
    artwork:
      "https://images.pexels.com/photos/1629236/pexels-photo-1629236.jpeg?auto=compress&cs=tinysrgb&w=300",
    coinPrice: 0.0028,
    holders: 143,
    isUnlocked: true,
    releaseDate: "2024-01-03",
    playCount: 11567,
    maxSupply: 750,
    currentSupply: 143,
    description:
      "Dreamy indie melodies that capture the magic of starlit nights and cosmic wonder.",
    collaborators: [
      { name: "Cosmic Melody", role: "Artist", percentage: 75 },
      { name: "Dream Producer", role: "Producer", percentage: 25 },
    ],
    tradingHistory: [
      { timestamp: "2024-01-03", price: 0.0025, volume: 160 },
      { timestamp: "2024-01-04", price: 0.0027, volume: 170 },
      { timestamp: "2024-01-05", price: 0.0028, volume: 155 },
    ],
  },
  {
    id: 7,
    title: "Digital Horizon",
    artist: "Cyber Dreams",
    genre: "Electronic",
    duration: "3:45",
    previewUrl: audioUrls.preview[0],
    fullUrl: audioUrls.full[0],
    artwork:
      "https://images.pexels.com/photos/2047905/pexels-photo-2047905.jpeg?auto=compress&cs=tinysrgb&w=300",
    coinPrice: 0.0022,
    holders: 112,
    isUnlocked: false,
    releaseDate: "2024-01-20",
    playCount: 7890,
    maxSupply: 600,
    currentSupply: 112,
    description:
      "Futuristic electronic beats that paint a picture of tomorrow's digital landscape.",
    collaborators: [{ name: "Cyber Dreams", role: "Artist", percentage: 100 }],
    tradingHistory: [
      { timestamp: "2024-01-20", price: 0.002, volume: 130 },
      { timestamp: "2024-01-21", price: 0.0021, volume: 140 },
      { timestamp: "2024-01-22", price: 0.0022, volume: 125 },
    ],
  },
  {
    id: 8,
    title: "Moonlit Jazz",
    artist: "Smooth Operator",
    genre: "Jazz",
    duration: "5:12",
    previewUrl: audioUrls.preview[1],
    fullUrl: audioUrls.full[1],
    artwork:
      "https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=300",
    coinPrice: 0.0038,
    holders: 78,
    isUnlocked: false,
    releaseDate: "2024-01-18",
    playCount: 5432,
    maxSupply: 400,
    currentSupply: 78,
    description:
      "Smooth jazz melodies under the moonlight, perfect for late-night contemplation.",
    collaborators: [
      { name: "Smooth Operator", role: "Artist", percentage: 85 },
      { name: "Jazz Ensemble", role: "Musicians", percentage: 15 },
    ],
    tradingHistory: [
      { timestamp: "2024-01-18", price: 0.0035, volume: 90 },
      { timestamp: "2024-01-19", price: 0.0037, volume: 85 },
      { timestamp: "2024-01-20", price: 0.0038, volume: 80 },
    ],
  },
];

export const mockArtists: Artist[] = [
  {
    id: 1,
    name: "SynthWave",
    avatar:
      "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150",
    banner:
      "https://images.pexels.com/photos/1144261/pexels-photo-1144261.jpeg?auto=compress&cs=tinysrgb&w=800",
    bio: "Electronic music producer creating atmospheric soundscapes and retro-futuristic beats.",
    followers: 1250,
    totalTracks: 12,
    totalEarnings: 2.45,
    socialLinks: {
      twitter: "@synthwave_music",
      instagram: "@synthwave.official",
    },
  },
  {
    id: 2,
    name: "Luna Beats",
    avatar:
      "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150",
    banner:
      "https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=800",
    bio: "Ambient and downtempo artist focusing on meditative and healing frequencies.",
    followers: 2100,
    totalTracks: 18,
    totalEarnings: 4.12,
    socialLinks: {
      twitter: "@lunabeats_music",
      spotify: "Luna Beats Official",
    },
  },
  {
    id: 3,
    name: "Digital Nomad",
    avatar:
      "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150",
    banner:
      "https://images.pexels.com/photos/2246476/pexels-photo-2246476.jpeg?auto=compress&cs=tinysrgb&w=800",
    bio: "Hip-hop artist and producer bringing urban stories to life through beats and rhymes.",
    followers: 3400,
    totalTracks: 24,
    totalEarnings: 6.78,
    socialLinks: {
      twitter: "@digitalnomad_hh",
      instagram: "@digitalnomad.music",
    },
  },
  {
    id: 4,
    name: "Voltage",
    avatar:
      "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150",
    banner:
      "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=800",
    bio: "Techno producer pushing the boundaries of electronic music with innovative sound design.",
    followers: 2890,
    totalTracks: 16,
    totalEarnings: 5.23,
    socialLinks: {
      twitter: "@voltage_techno",
      instagram: "@voltage.official",
    },
  },
];

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

// Mock user portfolio data
export const mockPortfolio: UserPortfolio[] = [
  {
    trackId: 1,
    coinsHeld: 5,
    purchasePrice: 0.002,
    currentValue: 0.0025,
    percentageChange: 25,
  },
  {
    trackId: 2,
    coinsHeld: 8,
    purchasePrice: 0.003,
    currentValue: 0.0035,
    percentageChange: 16.67,
  },
  {
    trackId: 3,
    coinsHeld: 12,
    purchasePrice: 0.0015,
    currentValue: 0.0018,
    percentageChange: 20,
  },
];

// Mock transactions
export const mockTransactions: Transaction[] = [
  {
    id: "tx_001",
    type: "unlock",
    trackId: 2,
    amount: 1,
    price: 0.0035,
    timestamp: "2024-01-17T10:30:00Z",
    status: "completed",
  },
  {
    id: "tx_002",
    type: "purchase",
    trackId: 1,
    amount: 5,
    price: 0.0025,
    timestamp: "2024-01-16T15:45:00Z",
    status: "completed",
  },
];
