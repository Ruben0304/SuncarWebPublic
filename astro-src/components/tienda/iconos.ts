import BatteryCharging from "lucide-svelte/icons/battery-charging";
import Boxes from "lucide-svelte/icons/boxes";
import Cable from "lucide-svelte/icons/cable";
import Refrigerator from "lucide-svelte/icons/refrigerator";
import ShieldCheck from "lucide-svelte/icons/shield-check";
import Sun from "lucide-svelte/icons/sun";
import Zap from "lucide-svelte/icons/zap";
import type { ZonaId } from "@/components/tienda/zonas";

/** Icono de cada zona de la tienda: lo usan los botones de la casa y las píldoras del catálogo. */
export const ICONOS: Record<ZonaId, typeof Sun> = {
  paneles: Sun,
  inversor: Zap,
  baterias: BatteryCharging,
  protecciones: ShieldCheck,
  cableado: Cable,
  electrodomesticos: Refrigerator,
  material: Boxes,
};
