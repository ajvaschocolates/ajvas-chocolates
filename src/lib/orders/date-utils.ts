import type { Order } from "@/types/orders";

/**
 * Store-wide timezone for order date grouping and filtering.
 * AJVAS is an India-based store, so all calendar-day logic uses IST regardless
 * of the browser's or server's local timezone.
 */
export const STORE_TIMEZONE = "Asia/Kolkata";

/** IST is a fixed UTC+05:30 offset with no daylight-saving transitions. */
const STORE_UTC_OFFSET_MINUTES = 330;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Group key used for orders whose timestamp is missing or unparsable. */
export const UNKNOWN_DATE_KEY = "unknown";

export type OrderSortOption = "date_desc" | "date_asc" | "amount_desc" | "amount_asc";

export const DEFAULT_ORDER_SORT: OrderSortOption = "date_desc";

export const ORDER_SORT_OPTIONS: ReadonlyArray<{ value: OrderSortOption; label: string }> = [
  { value: "date_desc", label: "Newest First" },
  { value: "date_asc", label: "Oldest First" },
  { value: "amount_desc", label: "Amount: High to Low (per day)" },
  { value: "amount_asc", label: "Amount: Low to High (per day)" },
];

export function isOrderSortOption(value: string): value is OrderSortOption {
  return ORDER_SORT_OPTIONS.some((o) => o.value === value);
}

type OrderLike = Pick<Order, "id" | "created_at" | "total_amount">;

const dateKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: STORE_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const longDateFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat("en-IN", {
  timeZone: STORE_TIMEZONE,
  month: "short",
  day: "numeric",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("en-IN", {
  timeZone: STORE_TIMEZONE,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

/** Parses an ISO timestamp into epoch ms, returning null for missing/invalid values. */
export function parseOrderTimestamp(value: string | null | undefined): number | null {
  if (!value) return null;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : null;
}

/** Converts epoch ms to the IST calendar date key "YYYY-MM-DD". */
export function toStoreDateKey(ms: number): string {
  const parts = dateKeyFormatter.formatToParts(new Date(ms));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** Today's IST calendar date key. */
export function getStoreTodayKey(now: number = Date.now()): string {
  return toStoreDateKey(now);
}

/** IST calendar date key for an order's placement timestamp (`created_at`). */
export function getOrderDateKey(order: Pick<Order, "created_at">): string {
  const ms = parseOrderTimestamp(order.created_at);
  return ms === null ? UNKNOWN_DATE_KEY : toStoreDateKey(ms);
}

function parseDateKey(key: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  const probe = new Date(Date.UTC(y, m - 1, d));
  if (probe.getUTCFullYear() !== y || probe.getUTCMonth() !== m - 1 || probe.getUTCDate() !== d) {
    return null;
  }
  return { y, m, d };
}

export function isValidDateKey(key: string): boolean {
  return parseDateKey(key) !== null;
}

/** Shifts a date key by whole calendar days (e.g. -1 for yesterday). */
export function shiftDateKey(key: string, days: number): string {
  const parsed = parseDateKey(key);
  if (!parsed) return key;
  const shifted = new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d + days));
  return shifted.toISOString().slice(0, 10);
}

/**
 * UTC instant range [start, end) covering an IST calendar day.
 * Used for server-side `created_at` range queries.
 */
export function getStoreDayUtcRange(key: string): { start: string; end: string } | null {
  const parsed = parseDateKey(key);
  if (!parsed) return null;
  const startMs = Date.UTC(parsed.y, parsed.m - 1, parsed.d) - STORE_UTC_OFFSET_MINUTES * 60_000;
  return {
    start: new Date(startMs).toISOString(),
    end: new Date(startMs + DAY_MS).toISOString(),
  };
}

/** "2026-10-22" → "22 October 2026" */
export function formatDateKeyLong(key: string): string {
  const parsed = parseDateKey(key);
  if (!parsed) return "Date unavailable";
  return longDateFormatter.format(new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d, 12)));
}

/** "Today — 22 October 2026" / "Yesterday — 21 October 2026" / "20 October 2026" */
export function getDateGroupLabel(key: string, todayKey: string): string {
  if (key === UNKNOWN_DATE_KEY) return "Date unavailable";
  const long = formatDateKeyLong(key);
  if (key === todayKey) return `Today — ${long}`;
  if (key === shiftDateKey(todayKey, -1)) return `Yesterday — ${long}`;
  return long;
}

export function formatOrderCount(count: number): string {
  return `${count} order${count === 1 ? "" : "s"}`;
}

/** Short IST date for table cells, e.g. "22 Oct 2026". Returns "—" when invalid. */
export function formatOrderDateShort(value: string | null | undefined): string {
  const ms = parseOrderTimestamp(value);
  return ms === null ? "—" : shortDateFormatter.format(new Date(ms));
}

/** IST time for table cells, e.g. "12:05 pm". Returns "" when invalid. */
export function formatOrderTime(value: string | null | undefined): string {
  const ms = parseOrderTimestamp(value);
  return ms === null ? "" : timeFormatter.format(new Date(ms));
}

/**
 * Deterministic order comparator.
 * - Date sorts use the real `created_at` instant (never formatted strings).
 * - Missing timestamps always sort last.
 * - Identical keys fall back to the unique order `id` for stable ordering.
 */
export function compareOrders(a: OrderLike, b: OrderLike, sort: OrderSortOption): number {
  if (sort === "amount_desc" || sort === "amount_asc") {
    const amtDir = sort === "amount_asc" ? 1 : -1;
    const diff = (Number(a.total_amount) || 0) - (Number(b.total_amount) || 0);
    if (diff !== 0) return diff * amtDir;
  }

  const dir = sort === "date_asc" ? 1 : -1;
  const ta = parseOrderTimestamp(a.created_at);
  const tb = parseOrderTimestamp(b.created_at);
  if (ta === null && tb !== null) return 1;
  if (tb === null && ta !== null) return -1;
  if (ta !== null && tb !== null && ta !== tb) return (ta - tb) * dir;

  if (a.id === b.id) return 0;
  return (a.id < b.id ? -1 : 1) * dir;
}

export interface OrderDateGroup<T> {
  key: string;
  orders: T[];
}

/**
 * Sorts orders and groups them by IST calendar day.
 * Groups run oldest→newest for "date_asc", otherwise newest→oldest.
 * The "Date unavailable" group (if any) is always last.
 */
export function groupOrdersByDate<T extends OrderLike>(
  orders: readonly T[],
  sort: OrderSortOption
): OrderDateGroup<T>[] {
  const sorted = [...orders].sort((a, b) => compareOrders(a, b, sort));
  const groups = new Map<string, T[]>();
  for (const order of sorted) {
    const key = getOrderDateKey(order);
    const bucket = groups.get(key);
    if (bucket) bucket.push(order);
    else groups.set(key, [order]);
  }

  const groupDir = sort === "date_asc" ? 1 : -1;
  return Array.from(groups.keys())
    .sort((ka, kb) => {
      if (ka === kb) return 0;
      if (ka === UNKNOWN_DATE_KEY) return 1;
      if (kb === UNKNOWN_DATE_KEY) return -1;
      return (ka < kb ? -1 : 1) * groupDir;
    })
    .map((key) => ({ key, orders: groups.get(key)! }));
}
