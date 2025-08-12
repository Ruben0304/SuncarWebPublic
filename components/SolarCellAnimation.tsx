"use client"
import { DotLottieReact } from "@lottiefiles/dotlottie-react"

export default function SolarCellAnimation() {
  return (
    <div className="w-full h-full flex items-center justify-center min-h-[400px] lg:min-h-[500px]">
      <DotLottieReact
        src="/lottie/solar cell.lottie"
        loop
        autoplay
        className="w-full h-auto max-w-lg lg:max-w-2xl"
      />
    </div>
  )
}