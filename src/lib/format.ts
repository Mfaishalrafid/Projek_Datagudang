export function formatDate(date: string | Date | null | undefined) {
  if (!date) return "-";
  const value = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(value.getTime())) return "-";

  return value.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

export function formatDateInput(date: string | Date | null | undefined) {
  if (!date) return "";
  const value = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(value.getTime())) return "";
  return value.toISOString().slice(0, 10);
}

export function formatCurrency(value: number | string | null | undefined) {
  const number = Number(value || 0);
  if (!number) return "-";
  return `Rp ${number.toLocaleString("id-ID")}`;
}

export function pct(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

export function groupBy<T>(items: T[], key: (item: T) => string) {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const groupKey = key(item) || "Unknown";
    acc[groupKey] = acc[groupKey] || [];
    acc[groupKey].push(item);
    return acc;
  }, {});
}
