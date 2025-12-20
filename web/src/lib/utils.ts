import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Memformat angka menjadi format mata uang Rupiah (Rp).
 * Contoh: 50000 menjadi "Rp 50.000"
 */
export function formatCurrency(amount: number | string | undefined | null): string {
    const numericAmount = Number(amount) || 0;
  
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numericAmount);
}