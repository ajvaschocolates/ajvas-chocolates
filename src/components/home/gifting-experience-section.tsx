import { Gift, Clock, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/container";

export function GiftingExperienceSection() {
  const experiences = [
    {
      icon: Gift,
      iconColor: "text-brand-burgundy",
      title: "Complimentary Gift Cards",
      description:
        "Add your personalized message during checkout. Every greeting is included on our heavy textured keepsake card.",
    },
    {
      icon: Clock,
      iconColor: "text-brand-gold",
      title: "Timely Delivery Tracking",
      description:
        "Transparent courier tracking updates for all domestic shipments, securely packaged for safe transit.",
    },
    {
      icon: ShieldCheck,
      iconColor: "text-accent-cyan",
      title: "Frictionless Guest Checkout",
      description:
        "No forced account creation or tedious signups. Complete your gifting orders in clear, straightforward steps.",
    },
  ];

  return (
    <section className="w-full bg-brand-cream py-16 lg:py-24 border-b border-brand-sand/60">
      <Container>
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="font-sans text-xs uppercase tracking-widest text-brand-gold font-bold">
            Clear &amp; Dependable
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-espresso mt-1">
            The Gifting Experience
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {experiences.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.title}
                className="bg-brand-surface p-8 rounded-2xl border border-brand-border/60 shadow-subtle flex flex-col items-start"
              >
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-6 shadow-subtle border border-brand-border/40">
                  <IconComponent className={`w-6 h-6 ${item.iconColor}`} />
                </div>
                <h3 className="font-serif text-xl font-bold text-brand-espresso mb-2">
                  {item.title}
                </h3>
                <p className="font-sans text-sm text-brand-muted leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
