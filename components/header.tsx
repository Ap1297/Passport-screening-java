"use client"

import { ShieldAlert, Zap } from "lucide-react"

export default function Header() {
  return (
    <header className="relative border-b border-blue-500/20 bg-gradient-to-r from-slate-900/80 via-slate-900/50 to-slate-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5 opacity-50"></div>

      <div className="container mx-auto max-w-6xl px-4 py-8 relative z-10">
        <div className="flex items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/30">
                <ShieldAlert className="h-6 w-6 text-blue-400" />
              </div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Passport Screening
              </h1>
            </div>
            <p className="text-sm text-slate-400">
              Advanced identity verification against international sanctions lists with AI-powered OCR
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 glow-primary">
            <Zap className="h-4 w-4 text-green-400" />
            <p className="text-sm font-semibold text-green-400">Live System</p>
          </div>
        </div>
      </div>
    </header>
  )
}
