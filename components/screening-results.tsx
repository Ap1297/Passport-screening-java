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

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Extracted Name</p>
          <p className="text-lg font-semibold text-foreground truncate">{extracted_name?.trim() || "Not extracted"}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">OCR Confidence</p>
          <p className="text-lg font-semibold text-foreground">{(confidence * 100).toFixed(1)}%</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Processing Time</p>
          <p className="text-lg font-semibold text-foreground">{processing_time?.toFixed(2) || "0.00"}s</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Screened</p>
          <p className="text-xs text-foreground">{timestamp ? new Date(timestamp).toLocaleString() : "N/A"}</p>
        </div>
      </div>

      <div
        className={`rounded-lg border-2 p-6 ${
          sanctions.is_sanctioned ? "border-destructive bg-destructive/5" : "border-success bg-success/5"
        }`}
      >
        <div className="flex items-start gap-4">
          {sanctions.is_sanctioned ? (
            <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <h3 className={`text-lg font-bold ${sanctions.is_sanctioned ? "text-destructive" : "text-success"}`}>
              {sanctions.is_sanctioned ? "MATCH FOUND" : "NO MATCH FOUND"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {sanctions.is_sanctioned
                ? "This individual appears on one or more sanctions lists."
                : "This individual does not appear on the UN consolidated sanctions list."}
            </p>
          </div>
        </div>

        {sanctions.is_sanctioned && sanctions.entries.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm font-medium text-foreground mb-3">Matching Entries:</p>
            <div className="space-y-2">
              {sanctions.entries.map((entry, idx) => (
                <div key={idx} className="text-xs text-muted-foreground bg-card/50 rounded p-3">
                  <p className="font-medium text-foreground">{entry.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">System Information</h3>
        </div>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Database Version:</dt>
            <dd className="font-medium text-foreground">Latest (Updated Nightly)</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Data Source:</dt>
            <dd className="font-medium text-foreground">UN Consolidated Sanctions List</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Verification Method:</dt>
            <dd className="font-medium text-foreground">Tesseract OCR + Pattern Matching</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
