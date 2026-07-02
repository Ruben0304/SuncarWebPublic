"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { LoadingProvider, useLoadingContext } from "@/hooks/useLoadingContext";
import { ClientProvider } from "@/hooks/useClient";

const UnifiedChatAssistant = dynamic(() => import("./UnifiedChatAssistant"), {
  ssr: false,
  loading: () => null,
});

interface ClientWrapperProps {
  children: React.ReactNode;
}

function ClientWrapperContent({ children }: ClientWrapperProps) {
  const [shouldRenderChat, setShouldRenderChat] = useState(false);
  const { setLoadingComplete } = useLoadingContext();
  const pathname = usePathname();

  // La tarjeta de presentación es una página personal del trabajador:
  // no debe mostrar el asistente/FAB de WhatsApp corporativo.
  const hideChat = pathname?.startsWith("/tarjeta");

  useEffect(() => {
    // Ensure components waiting on the loader can proceed immediately
    setLoadingComplete(true);
  }, [setLoadingComplete]);

  useEffect(() => {
    if (shouldRenderChat) return;

    const showChat = () => {
      setShouldRenderChat(true);
      cleanup();
    };

    const events: Array<keyof WindowEventMap> = [
      "pointerdown",
      "keydown",
      "touchstart",
      "scroll",
    ];
    const timer = setTimeout(showChat, 12000);

    const cleanup = () => {
      clearTimeout(timer);
      events.forEach((eventName) => {
        window.removeEventListener(eventName, showChat);
      });
    };

    events.forEach((eventName) => {
      window.addEventListener(eventName, showChat, {
        passive: true,
        once: true,
      });
    });

    return cleanup;
  }, []);

  return (
    <>
      <div className="transition-opacity duration-500 opacity-100">
        {children}
      </div>
      {shouldRenderChat && !hideChat && <UnifiedChatAssistant />}
    </>
  );
}

export default function ClientWrapper({ children }: ClientWrapperProps) {
  return (
    <LoadingProvider>
      <ClientProvider>
        <ClientWrapperContent>{children}</ClientWrapperContent>
      </ClientProvider>
    </LoadingProvider>
  );
}
