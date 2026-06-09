export function formatDayName(value: string | null | undefined): string {
  if (!value) return "---";
  // If it's a date string like "2026-06-01"
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleDateString("en-US", { weekday: "long" });
  }
  return value;
}
