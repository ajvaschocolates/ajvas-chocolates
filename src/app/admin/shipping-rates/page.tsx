import {
  getAllAdminShippingRates,
  getAllAdminPincodes,
  getAllAdminCouriers,
} from "@/lib/supabase/admin-logistics";
import ShippingRateListClient from "@/components/admin/ShippingRateListClient";

export const dynamic = "force-dynamic";

export default async function AdminShippingRatesPage() {
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
