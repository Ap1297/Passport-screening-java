"use client"

import type React from "react"
import { useState } from "react"
import { Upload, Loader2, AlertCircle, FileCheck, Scan, ShieldCheck, Search } from "lucide-react"

interface ScreeningUploadProps {
  onScreeningComplete: (data: any) => void
  onLoadingChange: (loading: boolean) => void
  loading: boolean
}

export default function ScreeningUpload({ onScreeningComplete, onLoadingChange, loading }: ScreeningUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    onLoadingChange(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const token = localStorage.getItem("token")

      const response = await fetch("/api/screening", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Screening failed. Please try again.")
      }

      const data = await response.json()
      onScreeningComplete(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
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
    <div className="space-y-4">
      {/* Page Title */}
      <div className="text-center mb-4">
        <h2 className="text-3xl font-bold text-foreground mb-2">Passport Screening</h2>
        <p className="text-muted-foreground text-sm">Upload a passport document to verify against UN Security Council sanctions compliance lists</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Upload Area */}
        <div
          className="lg:col-span-3 relative group"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div
            className={`relative rounded-2xl border-2 border-dashed backdrop-blur-xl transition-all duration-300 p-10 text-center ${
              dragActive
                ? "border-amber-500 bg-amber-500/5 glow-gold"
                : "border-border bg-card hover:bg-amber-500/5 hover:border-amber-500/50"
            }`}
          >
            <div className="flex justify-center mb-6">
              <div className={`p-5 rounded-2xl transition-all duration-300 ${
                dragActive 
                  ? "bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25" 
                  : "bg-amber-500/10 border border-amber-500/20"
              }`}>
                <Upload className={`h-12 w-12 transition-colors ${dragActive ? "" : "text-amber-600 dark:text-amber-400"}`} />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-foreground mb-2">Upload Passport Document</h3>
            <p className="text-sm text-muted-foreground mb-2">Drag and drop your passport PDF or image file</p>
            <p className="text-xs text-muted-foreground mb-6">Supported formats: PDF, JPG, PNG</p>

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
              className="btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing Document...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  Browse Files
                </>
              )}
            </button>
          </div>
        </div>

        {/* Process Steps */}
        <div className="lg:col-span-2 glass-card-elevated p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
              <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Verification Process</h3>
          </div>
          
          <div className="space-y-5">
            {[
              { 
                icon: <Scan className="h-5 w-5" />, 
                title: "Document OCR", 
                desc: "Advanced text extraction from passport using Tesseract OCR engine",
              },
              { 
                icon: <Search className="h-5 w-5" />, 
                title: "UN SC Consolidated List", 
                desc: "Data validated against UN Security Council Consolidated List from official United Nations website",
              },
              { 
                icon: <FileCheck className="h-5 w-5" />, 
                title: "Compliance Report", 
                desc: "Detailed screening results with match confidence scores",
              },
            ].map((step, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className="flex-shrink-0 p-2.5 rounded-xl bg-secondary border border-border text-muted-foreground">
                  {step.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{step.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="status-dot status-active"></div>
              <span>UN SC Consolidated List (un.org) synced</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex gap-4 rounded-xl border border-red-500/20 bg-red-500/10 p-5 backdrop-blur-md glow-danger">
          <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">Screening Error</p>
            <p className="text-sm text-red-700/80 dark:text-red-300/80 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="glass-card-elevated p-6 animated-border">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary text-primary-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
            <div className="flex-1">
              <p className="text-base font-semibold text-foreground">Processing Document</p>
              <p className="text-sm text-muted-foreground mt-1">Extracting passport data and verifying against sanctions database...</p>
            </div>
            <div className="badge-secondary">
              <Scan className="h-3 w-3 mr-1" />
              Scanning
            </div>
          </div>
          
          {/* Progress bar animation */}
          <div className="mt-4 h-1.5 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-foreground to-muted-foreground rounded-full shimmer" style={{ width: '60%' }}></div>
          </div>
        </div>
      )}
    </div>
  )
}
