import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/supabase/auth";
import {
  getAllAdminHeroBanners,
  getAllAdminHomepageSections,
} from "@/lib/supabase/cms";
import HomepageCmsClient from "@/components/admin/HomepageCmsClient";

export default async function AdminHomepageCmsPage() {
  const { user, isAdmin } = await getAdminSession();

  if (!user) {
    redirect("/admin/login");
  }

  if (!isAdmin) {
    redirect("/");
  }

  const [banners, sections] = await Promise.all([
    getAllAdminHeroBanners(),
    getAllAdminHomepageSections(),
  ]);

  return (
    <HomepageCmsClient
      initialBanners={banners}
      initialSections={sections}
    />
  );
}
