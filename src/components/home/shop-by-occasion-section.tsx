import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";

export function ShopByOccasionSection() {
  const occasions = [
    {
      title: "Festive Celebrations",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDVzufnEHtGwfs8yRMGCcnygXcWB3jilaMPOCsLrbebtbLU3QgGHKszisKxEIaBYK9LIabqMV_xhMEnW7luZxnqGaQOgdKQvlunt5imrx0sx1TffKs2yKKSf9SEnKqxO7XZyRztpwKvu4z0EgEURsMMdx9wbruBC1-WWW_NgQwGR6xw3_iJ74VtCL_OPFH8AQHQN3dqqp0u_lfF9wgo5xkiqXIApk4e5uXBbsLgBxLCYa1ofuwpcyYr",
    },
    {
      title: "Weddings & Anniversaries",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD2cEL6SHwP-9ZrglJ3NvJ_R39zmuR0Ra9BsJ_R7k9LREZRH1SJm6th2-fu776gAUyaCWXsSLF95psqFU4Xkj3g8oH7kKBvGg46qcL-cGUHPgVHhBx3wk7ut9MmbtJNU-Q0SJCrRkbLdIsPWVFEqWZXAZKZiHd7cAR1_lz4OejrQNoP0O1WzSUFckXjy49kSRnuL8XOo5K9Q_s1VYKDg6T5qTOgP7ZMLbiaEE2A-S59aEFIzzJ_7P8X",
    },
    {
      title: "Birthdays",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuChToowsg6bjcQZ9KcVr_7KOPobqVlANMpWcZcb0aGhkhlJLqcP0AfUujvxyJy9meO6pvayWZkkIsltUqr2wAak1_QDNac6d4xFmqumeIMVHDiH0BxKPaIZdxm01g0tSDlM8Kgi85dzPT_oviwbi-arprFPSqZDT_rxhDDr_Eg-bXLl30zKSEUBxib7nijtEHrczYqp5X1y5yKvKPHXafTOQqetOQdnX5XmqbTiI2ggdIJVwJGng9cv",
    },
    {
      title: "Corporate Gifting",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAi403r0Vk3s5XNGGhXIoufr-T0MGcPMLCoVPbpmTjsLHg8LGGHP2r3WaE-4zaZWe_pR-P25zl-y0zdDnjzzyDW2tYaVoBqpPJQY2QSol8SRXQmGx-IvZiYXu74piao8UXnzZCJnim63Rn8gbX7BTEKTOVKOWH5ty1FhnYALgP-ozWQ4iKY68DW8r3zf9lswCl6HCGk4zAUCkh7DHzQGRvFLreIVRnB54h8hwvE6SY62Q3V_U4H-sBR",
    },
  ];

  return (
    <section className="w-full bg-[#fdf8f5] py-14 lg:py-20 border-b border-brand-sand/60" id="occasions">
      <Container>
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-brand-navy">
            Shop by <span className="text-brand-pink">Occasion</span>
          </h2>
          <p className="font-sans text-sm text-brand-muted mt-1.5 font-medium">
            Because every moment deserves something sweeter
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {occasions.map((occasion) => (
            <a
              key={occasion.title}
              href="/shop"
              className="group relative h-72 rounded-2xl overflow-hidden shadow-subtle hover:shadow-elevated transition-all duration-300 flex flex-col justify-end p-5 border border-brand-sand/60"
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url('${occasion.imageUrl}')` }}
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/90 via-brand-navy/30 to-transparent" />

              {/* Content */}
              <div className="relative z-10 flex items-end justify-between gap-3 w-full">
                <h3 className="font-serif text-xl font-bold text-white leading-snug">
                  {occasion.title}
                </h3>
                <span className="w-8 h-8 rounded-full bg-white text-brand-navy group-hover:bg-brand-pink group-hover:text-white flex items-center justify-center shrink-0 shadow-md transition-all duration-300">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}
