'use client'

import { Suspense } from 'react'
import ProgressBar from './ProgressBar'

export default function ProgressBarSuspense() {
  return (
    <Suspense fallback={null}>
      <ProgressBar />
    </Suspense>
  )
}