// Clases Tailwind compartidas (equivalen a los Button/Input/Select/Badge de shadcn
// que usaba la versión React).
export const input =
  "flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-base md:text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#012928]/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export const select =
  "flex h-10 w-full items-center rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#012928]/40 focus-visible:ring-offset-2";

export const botonBase =
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#012928]/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

export const botonOutline = `${botonBase} border border-gray-200 bg-white hover:bg-gray-100`;

export const insignia =
  "inline-flex items-center rounded-full border border-transparent bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-800";

export const tarjeta = "rounded-lg border bg-white shadow-sm";
