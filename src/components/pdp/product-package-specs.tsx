import { Package } from "lucide-react";

interface ProductPackageSpecsProps {
  weightGrams?: number | null;
  lengthCm?: number | null;
  widthCm?: number | null;
  heightCm?: number | null;
}

export function ProductPackageSpecs({
  lengthCm,
  widthCm,
  heightCm,
}: ProductPackageSpecsProps) {
  const hasDimensions = Boolean(lengthCm && widthCm && heightCm);

  if (!hasDimensions) {
    return null;
  }

  return (
    <div className="bg-[#1b0e0a] rounded-sm border border-[#3d1c12] p-3 flex flex-col gap-2.5">
      <h3 className="font-pally text-xs tracking-wider font-bold text-[#c99d52]">
        Package Specifications
      </h3>
      <div className="grid grid-cols-1 gap-2.5 text-xs font-sans">
        <div className="flex items-center gap-2 text-[#faf4f0]">
          <div className="w-7 h-7 rounded-sm bg-[#140b07] border border-[#3d1c12] flex items-center justify-center text-[#c99d52] shrink-0">
            <Package className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[#a39085] block text-[10px]">Package size</span>
            <span className="font-medium text-xs text-[#faf4f0]">
              {lengthCm} × {widthCm} × {heightCm} cm
            </span>
          </div>
        </div>
        </div>
    </div>
  );
}
