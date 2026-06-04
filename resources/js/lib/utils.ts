/**
 * Format an ISO date string (or datetime) as dd-mm-yyyy.
 * Returns '' for null/undefined/invalid input.
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const part = dateStr.slice(0, 10); // "2026-06-03"
  const [y, m, d] = part.split('-');
  if (!y || !m || !d) return dateStr;
  return `${d}-${m}-${y}`;
}
