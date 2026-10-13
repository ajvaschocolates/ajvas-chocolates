import {
  getAllAdminGiftPurposes,
  getAdminGiftPurposeSettings,
} from "@/lib/supabase/gift-purposes";
import GiftPurposeManagerClient from "@/components/admin/GiftPurposeManagerClient";

export const dynamic = "force-dynamic";

export default async function AdminGiftPurposesPage() {
  const [purposes, settings] = await Promise.all([
    getAllAdminGiftPurposes(),
    getAdminGiftPurposeSettings(),
  ]);

  return (
    <GiftPurposeManagerClient
      initialPurposes={purposes}
      initialSettings={settings}
    />
  );
}
