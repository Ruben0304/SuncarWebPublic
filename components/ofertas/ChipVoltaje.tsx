import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * El voltaje del kit (110 o 220 V). Los kits publicados antes de que existiera
 * el campo no lo traen: entonces no se pinta nada.
 */
export function ChipVoltaje({
  voltaje,
  className,
}: {
  voltaje?: number | null;
  className?: string;
}) {
  if (!voltaje) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-[#012928]/15 bg-white px-2.5 py-0.5 text-xs font-semibold tracking-[-0.01em] text-[#012928]",
        className,
      )}
      title={`Kit para instalaciones de ${voltaje} V`}
    >
      <Zap className="h-3.5 w-3.5 fill-[#F2C300] text-[#F2C300]" aria-hidden="true" />
      {voltaje} V
    </span>
  );
}
