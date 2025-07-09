# VibeLock

VibeLock is a decentralized music streaming platform where each track is tokenized using Zora Coins. Artists can upload songs, define collaborators with custom royalty splits, and monetize their content through on-chain sales and gated access. Standard versions are available to all, while full versions are only accessible to token holders.

## Features

- Artists mint songs as coins via Zora
- Token-gated access to full versions of tracks
- Collaborator splits using 0xSplits with custom percentages
- Metadata stored on IPFS via Pinata
- Direct payment to all involved parties upon trade
- Fan discovery, artist profiles, and comment sections

## Tech Stack

### Protocols & Infrastructure

- **Zora CoinV4** – for minting, trading, and managing music coins
- **0xSplits** – for handling collaborator revenue splits
- **IPFS (via Pinata)** – for metadata storage (track info, collaborators, etc.)
- **Supabase** – for user accounts, public comments, and track indexing

### Frontend

- **React + Vite** – lightweight and fast frontend setup
- **CSS Modules** – modular, scoped styling for clean UI

### Authentication & Access

- **Reown** – for secure login and wallet connection
- **Zora API** – used for minting, metadata uploads, and trading
- **Custom Token Gating** – ensures only coin holders access full track content

## Environment Variables

The following environment variables should be defined in a `.env` file:

```
VITE_SUPABASE_ANON_KEY=...
VITE_SUPABASE_URL=...

VITE_PINATA_GATEWAY=...
VITE_PINATA_JWT=...

VITE_ZORA_API_KEY=...

VITE_PRIVY_APP_ID=...
VITE_PRIVY_SECRETE=...

VITE_SPLIT_API_KEY=...
```

**Note:** Never expose these keys publicly. This project uses environment variables via Vite's `import.meta.env`.

## How It Works

1. **Upload Flow**: Artists enter track details and collaborators (names, roles, wallet addresses, and percentage splits).
2. **Split Contract**: A 0xSplits contract is created based on inputs, returning a single address to route funds.
3. **Minting**: The artist mints the track as a Zora Coin, passing the split address as `payoutRecipient`.
4. **Access Control**: Visitors can preview the track; only coin holders can stream the full version.
5. **Storage**: Metadata (including track info and collaborator data) is uploaded to IPFS using Pinata and uri is passed during `createCoin`.

## Deployment Instructions

1. Clone the repository:

```
git clone https://github.com/Freedteck/vibelock.git
cd vibelock
```

2. Install dependencies:

```
npm install
```

3. Create a `.env` file with the required environment variables (see above).

4. Start the development server:

```
npm run dev
```

## Demo

Watch the full demo video here: [https://youtu.be/RaUO3VQaHAk](https://youtu.be/RaUO3VQaHAk)

## License

This project is open-sourced for educational and experimental purposes.
