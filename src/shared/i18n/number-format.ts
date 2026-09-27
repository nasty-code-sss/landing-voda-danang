const VOLUME_FRACTION_DIGITS = 1;

export function formatMoney(amount: number, language: string, currency: string): string {
  return new Intl.NumberFormat(language, { style: 'currency', currency }).format(amount);
}

export function formatVolume(liters: number, language: string): string {
  return new Intl.NumberFormat(language, { maximumFractionDigits: VOLUME_FRACTION_DIGITS }).format(liters);
}
