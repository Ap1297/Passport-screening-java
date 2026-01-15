"use client"

import { useState } from "react"
import ScreeningUpload from "@/components/screening-upload"
import ScreeningResults from "@/components/screening-results"
import Header from "@/components/header"

export default function Home() {
  const [screeningData, setScreeningData] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleScreeningComplete = (data) => {
    setScreeningData(data)
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {!screeningData ? (
          <ScreeningUpload
            onScreeningComplete={handleScreeningComplete}
            onLoadingChange={setLoading}
            loading={loading}
          />
        ) : (
          <div className="space-y-6">
            <button
              onClick={() => setScreeningData(null)}
              className="inline-flex items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/90"
            >
              ← New Screening
            </button>
            <ScreeningResults data={screeningData} />
          </div>
        )}
      </div>
    </main>
  )
}
