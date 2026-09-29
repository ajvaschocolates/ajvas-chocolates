import { TestimonialItem } from "@/types/cms";

export const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    id: "rev-1",
    author: "Elena Rostova",
    location: "Kochi",
    quote:
      "Absolutely exquisite chocolates. The packaging was beautiful and perfect for gifting. Every single bite is pure luxury!",
    stars: 5,
    avatar_url:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop",
    status: "active",
  },
  {
    id: "rev-2",
    author: "Rohit R.",
    location: "Bengaluru",
    quote:
      "Rich taste and extraordinary presentation. The gold truffles and velvety chocolate hampers exceeded every expectation!",
    stars: 5,
    avatar_url:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
    status: "active",
  },
  {
    id: "rev-3",
    author: "Fathima R.",
    location: "Calicut",
    quote:
      "The best artisanal confections in town. Delivered on time and loved by the whole family. Highly recommended!",
    stars: 5,
    avatar_url:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&auto=format&fit=crop",
    status: "active",
  },
];

export const DEFAULT_LEFT_IMAGE =
  "https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=800&auto=format&fit=crop";

export const DEFAULT_RIGHT_IMAGE =
  "https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=800&auto=format&fit=crop";
