"use client"

import dynamic from "next/dynamic"
import Image from "next/image"
import { POSTER_CASA } from "@/lib/poster-casa"

// Mientras baja el visor 3D se ve la imagen de la casa, sin indicadores de carga.
const SolarHouseModel = dynamic(() => import("@/components/solar-house-model"), {
    ssr: false,
    loading: () => (
        <div className="relative w-full pt-12 lg:w-[135%] lg:-ml-[17.5%]">
            <div className="relative h-[480px] w-full md:h-[600px] lg:h-[760px]">
                <Image
                    src={POSTER_CASA}
                    alt="Casa con paneles solares - Suncar"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-contain"
                />
            </div>
        </div>
    )
})

/** Casa 3D del hero, igual en móvil y escritorio. */
export default function HeroModelo() {
    return <SolarHouseModel />
}
