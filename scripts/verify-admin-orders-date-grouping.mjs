/**
 * Automated Verification Test Suite for AJVAS Chocolates:
 * Admin Orders — Date Grouping, Sorting & Filtering (Asia/Kolkata)
 *
 * Run: node --experimental-strip-types scripts/verify-admin-orders-date-grouping.mjs
 */

import {
  STORE_TIMEZONE,
  UNKNOWN_DATE_KEY,
  DEFAULT_ORDER_SORT,
  ORDER_SORT_OPTIONS,
  isOrderSortOption,
  parseOrderTimestamp,
  toStoreDateKey,
  getStoreTodayKey,
  getOrderDateKey,
  isValidDateKey,
  shiftDateKey,
  getStoreDayUtcRange,
  formatDateKeyLong,
  getDateGroupLabel,
  formatOrderCount,
  formatOrderDateShort,
  formatOrderTime,
  compareOrders,
  groupOrdersByDate,
} from "../src/lib/orders/date-utils.ts";

let passedCount = 0;
let failedCount = 0;

function assert(description, condition, details = "") {
  if (condition) {
    passedCount++;
    console.log(`  PASS: ${description}`);
  } else {
    failedCount++;
    console.error(`  FAIL: ${description} - ${details}`);
  }
}

const ids = (list) => list.map((o) => o.id).join(",");

// Mirrors OrderListClient's filter pipeline (search + status + payment + date)
function applyFilters(orders, { search = "", status = "ALL", payment = "ALL", date = "" }) {
  return orders.filter((o) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const hit =
        o.order_number.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q);
      if (!hit) return false;
    }
    if (status !== "ALL" && o.order_status !== status) return false;
    if (payment !== "ALL" && o.payment_status !== payment) return false;
    if (date && getOrderDateKey(o) !== date) return false;
    return true;
  });
}

const mk = (id, created_at, extra = {}) => ({
  id,
  order_number: `AJV-2026-${id}`,
  customer_name: `Customer ${id}`,
  created_at,
  total_amount: 500,
  order_status: "pending",
  payment_status: "paid",
  ...extra,
});

console.log("===================================================================");
console.log("AJVAS CHOCOLATES — ADMIN ORDERS DATE GROUPING / SORT / FILTER");
console.log("===================================================================\n");

// "Now" = 2026-10-22 12:16 IST
const NOW = Date.parse("2026-10-22T06:46:22Z");

console.log("[1. Timezone & date keys]");
assert("Store timezone is Asia/Kolkata", STORE_TIMEZONE === "Asia/Kolkata");
assert("Today key in IST", getStoreTodayKey(NOW) === "2026-10-22", getStoreTodayKey(NOW));
assert(
  "23:59 IST stays on same IST day (UTC 18:29)",
  toStoreDateKey(Date.parse("2026-10-21T18:29:59Z")) === "2026-10-21"
);
assert(
  "00:00 IST rolls to next IST day (UTC 18:30 previous day)",
  toStoreDateKey(Date.parse("2026-10-21T18:30:00Z")) === "2026-10-22"
);
assert(
  "00:15 IST order (UTC prev day) assigned to IST date, not UTC date",
  getOrderDateKey({ created_at: "2026-10-21T18:45:00+00:00" }) === "2026-10-22"
);
assert("Missing timestamp → unknown key", getOrderDateKey({ created_at: null }) === UNKNOWN_DATE_KEY);
assert("Invalid timestamp → unknown key", getOrderDateKey({ created_at: "not-a-date" }) === UNKNOWN_DATE_KEY);
assert("parseOrderTimestamp invalid → null", parseOrderTimestamp("garbage") === null);
assert("Valid date key accepted", isValidDateKey("2026-10-22"));
assert("Impossible date rejected", !isValidDateKey("2026-02-30"));
assert("Malformed date rejected", !isValidDateKey("22-10-2026"));
assert("shiftDateKey across month", shiftDateKey("2026-11-01", -1) === "2026-10-31");
assert("shiftDateKey across year", shiftDateKey("2026-01-01", -1) === "2025-12-31");

console.log("\n[2. Server IST day range]");
const range = getStoreDayUtcRange("2026-10-22");
assert(
  "Range start = previous day 18:30 UTC",
  range?.start === "2026-10-21T18:30:00.000Z",
  range?.start
);
assert("Range end = 18:30 UTC same day (exclusive)", range?.end === "2026-10-22T18:30:00.000Z", range?.end);
assert(
  "Range start maps back to the same IST day",
  toStoreDateKey(Date.parse(range.start)) === "2026-10-22"
);
assert(
  "Last ms before range end is same IST day",
  toStoreDateKey(Date.parse(range.end) - 1) === "2026-10-22"
);
assert("Range end belongs to next IST day", toStoreDateKey(Date.parse(range.end)) === "2026-10-23");
assert("Invalid key → null range", getStoreDayUtcRange("bad") === null);

