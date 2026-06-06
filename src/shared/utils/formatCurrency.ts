import { getCurrencyByCode } from '../constants/currencies';

export function formatCurrency(
  amount: number,
  currencyCode: string = 'IDR',
  options: { compact?: boolean; showSign?: boolean } = {}
): string {
  const currency = getCurrencyByCode(currencyCode);
  const { compact = false, showSign = false } = options;

  const absAmount = Math.abs(amount);
  let formattedAmount: string;

  if (compact && absAmount >= 1_000_000) {
    formattedAmount = `${(absAmount / 1_000_000).toFixed(1)}M`;
  } else if (compact && absAmount >= 1_000) {
    formattedAmount = `${(absAmount / 1_000).toFixed(1)}K`;
  } else {
    try {
      formattedAmount = new Intl.NumberFormat(currency.locale, {
        minimumFractionDigits: currencyCode === 'IDR' || currencyCode === 'JPY' ? 0 : 2,
        maximumFractionDigits: currencyCode === 'IDR' || currencyCode === 'JPY' ? 0 : 2,
      }).format(absAmount);
    } catch {
      formattedAmount = absAmount.toFixed(2);
    }
  }

  const sign = showSign ? (amount >= 0 ? '+' : '-') : amount < 0 ? '-' : '';
  return `${sign}${currency.symbol}${formattedAmount}`;
}

export function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}

export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}
