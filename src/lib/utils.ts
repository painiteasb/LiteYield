import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUnits(value: bigint, decimals: number = 18): string {
  const s = value.toString();
  if (s === '0') return '0';
  
  const padded = s.padStart(decimals + 1, '0');
  const integerPart = padded.slice(0, padded.length - decimals);
  const fractionalPart = padded.slice(padded.length - decimals);
  
  // Trim trailing zeros
  const trimmedFraction = fractionalPart.replace(/0+$/, '');
  return trimmedFraction ? `${integerPart}.${trimmedFraction}` : integerPart;
}

export function parseUnits(value: string, decimals: number = 18): bigint {
  if (!value || value === '.') return 0n;
  const [intl, frac = ''] = value.split('.');
  const paddedFrac = frac.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(intl + paddedFrac);
}

export function shortenAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
