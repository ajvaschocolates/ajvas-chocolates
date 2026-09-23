import { redirect, notFound } from "next/navigation";
import { getAdminSession } from "@/lib/supabase/auth";
import { getAdminOrderById } from "@/lib/supabase/admin-orders";
import OrderDetailClient from "@/components/admin/OrderDetailClient";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: OrderDetailPageProps) {
  const { user, isAdmin } = await getAdminSession();

  if (!user) {
    redirect("/admin/login");
  }

  if (!isAdmin) {
    redirect("/");
  }

  const { id } = await params;
  const order = await getAdminOrderById(id);

  if (!order) {
    notFound();
  }

  return <OrderDetailClient initialOrder={order} />;
}
