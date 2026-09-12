import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";

export function ShopByOccasionSection() {
  const occasions = [
    {
      title: "Festive Celebrations",
      tag: "Festive",
      tagColor: "bg-brand-gold/20 text-brand-gold border-brand-gold/30",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDVzufnEHtGwfs8yRMGCcnygXcWB3jilaMPOCsLrbebtbLU3QgGHKszisKxEIaBYK9LIabqMV_xhMEnW7luZxnqGaQOgdKQvlunt5imrx0sx1TffKs2yKKSf9SEnKqxO7XZyRztpwKvu4z0EgEURsMMdx9wbruBC1-WWW_NgQwGR6xw3_iJ74VtCL_OPFH8AQHQN3dqqp0u_lfF9wgo5xkiqXIApk4e5uXBbsLgBxLCYa1ofuwpcyYr",
      cols: "lg:col-span-4",
    },
    {
      title: "Weddings & Anniversaries",
      tag: "Celebration",
      tagColor: "bg-accent-rose/20 text-accent-rose border-accent-rose/30",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD2cEL6SHwP-9ZrglJ3NvJ_R39zmuR0Ra9BsJ_R7k9LREZRH1SJm6th2-fu776gAUyaCWXsSLF95psqFU4Xkj3g8oH7kKBvGg46qcL-cGUHPgVHhBx3wk7ut9MmbtJNU-Q0SJCrRkbLdIsPWVFEqWZXAZKZiHd7cAR1_lz4OejrQNoP0O1WzSUFckXjy49kSRnuL8XOo5K9Q_s1VYKDg6T5qTOgP7ZMLbiaEE2A-S59aEFIzzJ_7P8X",
      cols: "lg:col-span-4",
    },
    {
      title: "Milestone Birthdays",
      tag: "Milestones",
      tagColor: "bg-accent-amber/20 text-accent-amber border-accent-amber/30",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuChToowsg6bjcQZ9KcVr_7KOPobqVlANMpWcZcb0aGhkhlJLqcP0AfUujvxyJy9meO6pvayWZkkIsltUqr2wAak1_QDNac6d4xFmqumeIMVHDiH0BxKPaIZdxm01g0tSDlM8Kgi85dzPT_oviwbi-arprFPSqZDT_rxhDDr_Eg-bXLl30zKSEUBxib7nijtEHrczYqp5X1y5yKvKPHXafTOQqetOQdnX5XmqbTiI2ggdIJVwJGng9cv",
      cols: "lg:col-span-4",
    },
    {
      title: "Tokens of Gratitude",
      tag: "Gratitude",
      tagColor: "bg-accent-cyan/20 text-accent-cyan border-accent-cyan/30",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDStnchmpvuQiHPSwZWLXqPNYNNtIAM8R1zfAnWkcJklCX0G2gsguGTaN4RZkf3g3R63w56OHHFoOgMu1263gSJ6i47R8tzLtbSb2XGWgWm5grX4h7K_qBkyxqfz4TupAkb-8cxhRvz6q1kKOtNAD4jwBoFVbCzlaPuY1sk0xmsi3RdJbtbQiRz7KgrlDbP53TfytiQjUOxYnsjfEYvtnyp-Dg2UWKYQ6GXoi_Q4rWgkQ3KBY8UBYrx",
      cols: "lg:col-span-6",
    },
    {
      title: "Corporate & Festive Gifts",
      tag: "Corporate",
      tagColor: "bg-brand-sand/40 text-brand-cream border-brand-sand/30",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAi403r0Vk3s5XNGGhXIoufr-T0MGcPMLCoVPbpmTjsLHg8LGGHP2r3WaE-4zaZWe_pR-P25zl-y0zdDnjzzyDW2tYaVoBqpPJQY2QSol8SRXQmGx-IvZiYXu74piao8UXnzZCJnim63Rn8gbX7BTEKTOVKOWH5ty1FhnYALgP-ozWQ4iKY68DW8r3zf9lswCl6HCGk4zAUCkh7DHzQGRvFLreIVRnB54h8hwvE6SY62Q3V_U4H-sBR",
      cols: "lg:col-span-6",
    },
  ];

  return (
    <section className="w-full bg-brand-cream py-16 lg:py-24 border-b border-brand-sand/60" id="occasions">
      <Container>
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="font-sans text-xs uppercase tracking-widest text-brand-gold font-bold">
            Celebrations &amp; Gestures
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-espresso mt-1">
            Shop by Occasion
          </h2>
          <p className="font-sans text-sm text-brand-muted mt-2">
            Curations planned for personal milestones, wedding favours, thoughtful gratitude, and festive hospitality.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-5">
          {occasions.map((occasion) => (
            <a
              key={occasion.title}
              href="#gifts"
              className={`group relative ${occasion.cols} h-72 sm:h-80 rounded-2xl overflow-hidden shadow-subtle hover:shadow-elevated transition-all duration-300 flex flex-col justify-end p-6 border border-brand-border/40`}
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url('${occasion.imageUrl}')` }}
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-espresso/90 via-brand-espresso/40 to-transparent" />

              {/* Content */}
              <div className="relative z-10">
                <span
                  className={`inline-block px-2.5 py-0.5 text-[11px] font-sans font-bold uppercase tracking-wider rounded border mb-2 ${occasion.tagColor}`}
                >
                  {occasion.tag}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-brand-cream leading-snug">
                  {occasion.title}
                </h3>
                <p className="font-sans text-xs font-semibold uppercase tracking-wider text-brand-sand mt-2 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 group-hover:text-brand-gold transition-colors">
                  <span>Explore Occasion</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </p>
              </div>
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}
