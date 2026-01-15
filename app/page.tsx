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
    <main className="min-h-screen bg-background overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5"></div>
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl opacity-30 animate-pulse"></div>
      </div>

      <Header />
      <div className="container mx-auto max-w-6xl px-4 py-12">
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
              className="inline-flex items-center justify-center rounded-lg bg-slate-800/50 border border-slate-700/50 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700/50 hover:border-slate-600 transition-all duration-300"
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
