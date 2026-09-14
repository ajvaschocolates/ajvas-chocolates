import { Package, Scale } from "lucide-react";

interface ProductPackageSpecsProps {
  weightGrams: number;
  lengthCm?: number | null;
  widthCm?: number | null;
  heightCm?: number | null;
}

export function ProductPackageSpecs({
  weightGrams,
  lengthCm,
  widthCm,
  heightCm,
}: ProductPackageSpecsProps) {
  const hasDimensions = lengthCm && widthCm && heightCm;

  const formattedWeight =
    weightGrams >= 1000
      ? `${(weightGrams / 1000).toFixed(1)} kg`
      : `${weightGrams} g`;

  return (
    <div className="bg-brand-surface/60 rounded-xl border border-brand-sand/70 p-4 flex flex-col gap-3">
      <h3 className="font-sans text-xs uppercase tracking-wider font-bold text-brand-espresso">
        Package Specifications
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
        <div className="flex items-center gap-2.5 text-brand-espresso">
          <div className="w-8 h-8 rounded-lg bg-brand-cream border border-brand-sand/60 flex items-center justify-center text-brand-muted shrink-0">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <span className="text-brand-muted block text-[11px]">Package weight</span>
            <span className="font-medium text-brand-espresso">{formattedWeight}</span>
          </div>
        </div>

        {hasDimensions && (
          <div className="flex items-center gap-2.5 text-brand-espresso">
            <div className="w-8 h-8 rounded-lg bg-brand-cream border border-brand-sand/60 flex items-center justify-center text-brand-muted shrink-0">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <span className="text-brand-muted block text-[11px]">Package size</span>
              <span className="font-medium text-brand-espresso">
                {lengthCm} × {widthCm} × {heightCm} cm
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
