import { getAllAdminPageSections } from "@/lib/supabase/page-sections";
import PageSectionsClient from "@/components/admin/PageSectionsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pages CMS – Admin",
};

export default async function AdminPagesPage() {
  const sections = await getAllAdminPageSections();
  return <PageSectionsClient initialSections={sections} />;
}
