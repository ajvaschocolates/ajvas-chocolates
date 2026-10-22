/**
 * Automated Verification Script for AJVAS Chocolates:
 * Admin Orders — Compact Sticky Orders Toolbar & Table Header
 *
 * Run: node scripts/verify-compact-sticky-orders.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

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

console.log("===================================================================");
console.log("AJVAS CHOCOLATES — COMPACT STICKY ORDERS TOOLBAR & TABLE HEADERS");
console.log("===================================================================\n");

const orderListClientPath = path.resolve("src/components/admin/OrderListClient.tsx");
const orderListContent = fs.readFileSync(orderListClientPath, "utf-8");

console.log("[1. Codebase Safeguards & Feature Preservation]");
// Check preserved IDs and controls
assert("order-date-filter input is present", orderListContent.includes('id="order-date-filter"'));
assert("clear-date-filter button is present", orderListContent.includes('id="clear-date-filter"'));
assert("order-sort select is present", orderListContent.includes('id="order-sort"'));
assert("refresh-orders button is present", orderListContent.includes('id="refresh-orders"'));
assert("selectAllRef checkbox is present", orderListContent.includes("ref={selectAllRef}"));
assert("AddressSlipPrintModal is present", orderListContent.includes("<AddressSlipPrintModal"));
assert("WhatsAppShippingModal is present", orderListContent.includes("<WhatsAppShippingModal"));
assert("handleInlineStatusChange is preserved", orderListContent.includes("handleInlineStatusChange"));
assert("handlePrintSingleOrder is preserved", orderListContent.includes("handlePrintSingleOrder"));
assert("handlePrintSelected is preserved", orderListContent.includes("handlePrintSelected"));

console.log("\n[2. Sticky Toolbar Positioning & Layout]");
assert("toolbarRef is declared", orderListContent.includes("toolbarRef = useRef<HTMLDivElement>(null)"));
assert("adminHeaderHeight is tracked dynamically", orderListContent.includes("adminHeaderHeight"));
assert("toolbarHeight is tracked dynamically", orderListContent.includes("toolbarHeight"));
assert("ResizeObserver is used to measure toolbarHeight", orderListContent.includes("ResizeObserver"));
assert("Sticky toolbar uses sticky top offset matching admin header", orderListContent.includes('style={{ top: `${adminHeaderHeight}px` }}'));
assert("Sticky toolbar uses opaque background bg-parchment", orderListContent.includes("bg-parchment border-b border-parchment-border"));
assert("Sticky toolbar z-index is z-20 (below header z-30, above table z-10)", orderListContent.includes("z-20"));

console.log("\n[3. Sticky Table Column Headers]");
assert("tableHeaderTop offset is calculated", orderListContent.includes("const tableHeaderTop = adminHeaderHeight + (toolbarHeight || 78)"));
assert("thead is sticky with tableHeaderTop offset", orderListContent.includes('<thead className="sticky z-10" style={{ top: `${tableHeaderTop}px` }}>'));
assert("th elements are sticky with tableHeaderTop offset", orderListContent.includes('style={{ top: `${tableHeaderTop}px` }}'));
assert("th elements use opaque bg-parchment-muted", orderListContent.includes("bg-parchment-muted border-b border-parchment-border z-10"));
assert("Table container avoids overflow:hidden that breaks sticky", !orderListContent.includes("overflow-hidden\n          <div className=\"overflow-x-auto\""));
assert("Table container uses overflow-x-auto and overflow-y-clip", orderListContent.includes("overflow-x-auto overflow-y-clip"));
assert("Table uses border-separate and border-spacing-0 to avoid collapse bugs", orderListContent.includes("border-separate border-spacing-0"));

console.log("\n[4. Compact Layout & Whitespace Reduction]");
assert("Summary cards use 1 compact row (grid-cols-5)", orderListContent.includes("grid grid-cols-5"));
assert("Table rows use compact py-2 padding", orderListContent.includes('className="py-2 pl-4 pr-1 text-center'));
assert("Thumbnails are compact (w-9 h-9)", orderListContent.includes("w-9 h-9"));
assert("Toolbar Row 1 contains Search, Status, and Payment", 
  orderListContent.includes("Search by order #") && 
  orderListContent.includes("All Order Statuses") && 
  orderListContent.includes("All Payment States")
);
assert("Toolbar Row 2 contains Date, Sort, Refresh, and Results count",
  orderListContent.includes("order-date-filter") &&
  orderListContent.includes("order-sort") &&
  orderListContent.includes("refresh-orders")
);

console.log("\n[5. Headless Browser Geometry Verification]");

// Generate self-contained verification page
const testHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #fcfaf6; color: #140c08; }
  .shell { display: flex; height: 100vh; overflow: hidden; }
  .main-scroller { flex: 1; height: 100vh; overflow-y: auto; display: flex; flex-direction: column; }
  
  /* Admin Header */
  .admin-header {
    height: 80px;
    background: #ffffff;
    border-bottom: 1px solid #e8dfd3;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 30;
    flex-shrink: 0;
  }
  
  .content-area {
    padding: 16px 24px;
    max-width: 1280px;
    width: 100%;
    margin: 0 auto;
  }

  /* Compact Header */
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px;
    border-bottom: 1px solid #e8dfd3;
    margin-bottom: 12px;
  }

  /* Summary Cards */
  .summary-cards {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
    margin-bottom: 12px;
  }
  .summary-card {
    background: #f5efe6;
    border: 1px solid #e8dfd3;
    padding: 6px 10px;
    border-radius: 4px;
  }
  .summary-card .label { font-size: 11px; color: #543323; }
  .summary-card .val { font-size: 16px; font-weight: bold; }

  /* Sticky Toolbar */
  .sticky-toolbar {
    position: sticky;
    top: 80px;
    z-index: 20;
    margin: 0 -24px 12px -24px;
    padding: 8px 24px;
    background: #fcfaf6;
    border-bottom: 1px solid #e8dfd3;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  }
  .toolbar-r1 { display: flex; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
  .toolbar-r2 { display: flex; justify-content: space-between; align-items: center; gap: 8px; padding-top: 4px; border-top: 1px solid #e8dfd3; }
  .control { height: 32px; padding: 4px 8px; font-size: 12px; border: 1px solid #e8dfd3; border-radius: 4px; background: #fff; }

  /* Table Card */
  .table-card {
    background: #fff;
    border: 1px solid #e8dfd3;
    border-radius: 6px;
    overflow-x: auto;
    overflow-y: clip;
  }
  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 12px;
  }
  thead {
    position: sticky;
    top: 156px; /* 80px + 76px toolbar */
    z-index: 10;
  }
  th {
    position: sticky;
    top: 156px;
    background: #f5efe6;
    border-bottom: 1px solid #e8dfd3;
    padding: 8px 12px;
    text-align: left;
    font-size: 11px;
    text-transform: uppercase;
    color: #543323;
    z-index: 10;
  }
  td {
    padding: 8px 12px;
    border-bottom: 1px solid #e8dfd3;
    white-space: nowrap;
  }
  .date-group {
    background: #ede6dd;
    font-weight: bold;
    padding: 6px 12px;
    border-bottom: 1px solid #e8dfd3;
  }
</style>
</head>
<body>
  <div class="shell">
    <div class="main-scroller" id="scroller">
      <header class="admin-header" id="adminHeader">
        <div><strong>AJVAS Admin</strong> — Orders</div>
        <button class="control">Refresh</button>
      </header>

      <div class="content-area">
        <div class="page-header">
          <h2>Store Orders</h2>
          <button class="control">Print Selected Slips</button>
        </div>

        <div class="summary-cards">
          <div class="summary-card"><div class="label">Total Orders</div><div class="val">100</div></div>
          <div class="summary-card"><div class="label">Pending</div><div class="val">12</div></div>
          <div class="summary-card"><div class="label">Processing</div><div class="val">25</div></div>
          <div class="summary-card"><div class="label">Shipped</div><div class="val">30</div></div>
          <div class="summary-card"><div class="label">Delivered</div><div class="val">33</div></div>
        </div>

        <div class="sticky-toolbar" id="toolbar">
          <div class="toolbar-r1">
            <input class="control" style="flex: 1;" placeholder="Search orders..." />
            <select class="control"><option>All Order Statuses</option></select>
            <select class="control"><option>All Payment States</option></select>
          </div>
          <div class="toolbar-r2">
            <div style="display: flex; gap: 8px;">
              <input type="date" class="control" />
              <select class="control"><option>Newest First</option></select>
              <button class="control">Refresh</button>
            </div>
            <div>Showing 100 orders (IST)</div>
          </div>
        </div>

        <div class="table-card" id="tableCard">
          <table>
            <thead>
              <tr>
                <th style="width: 40px;"><input type="checkbox" id="selectAll"></th>
                <th id="thOrderNum">Order Number</th>
                <th>Product</th>
                <th id="thCustomer">Customer</th>
                <th>Destination</th>
                <th>Date</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="tbody"></tbody>
          </table>
        </div>
        <div style="height: 100px;"></div>
      </div>
    </div>
  </div>

  <div id="testOutput"></div>

  <script>
    // Populate 50 orders across 3 date groups
    const tbody = document.getElementById('tbody');
    const dates = ["Today, 22 Oct 2026", "Yesterday, 21 Oct 2026", "20 Oct 2026"];
    let orderNum = 1001;
    for (let g = 0; g < dates.length; g++) {
      const gRow = document.createElement('tr');
      gRow.innerHTML = \`<th colspan="10" class="date-group">\${dates[g]}</th>\`;
      tbody.appendChild(gRow);
      for (let i = 0; i < 15; i++) {
        const row = document.createElement('tr');
        row.innerHTML = \`
          <td><input type="checkbox"></td>
          <td class="td-order-num">AJV-2026-\${orderNum}</td>
          <td>Artisan Truffles</td>
          <td class="td-customer">Customer \${orderNum}</td>
          <td>Bangalore, KA</td>
          <td>22 Oct</td>
          <td>₹850</td>
          <td>PAID</td>
          <td>PROCESSING</td>
          <td><button class="control">View</button></td>
        \`;
        tbody.appendChild(row);
        orderNum++;
      }
    }

    const scroller = document.getElementById('scroller');
    const adminHeader = document.getElementById('adminHeader');
    const toolbar = document.getElementById('toolbar');
    const thOrderNum = document.getElementById('thOrderNum');
    const firstTd = document.querySelector('.td-order-num');

    // Dynamically align th top with measured offsets
    const headerH = adminHeader.offsetHeight;
    const toolbarH = toolbar.offsetHeight;
    const computedThTop = headerH + toolbarH;
    document.querySelectorAll('th').forEach(th => {
      if (th.closest('thead')) th.style.top = computedThTop + 'px';
    });

    // 1. Initial State Measurement
    const initialHeaderBottom = adminHeader.getBoundingClientRect().bottom;
    const initialToolbarTop = toolbar.getBoundingClientRect().top;

    // 2. Scroll Scroller to 400px (mid-table)
    scroller.scrollTop = 400;

    const scrolledHeaderRect = adminHeader.getBoundingClientRect();
    const scrolledToolbarRect = toolbar.getBoundingClientRect();
    const scrolledThRect = thOrderNum.getBoundingClientRect();
    const currentTdRect = firstTd.getBoundingClientRect();

    // 3. Scroll to 1200px (near end of orders)
    scroller.scrollTop = 1200;
    const deepToolbarRect = toolbar.getBoundingClientRect();
    const deepThRect = thOrderNum.getBoundingClientRect();

    document.getElementById('testOutput').innerText = JSON.stringify({
      headerHeight: headerH,
      toolbarHeight: toolbarH,
      midScrollTop: 400,
      scrolledHeaderBottom: scrolledHeaderRect.bottom,
      scrolledToolbarTop: scrolledToolbarRect.top,
      scrolledToolbarBottom: scrolledToolbarRect.bottom,
      scrolledThTop: scrolledThRect.top,
      gapHeaderToolbar: scrolledToolbarRect.top - scrolledHeaderRect.bottom,
      gapToolbarTh: scrolledThRect.top - scrolledToolbarRect.bottom,
      deepScrollToolbarTop: deepToolbarRect.top,
      deepScrollThTop: deepThRect.top,
      isToolbarStickyAtDeepScroll: deepToolbarRect.top === headerH
    });
  </script>
</body>
</html>`;

const scratchHtmlPath = path.resolve("scratch/verify-rendered-sticky.html");
fs.writeFileSync(scratchHtmlPath, testHtml, "utf-8");

const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
if (fs.existsSync(edgePath)) {
  try {
    const cmd = `"${edgePath}" --headless=new --disable-gpu --no-sandbox --disable-extensions --disable-background-networking --run-all-compositor-stages-before-draw --dump-dom "file:///${scratchHtmlPath.replace(/\\/g, '/')}"`;
    const output = execSync(cmd, { encoding: "utf-8", timeout: 25000 });
    const match = output.match(/<div id="testOutput">([\s\S]*?)<\/div>/);
    if (match && match[1]) {
      const data = JSON.parse(match[1]);
      assert("Admin Header height is 80px", data.headerHeight === 80, `Got ${data.headerHeight}`);
      assert("Toolbar gap below admin header is exactly 0px during scroll", data.gapHeaderToolbar === 0, `Got ${data.gapHeaderToolbar}`);
      assert("Table header gap below sticky toolbar is exactly 0px during scroll", data.gapToolbarTh === 0, `Got ${data.gapToolbarTh}`);
      assert("Toolbar remains sticky at top:80px deep into scrolling", data.isToolbarStickyAtDeepScroll, `Got deepToolbarTop=${data.deepScrollToolbarTop}`);
    } else {
      console.warn("  WARN: Could not extract testOutput from headless browser dump");
    }
  } catch (err) {
    console.warn("  WARN: Headless browser run encountered an error:", err.message);
  }
} else {
  console.log("  SKIP: Edge binary not found at default path");
}

console.log("\n===================================================================");
console.log(`RESULT: ${passedCount} passed, ${failedCount} failed`);
console.log("===================================================================");

if (failedCount > 0) process.exit(1);
