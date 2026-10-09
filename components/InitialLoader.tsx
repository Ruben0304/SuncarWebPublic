"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const DotLottieReact = dynamic(
  () => import("@lottiefiles/dotlottie-react").then((m) => m.DotLottieReact),
  { ssr: false, loading: () => null },
);

// Un ciclo completo de la animación (0,9 s): menos que eso el loader solo
// parpadea y no llega a verse la C completa.
const MIN_VISIBLE_MS = 900;
// Tope por si `load` tarda (imágenes pesadas en conexiones lentas): el loader
// no debe tapar la web más de esto.
const MAX_VISIBLE_MS = 5000;
const FADE_MS = 300;

// Pantalla de carga que cubre la web desde el primer pintado. Va renderizada
// en el HTML del servidor (no espera a hidratar) y se desvanece cuando la
// página terminó de cargar.
export default function InitialLoader() {
  const [phase, setPhase] = useState<"visible" | "fading" | "gone">("visible");

  useEffect(() => {
    let fadeTimer: ReturnType<typeof setTimeout> | undefined;
    let goneTimer: ReturnType<typeof setTimeout> | undefined;
    let done = false;

    const hide = () => {
      setPhase("fading");
      goneTimer = setTimeout(() => setPhase("gone"), FADE_MS);
    };

    // performance.now() cuenta desde que empezó la navegación, así que el
    // mínimo no se suma al tiempo que ya tardó la página en cargar.
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(capTimer);
      fadeTimer = setTimeout(hide, Math.max(0, MIN_VISIBLE_MS - performance.now()));
    };

    const capTimer = setTimeout(finish, Math.max(0, MAX_VISIBLE_MS - performance.now()));

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish, { once: true });
    }

    return () => {
      window.removeEventListener("load", finish);
      clearTimeout(capTimer);
      clearTimeout(fadeTimer);
      clearTimeout(goneTimer);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <>
      {/* Sin JS el overlay no se podría quitar y taparía la web para siempre. */}
      <noscript>
        <style>{".initial-loader{display:none!important}"}</style>
      </noscript>
      <div
        className={`initial-loader fixed inset-0 z-[9999] flex items-center justify-center bg-[#F2F2EF] transition-opacity ease-out ${
          phase === "fading" ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
        style={{ transitionDuration: `${FADE_MS}ms` }}
        role="status"
        aria-live="polite"
        aria-label="Cargando SunCar"
      >
        <div className="h-44 w-44 sm:h-52 sm:w-52">
          <DotLottieReact
            src="/suncar-loader.lottie"
            loop
            autoplay
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </div>
    </>
  );
}
