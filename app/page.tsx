"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import LegitimacyBanner from "@/components/legitimacy-banner"
import ScreeningUpload from "@/components/screening-upload"
import ScreeningResults from "@/components/screening-results"

export default function Home() {
  const router = useRouter()
  const [screeningResult, setScreeningResult] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  const handleScreeningComplete = (data: any) => {
    setScreeningResult(data)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-6xl px-4 py-6">
        {/* Upload Section First */}
        <ScreeningUpload
          onScreeningComplete={handleScreeningComplete}
          onLoadingChange={setLoading}
          loading={loading}
        />
        
        {/* Legitimacy Banner Below */}
        <div className="mt-6">
          <LegitimacyBanner />
        </div>

        {/* Results Below */}
        {screeningResult && (
          <div className="mt-6">
            <ScreeningResults data={screeningResult} />
          </div>
        )}
      </main>
    </div>
  )
}
