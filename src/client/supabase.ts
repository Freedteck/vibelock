import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Artist {
  full_name: string;
  twitter?: string;
  instagram?: string;
  profile_image?: string;
  banner_image?: string;
  bio?: string;
  wallet_address: string;
}

export interface Comment {
  coin_address: string;
  commenter_wallet: string;
  message: string;
}

export interface Track {
  title: string;
  deployed_address: string;
  wallet_address: string;
}

// Artist functions
export const getArtist = async (wallet: string) => {
  const { data, error } = await supabase
    .from("artists")
    .select()
    .eq("wallet_address", wallet)
    .single();
  return { data, error };
};

export const createArtist = async (artist: Artist) => {
  const { data, error } = await supabase
    .from("artists")
    .insert([artist])
    .select()
    .single();

  return { data, error };
};

export const createTrack = async (track: Track) => {
  const { data, error } = await supabase
    .from("tracks")
    .insert([track])
    .select()
    .single();

  return { data, error };
};

export const getTracks = async () => {
  const { data, error } = await supabase
    .from("tracks")
    .select()
    .order("created_at", { ascending: false });

  return { data, error };
};

// export const updateArtist = async (
//   wallet: string,
//   updates: Partial<Artist>
// ) => {
//   const { data, error } = await supabase
//     .from("artists")
//     .update(updates)
//     .eq("wallet", wallet)
//     .select()
//     .single();

//   return { data, error };
// };

// Comment functions
export const getComments = async (coinAddress: string) => {
  const { data, error } = await supabase
    .from("comments")
    .select()
    .eq("coin_address", coinAddress)
    .order("created_at", { ascending: false });

  return { data, error };
};

export const createComment = async (comment: Comment) => {
  const { data, error } = await supabase
    .from("comments")
    .insert([comment])
    .select()
    .single();

  return { data, error };
};

// Storage functions
export const uploadFile = async (bucket: string, path: string, file: File) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file);

  return { data, error };
};

export const getPublicUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  return data.publicUrl;
};
