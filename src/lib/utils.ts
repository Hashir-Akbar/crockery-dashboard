import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currencySymbol: string = 'Rs.'): string {
  if (isNaN(amount)) return `${currencySymbol} 0`;
  const isDecimal = Math.abs(amount % 1) > 0.001;
  const formatted = new Intl.NumberFormat('en-PK', {
    minimumFractionDigits: isDecimal ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${currencySymbol} ${formatted}`;
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
