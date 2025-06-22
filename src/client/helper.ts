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
