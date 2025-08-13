"use client"
import { DotLottieReact } from "@lottiefiles/dotlottie-react"

export default function LottieAnimation() {
  return (
    <div className="w-full h-full flex items-center justify-center min-h-[400px] sm:min-h-[500px] lg:min-h-[700px] xl:min-h-[800px]">
      <DotLottieReact
        src="https://lottie.host/3235ff84-e8e6-4139-be66-d728f3cbf11a/Sj0eNH6YOE.lottie"
        loop
        autoplay
        className="w-full h-auto max-w-none scale-150 sm:scale-110 lg:scale-125 xl:scale-150"
      />
    </div>
  )
}
