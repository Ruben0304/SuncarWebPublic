"use client"
import { DotLottieReact } from "@lottiefiles/dotlottie-react"

export default function LottieAnimation() {
  return (
    <div className="w-full h-full flex items-center justify-center min-h-[500px]">
      <DotLottieReact
        src="https://lottie.host/3235ff84-e8e6-4139-be66-d728f3cbf11a/Sj0eNH6YOE.lottie"
        loop
        autoplay
        className="w-full h-auto max-w-6xl"
      />
    </div>
  )
}
