"use client"

import { DotLottieReact } from "@lottiefiles/dotlottie-react"

const SERVICES_LOTTIE_URL =
  "https://lottie.host/1218704e-7791-40ae-87aa-56bfb1b882ee/jkfPeCFG56.lottie"

export default function LottieAnimation() {
  return (
    <div className="w-full h-full flex items-center justify-center min-h-[400px] sm:min-h-[500px] lg:min-h-[700px] xl:min-h-[800px]">
      <DotLottieReact
        src={SERVICES_LOTTIE_URL}
        loop
        autoplay
        className="w-full h-auto max-w-none scale-150 sm:scale-110 lg:scale-125 xl:scale-150"
      />
    </div>
  )
}
