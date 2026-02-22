"use client"

import { DotLottieReact } from "@lottiefiles/dotlottie-react"

export default function BuildingSolarAnimation() {
  return (
    <div className="w-full h-full flex items-center justify-center min-h-[400px] sm:min-h-[500px] lg:min-h-[700px] xl:min-h-[800px]">
      <DotLottieReact
        src="https://s3.suncarsrl.com/lottie/building-solar.lottie"
        loop
        autoplay
        className="w-full h-auto max-w-none"
      />
    </div>
  )
}