console.log("\n[3. Labels]");
const today = getStoreTodayKey(NOW);
assert("Long format", formatDateKeyLong("2026-10-22") === "22 October 2026", formatDateKeyLong("2026-10-22"));
assert("Today label", getDateGroupLabel("2026-10-22", today) === "Today — 22 October 2026");
assert("Yesterday label", getDateGroupLabel("2026-10-21", today) === "Yesterday — 21 October 2026");
assert("Older label", getDateGroupLabel("2026-10-20", today) === "20 October 2026");
assert("Unknown label", getDateGroupLabel(UNKNOWN_DATE_KEY, today) === "Date unavailable");
assert("Count plural", formatOrderCount(8) === "8 orders");
assert("Count singular", formatOrderCount(1) === "1 order");
assert("Short date in IST for near-midnight order",
  formatOrderDateShort("2026-10-21T18:45:00Z").includes("22"),
  formatOrderDateShort("2026-10-21T18:45:00Z"));
assert("Short date invalid → dash", formatOrderDateShort(null) === "—");
assert("Time invalid → empty", formatOrderTime("nope") === "");

console.log("\n[4. Sorting & grouping]");
const orders = [
  mk("a", "2026-10-22T05:00:00Z"), // 22 Oct 10:30 IST
  mk("b", "2026-10-21T18:45:00Z"), // 22 Oct 00:15 IST
  mk("c", "2026-10-21T10:00:00Z"), // 21 Oct
  mk("d", "2026-10-20T10:00:00Z"), // 20 Oct
  mk("e", "2025-03-01T10:00:00Z"), // historical
  mk("f", null),                   // missing timestamp
  mk("g", "2026-10-22T05:00:00Z"), // identical to "a"
];

assert("Default sort is Newest First", DEFAULT_ORDER_SORT === "date_desc");
assert("Sort option guard", isOrderSortOption("date_asc") && !isOrderSortOption("order_number"));
assert(
  "No misleading Order Number sort option offered",
  !ORDER_SORT_OPTIONS.some((o) => o.value.includes("number"))
);

const desc = groupOrdersByDate(orders, "date_desc");
assert(
  "Desc: groups newest → oldest, unknown last",
  desc.map((g) => g.key).join("|") === "2026-10-22|2026-10-21|2026-10-20|2025-03-01|unknown",
  desc.map((g) => g.key).join("|")
);
assert("Desc: today group has near-midnight IST order", ids(desc[0].orders).includes("b"));
assert("Desc: newest first within group, id tiebreak deterministic", ids(desc[0].orders) === "g,a,b", ids(desc[0].orders));
assert("Historical order included", desc.some((g) => g.key === "2025-03-01"));
assert("Each date header appears once", new Set(desc.map((g) => g.key)).size === desc.length);
assert("Group counts sum to total", desc.reduce((n, g) => n + g.orders.length, 0) === orders.length);

const asc = groupOrdersByDate(orders, "date_asc");
assert(
  "Asc: groups oldest → newest, unknown last",
  asc.map((g) => g.key).join("|") === "2025-03-01|2026-10-20|2026-10-21|2026-10-22|unknown",
  asc.map((g) => g.key).join("|")
);
const ascToday = asc.find((g) => g.key === "2026-10-22");
assert("Asc: oldest first within group, id tiebreak deterministic", ids(ascToday.orders) === "b,a,g", ids(ascToday.orders));

const shuffled = [...orders].reverse();
assert(
  "Deterministic regardless of input order",
  JSON.stringify(groupOrdersByDate(shuffled, "date_desc")) === JSON.stringify(desc)
);
assert("compareOrders identical ts uses id", compareOrders(orders[0], orders[6], "date_desc") > 0);

const amt = groupOrdersByDate(
  [mk("x", "2026-10-22T05:00:00Z", { total_amount: 100 }), mk("y", "2026-10-22T04:00:00Z", { total_amount: 900 })],
  "amount_desc"
);
assert("Amount High→Low within day", ids(amt[0].orders) === "y,x", ids(amt[0].orders));

assert("Empty input → no groups", groupOrdersByDate([], "date_desc").length === 0);

console.log("\n[5. Combined filters]");
const data = [
  mk("p1", "2026-10-22T05:00:00Z", { order_status: "pending", payment_status: "paid", customer_name: "Asha" }),
  mk("p2", "2026-10-22T06:00:00Z", { order_status: "shipped", payment_status: "paid", customer_name: "Ravi" }),
  mk("p3", "2026-10-22T07:00:00Z", { order_status: "pending", payment_status: "failed", customer_name: "Asha K" }),
  mk("p4", "2026-10-21T07:00:00Z", { order_status: "pending", payment_status: "paid", customer_name: "Asha" }),
];
const dateOnly = applyFilters(data, { date: "2026-10-22" });
assert("Date filter only returns that IST day", ids(dateOnly) === "p1,p2,p3", ids(dateOnly));
const combo = applyFilters(data, { date: "2026-10-22", search: "asha", status: "pending", payment: "paid" });
assert("Date + search + status + payment combine", ids(combo) === "p1", ids(combo));
const cleared = applyFilters(data, { date: "", search: "asha", status: "pending", payment: "paid" });
assert("Clearing date keeps other filters", ids(cleared) === "p1,p4", ids(cleared));
const dateGroups = groupOrdersByDate(applyFilters(data, { date: "2026-10-21", status: "shipped" }), "date_desc");
assert("No empty date groups rendered", dateGroups.length === 0);

console.log("\n===================================================================");
console.log(`RESULT: ${passedCount} passed, ${failedCount} failed`);
console.log("===================================================================");
if (failedCount > 0) process.exit(1);
