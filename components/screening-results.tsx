"use client"

import { AlertCircle, CheckCircle2, Shield } from "lucide-react"

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
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Extracted Name", value: extracted_name?.trim() || "Not extracted", icon: "👤" },
          { label: "OCR Confidence", value: `${(confidence * 100).toFixed(1)}%`, icon: "🎯" },
          { label: "Processing Time", value: `${processing_time?.toFixed(2) || "0.00"}s`, icon: "⚡" },
          {
            label: "Screened",
            value: timestamp ? new Date(timestamp).toLocaleString() : "N/A",
            icon: "📅",
          },
        ].map((item, idx) => (
          <div key={idx} className="glass-card p-4 hover:bg-slate-900/50 transition-all duration-300 group">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{item.label}</p>
            <p className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors truncate">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Main sanctions result card */}
      <div
        className={`glass-card p-6 border-2 transition-all duration-300 ${
          isSanctioned
            ? "border-red-500/50 bg-red-500/5 shadow-lg shadow-red-500/20"
            : "border-green-500/50 bg-green-500/5 shadow-lg shadow-green-500/20"
        }`}
      >
        <div className="flex items-start gap-4">
          {isSanctioned ? (
            <div className="flex-shrink-0 p-2 rounded-lg bg-red-500/20">
              <AlertCircle className="h-6 w-6 text-red-400" />
            </div>
          ) : (
            <div className="flex-shrink-0 p-2 rounded-lg bg-green-500/20">
              <CheckCircle2 className="h-6 w-6 text-green-400" />
            </div>
          )}
          <div className="flex-1">
            <h3 className={`text-2xl font-bold ${isSanctioned ? "text-red-400" : "text-green-400"}`}>
              {isSanctioned ? "⚠️ MATCH FOUND" : "✓ NO MATCH FOUND"}
            </h3>
            <p className="text-sm text-slate-300 mt-2">
              {isSanctioned
                ? "This individual appears on one or more international sanctions lists. Further action may be required."
                : "This individual does not appear on the UN consolidated sanctions list. Screening passed successfully."}
            </p>
          </div>
        </div>

        {isSanctioned && sanctions.entries.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <p className="text-sm font-semibold text-white mb-4">Matching Entries:</p>
            <div className="space-y-3">
              {sanctions.entries.map((entry, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-red-500/30 transition-colors"
                >
                  <p className="text-sm font-medium text-slate-200">{entry.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* System information */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="h-5 w-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">System Information</h3>
        </div>
        <dl className="grid grid-cols-2 gap-6 text-sm">
          <div className="space-y-2">
            <dt className="text-slate-400 text-xs font-semibold uppercase">Database Status</dt>
            <dd className="text-base font-semibold text-cyan-400">Live & Updated</dd>
          </div>
          <div className="space-y-2">
            <dt className="text-slate-400 text-xs font-semibold uppercase">Data Source</dt>
            <dd className="text-base font-semibold text-cyan-400">UN Consolidated List</dd>
          </div>
          <div className="space-y-2">
            <dt className="text-slate-400 text-xs font-semibold uppercase">OCR Engine</dt>
            <dd className="text-base font-semibold text-purple-400">Tesseract + Tika</dd>
          </div>
          <div className="space-y-2">
            <dt className="text-slate-400 text-xs font-semibold uppercase">Last Updated</dt>
            <dd className="text-base font-semibold text-emerald-400">Nightly 12 AM</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
