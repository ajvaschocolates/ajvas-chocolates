import {
  getAllAdminHeroBanners,
  getAllAdminHomepageSections,
} from "@/lib/supabase/cms";
import HomepageCmsClient from "@/components/admin/HomepageCmsClient";

export const dynamic = "force-dynamic";

export default async function AdminHomepageCmsPage() {
  const [banners, sections] = await Promise.all([
    getAllAdminHeroBanners(),
    getAllAdminHomepageSections(),
  ]);

  return (
    <main className="p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6 sm:space-y-8 flex-1">
      <HomepageCmsClient
        initialBanners={banners}
        initialSections={sections}
      />
    </main>
  );
}
