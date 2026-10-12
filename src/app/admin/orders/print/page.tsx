import { Metadata } from "next";
import { getAdminOrdersByIds, getAllAdminOrders } from "@/lib/supabase/admin-orders";
import PrintPageClient from "./PrintPageClient";
import { Order } from "@/types/orders";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Print Address Slips | AJVAS Admin",
  robots: {
    index: false,
    follow: false,
  },
};

interface PrintPageProps {
  searchParams: Promise<{
    ids?: string;
    id?: string;
    auto?: string;
  }>;
}

export default async function AdminOrdersPrintPage({ searchParams }: PrintPageProps) {
  const sp = await searchParams;
  const rawIds = sp.ids || sp.id || "";
  const requestedIds = rawIds
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  let orders: Order[] = [];

  if (requestedIds.length > 0) {
    orders = await getAdminOrdersByIds(requestedIds);
  } else {
    // If no specific IDs provided, fallback to recent admin orders (up to 16)
    orders = await getAllAdminOrders(16);
  }

  const autoPrint = sp.auto === "true" || sp.auto === "1";

  return <PrintPageClient initialOrders={orders} autoPrint={autoPrint} />;
}
