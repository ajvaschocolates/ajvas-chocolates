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
    <div className="bg-[#1b0e0a] rounded-xl border border-[#3d1c12] p-4 flex flex-col gap-3">
      <h3 className="font-sans text-xs uppercase tracking-wider font-bold text-[#c99d52]">
        Package Specifications
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
        <div className="flex items-center gap-2.5 text-[#faf4f0]">
          <div className="w-8 h-8 rounded-lg bg-[#140b07] border border-[#3d1c12] flex items-center justify-center text-[#c99d52] shrink-0">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[#a39085] block text-[11px]">Package weight</span>
            <span className="font-medium text-[#faf4f0]">{formattedWeight}</span>
          </div>
        </div>

        {hasDimensions && (
          <div className="flex items-center gap-2.5 text-[#faf4f0]">
            <div className="w-8 h-8 rounded-lg bg-[#140b07] border border-[#3d1c12] flex items-center justify-center text-[#c99d52] shrink-0">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[#a39085] block text-[11px]">Package size</span>
              <span className="font-medium text-[#faf4f0]">
                {lengthCm} × {widthCm} × {heightCm} cm
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
