"use client"
import { DotLottieReact } from "@lottiefiles/dotlottie-react"

export default function TiendaAnimation() {
  return (
    <div className="w-full h-full flex items-center justify-center min-h-[300px] sm:min-h-[400px] lg:min-h-[500px]">
      <DotLottieReact
        src="https://s3.suncarsrl.com/lottie/tienda.lottie"
        loop
        autoplay
        className="w-full h-auto"
      />
    </div>
  )
}
