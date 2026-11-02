"use client";

import type { ReactNode } from "react";
import ClientWrapper from "./ClientWrapper";
import { GoogleMapsProvider } from "@/components/maps/GoogleMapsProvider";
import { GOOGLE_MAPS_API_KEY } from "../server/google-maps-key";

/**
 * Equivalente de app/layout.tsx (GoogleMapsProvider + ClientWrapper). En Next
 * envuelve toda la app una sola vez en el layout raíz; acá cada página es su
 * propia isla, así que cualquier página con contenido interactivo (useClient,
 * useLoadingContext, el chat, mapas) necesita este mismo wrapper o revienta
 * con "X must be used within a Provider".
 */
export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <GoogleMapsProvider apiKey={GOOGLE_MAPS_API_KEY}>
      <ClientWrapper>{children}</ClientWrapper>
    </GoogleMapsProvider>
  );
}
