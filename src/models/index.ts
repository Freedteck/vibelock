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
    collaborators: [
      {
        name: string;
        wallet: string;
        role: string;
        percentage: number;
      }
    ];
    artist_wallet: string;
    split_contract: string;
  };
}

export interface Artist {
  wallet: string;
  name: string;
  bio: string;
  bannerImage: string;
  profileImage: string;
  twitter: string;
  instagram: string;
}
