"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import ScreeningUpload from "@/components/screening-upload"
import ScreeningResults from "@/components/screening-results"
import Header from "@/components/header"
import LegitimacyBanner from "@/components/legitimacy-banner"
import { Loader2, ShieldCheck, ArrowLeft } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const [screeningData, setScreeningData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
    } else {
      setIsAuthenticated(true)
    }
    setCheckingAuth(false)
  }, [router])

  const handleScreeningComplete = (data: any) => {
    setScreeningData(data)
  }

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-2xl bg-primary text-primary-foreground">
            <ShieldCheck className="h-10 w-10" />
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Verifying credentials...</span>
          </div>
        </div>
      </main>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <main className="min-h-screen bg-background overflow-hidden">
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-black"></div>
        <div className="absolute inset-0 pattern-grid"></div>
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-zinc-200/50 dark:from-zinc-800/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-zinc-200/50 dark:from-zinc-800/30 to-transparent"></div>
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-zinc-300/30 dark:bg-zinc-700/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-0 w-[600px] h-[600px] bg-zinc-300/30 dark:bg-zinc-700/20 rounded-full blur-3xl"></div>
      </div>

      <Header />
      
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <LegitimacyBanner />
        
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
              className="btn-outline inline-flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              New Screening
            </button>
            <ScreeningResults data={screeningData} />
          </div>
        )}
      </div>
    </main>
  )
}
