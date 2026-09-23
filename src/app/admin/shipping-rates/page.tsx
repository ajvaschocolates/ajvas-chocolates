import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/supabase/auth";
import {
  getAllAdminShippingRates,
  getAllAdminPincodes,
  getAllAdminCouriers,
} from "@/lib/supabase/admin-logistics";
import ShippingRateListClient from "@/components/admin/ShippingRateListClient";

export default async function AdminShippingRatesPage() {
  const { user, isAdmin } = await getAdminSession();

  if (!user) {
    redirect("/admin/login");
  }

  if (!isAdmin) {
    redirect("/");
  }

  const [rates, pincodes, couriers] = await Promise.all([
    getAllAdminShippingRates(),
    getAllAdminPincodes(),
    getAllAdminCouriers(),
  ]);

  return (
    <ShippingRateListClient
      initialRates={rates}
      pincodes={pincodes}
      couriers={couriers}
    />
  );
}
