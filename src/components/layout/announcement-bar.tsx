export function AnnouncementBar() {
  return (
    <div className="w-full bg-brand-pink text-white px-4 py-2 border-b border-brand-pink/20">
      <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px] sm:text-xs font-sans font-semibold uppercase tracking-wider">
        <span className="truncate">Thoughtful Gift Hampers &amp; Confections • Pan-India Courier Delivery</span>
        <span className="hidden md:inline shrink-0 opacity-90">Free shipping on orders above ₹2,500</span>
      </div>
    </div>
  );
}
