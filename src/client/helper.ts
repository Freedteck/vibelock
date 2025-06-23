/**
 * Format an Ethereum address by shortening the middle part.
 * Example: 0x1234567890abcdef1234567890abcdef12345678 → 0x1234...5678
 */
export function formatUserAddress(address?: string): string {
  if (!address || address.length < 10) return "";

  const start = address.slice(0, 6);
  const end = address.slice(-4);
  return `${start}...${end}`;
}

export function formatCreatedAt(createdAt: string, locale = "en-US"): string {
  const date = new Date(createdAt);
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function isTrackNew(createdAt: string): boolean {
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const diffMs = now - created;
  return diffMs >= 0 && diffMs < 24 * 60 * 60 * 1000;
}

export async function getContentsFromUri(uri: string): Promise<any> {
  try {
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error(`Failed to fetch content from ${uri}`);
    }
    return await response.json().then((data) => {
      return data;
    });
  } catch (error) {
    console.error("Error fetching content:", error);
    return "";
  }
}
