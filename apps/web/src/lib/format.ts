const DATE_KEYS = new Set(["startedAt", "finishedAt", "createdAt", "since"]);

export function formatCellValue(key: string, value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (key === "durationMs" && typeof value === "number") return `${(value / 1000).toFixed(1)}s`;
  if (DATE_KEYS.has(key) && typeof value === "string") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString();
  }
  return String(value);
}
