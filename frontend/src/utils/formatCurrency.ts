import { ARAB_CURRENCIES } from './arabCurrencies';

export function formatCurrency(
  amount: number,
  currencyCode: string = 'USD',
  locale: string = 'en-US'
): string {
  const arabCurrency = ARAB_CURRENCIES[currencyCode];

  if (arabCurrency) {
    const formatted = amount.toFixed(arabCurrency.decimals);
    return `${arabCurrency.symbol} ${formatted}`;
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
}

export function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}