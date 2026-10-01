import { getAdminTestimonialsDataAction } from "./actions";
import {
  DEFAULT_LEFT_IMAGE,
  DEFAULT_RIGHT_IMAGE,
  DEFAULT_TESTIMONIALS,
} from "@/lib/constants/testimonials";
import TestimonialsManager from "@/components/admin/TestimonialsManager";

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  const res = await getAdminTestimonialsDataAction();
  const initialData = res.data || {
    left_image_url: DEFAULT_LEFT_IMAGE,
    right_image_url: DEFAULT_RIGHT_IMAGE,
    testimonials: DEFAULT_TESTIMONIALS,
  };

  return <TestimonialsManager initialData={initialData} />;
}
