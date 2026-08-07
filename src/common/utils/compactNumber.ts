export function formatCompactNumber(
  value?: number | string | null,
  locale: string = 'en-US'
): string {
  if (value === undefined || value === null) return '0';

  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, '')) : value;

  if (isNaN(num)) return '0';

  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(num);
}