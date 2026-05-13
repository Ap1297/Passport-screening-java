"use client"

import { AlertTriangle, CheckCircle2, Shield, User, Clock, Target, Calendar, Database, FileSearch, Building2 } from "lucide-react"

interface ScreeningResult {
  extracted_name: string
  confidence: number
  sanctions: {
    is_sanctioned: boolean
    entries: Array<{
      name: string
    }>
  }
  processing_time: number
  timestamp: string
}

interface ScreeningResultsProps {
  data: ScreeningResult | null
}

export default function ScreeningResults({ data }: ScreeningResultsProps) {
  if (!data) return null

  const { extracted_name, confidence, sanctions, processing_time, timestamp } = data
  const isSanctioned = sanctions.is_sanctioned

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-card-gold p-5 group hover:border-amber-500/40 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/30">
              <User className="h-4 w-4 text-amber-400" />
            </div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Extracted Name</p>
          </div>
          <p className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors truncate">
            {extracted_name?.trim() || "Not extracted"}
          </p>
        </div>

        <div className="glass-card-gold p-5 group hover:border-emerald-500/40 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
              <Target className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">OCR Confidence</p>
          </div>
          <p className="text-lg font-bold text-emerald-400">
            {(confidence * 100).toFixed(1)}%
          </p>
        </div>

        <div className="glass-card-gold p-5 group hover:border-amber-500/40 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/30">
              <Clock className="h-4 w-4 text-amber-400" />
            </div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Processing Time</p>
          </div>
          <p className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
            {processing_time?.toFixed(2) || "0.00"}s
          </p>
        </div>

        <div className="glass-card-gold p-5 group hover:border-emerald-500/40 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
              <Calendar className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Screened At</p>
          </div>
          <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
            {timestamp ? new Date(timestamp).toLocaleString() : "N/A"}
          </p>
        </div>
      </div>

      {/* Main Result Card */}
      <div
        className={`glass-card p-8 border-2 transition-all duration-300 ${
          isSanctioned
            ? "border-red-500/50 bg-red-500/5 glow-red"
            : "border-emerald-500/50 bg-emerald-500/5 glow-emerald"
        }`}
      >
        <div className="flex items-start gap-5">
          {isSanctioned ? (
            <div className="flex-shrink-0 p-4 rounded-2xl bg-red-500/20 border border-red-500/30">
              <AlertTriangle className="h-10 w-10 text-red-400" />
            </div>
          ) : (
            <div className="flex-shrink-0 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30">
              <CheckCircle2 className="h-10 w-10 text-emerald-400" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className={`text-2xl font-bold ${isSanctioned ? "text-red-400" : "text-emerald-400"}`}>
                {isSanctioned ? "SANCTIONS MATCH DETECTED" : "NO SANCTIONS MATCH"}
              </h3>
              <div className={isSanctioned ? "badge-warning" : "badge-verified"}>
                {isSanctioned ? "Action Required" : "Cleared"}
              </div>
            </div>
            <p className="text-base text-gray-300 leading-relaxed">
              {isSanctioned
                ? "This individual appears on one or more UAE or international sanctions lists. Immediate compliance review and further due diligence is required before proceeding."
                : "This individual does not appear on UAE or UN consolidated sanctions lists. The screening has been completed successfully and no matches were found."}
            </p>
          </div>
        </div>

        {/* Matching Entries */}
        {isSanctioned && sanctions.entries.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-700/50">
            <div className="flex items-center gap-2 mb-4">
              <FileSearch className="h-5 w-5 text-red-400" />
              <p className="text-base font-bold text-white">Matching Sanctions Entries ({sanctions.entries.length})</p>
            </div>
            <div className="space-y-3">
              {sanctions.entries.map((entry, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-gray-800/50 border border-red-500/20 hover:border-red-500/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-red-400">{idx + 1}</span>
                    </div>
                    <p className="text-sm font-medium text-white">{entry.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* System Information */}
      <div className="glass-card-gold p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/30">
            <Shield className="h-5 w-5 text-amber-400" />
          </div>
          <h3 className="text-lg font-bold text-white">Compliance Information</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-400">
              <Database className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase">Database</span>
            </div>
            <p className="text-sm font-bold text-emerald-400">Live & Connected</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-400">
              <FileSearch className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase">Data Source</span>
            </div>
            <p className="text-sm font-bold text-amber-400">UN & UAE Lists</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-400">
              <Building2 className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase">Compliance</span>
            </div>
            <p className="text-sm font-bold text-amber-400">UAE AML/CFT</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-400">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase">Last Sync</span>
            </div>
            <p className="text-sm font-bold text-emerald-400">Daily 00:00 UTC</p>
          </div>
        </div>
      </div>
    </div>
  )
}
