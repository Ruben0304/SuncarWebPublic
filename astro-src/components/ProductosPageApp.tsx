"use client";

import AppShell from "./AppShell";
import ProductosContent from "./productos-content";

export default function ProductosPageApp(props: Parameters<typeof ProductosContent>[0]) {
  return (
    <AppShell>
      <ProductosContent {...props} />
    </AppShell>
  );
}
