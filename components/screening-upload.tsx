"use client"

import type React from "react"
import { useState } from "react"
import { Upload, Loader2, AlertCircle, Sparkles } from "lucide-react"

interface ScreeningUploadProps {
  onScreeningComplete: (data: any) => void
  onLoadingChange: (loading: boolean) => void
  loading: boolean
}

export default function ScreeningUpload({ onScreeningComplete, onLoadingChange, loading }: ScreeningUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const processFile = async (file: File) => {
    if (!file.type.includes("pdf") && !file.type.includes("image")) {
      setError("Please upload a PDF or image file")
      return
    }

    setError(null)
    setSuccess(true)
    onLoadingChange(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/screening", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Screening failed. Please try again.")
      }

      const data = await response.json()
      onScreeningComplete(data)
      setSuccess(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setSuccess(false)
    } finally {
      onLoadingChange(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      processFile(files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      processFile(files[0])
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div
          className="relative group"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {/* Gradient border effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-2xl opacity-0 group-hover:opacity-50 blur transition-all duration-300"></div>

          <div
            className={`relative rounded-2xl border-2 backdrop-blur-xl transition-all duration-300 p-8 text-center ${
              dragActive
                ? "border-blue-400 bg-blue-500/10 shadow-lg shadow-blue-500/20"
                : "border-slate-700/50 bg-slate-900/50 hover:bg-slate-900/70 hover:border-slate-600"
            }`}
          >
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/30">
                <Upload className="h-10 w-10 text-blue-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Upload Passport</h3>
            <p className="text-sm text-slate-400 mb-6">Drag and drop your passport PDF or image here</p>

            <input
              type="file"
              onChange={handleChange}
              disabled={loading}
              id="file-input"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
            />

            <button
              onClick={() => document.getElementById("file-input")?.click()}
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-3 text-sm font-semibold text-white hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 cursor-pointer transition-all duration-300 glow-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Browse Files
                </>
              )}
            </button>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-cyan-400" />
            <h3 className="text-xl font-bold text-white">Screening Process</h3>
          </div>
          <div className="space-y-4">
            {[
              { icon: "1", title: "OCR Extraction", desc: "Extract name from passport using advanced Tesseract OCR" },
              { icon: "2", title: "Sanctions Check", desc: "Verify against UN consolidated sanctions list" },
              { icon: "3", title: "Instant Results", desc: "Get detailed compliance screening results" },
            ].map((step, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-purple-400/30 flex items-center justify-center">
                  <span className="text-sm font-bold text-purple-400">{step.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{step.title}</p>
                  <p className="text-xs text-slate-400 mt-1">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="flex gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 backdrop-blur-md glow-primary">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-400">Error</p>
            <p className="text-xs text-red-300/80 mt-1">{error}</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex gap-3 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 backdrop-blur-md pulse-glow">
          <Loader2 className="h-5 w-5 text-blue-400 animate-spin flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-400">Processing Passport</p>
            <p className="text-xs text-blue-300/80 mt-1">Extracting name and checking sanctions list...</p>
          </div>
        </div>
      )}
    </div>
  )
}
