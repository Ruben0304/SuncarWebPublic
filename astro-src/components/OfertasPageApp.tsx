"use client";

import AppShell from "./AppShell";
import OfertasContent from "./ofertas-content";

export default function OfertasPageApp(props: Parameters<typeof OfertasContent>[0]) {
  return (
    <AppShell>
      <OfertasContent {...props} />
    </AppShell>
  );
}
