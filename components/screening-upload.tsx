"use client"

import type React from "react"

import { useState } from "react"
import { Upload, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"

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
      <div className="grid gap-4 md:grid-cols-2">
        <div
          className="rounded-lg border-2 border-dashed border-border bg-card p-8 text-center transition-colors"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          style={{
            borderColor: dragActive ? "var(--color-primary)" : "var(--color-border)",
            backgroundColor: dragActive ? "var(--color-primary)" + "10" : "transparent",
          }}
        >
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Upload Passport</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Drag and drop your passport PDF or image here, or click to browse
          </p>

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
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 cursor-pointer"
            disabled={loading}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Browse Files
          </button>
        </div>

        <div className="space-y-4 rounded-lg border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground">Screening Process</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">OCR Extraction</p>
                <p className="text-xs text-muted-foreground">Extract name from passport using advanced OCR</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Sanctions Check</p>
                <p className="text-xs text-muted-foreground">Verify against UN consolidated sanctions list</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Instant Results</p>
                <p className="text-xs text-muted-foreground">Get detailed compliance screening results</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex gap-3 rounded-lg border border-destructive bg-destructive/10 p-4">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive">Error</p>
            <p className="text-xs text-destructive mt-1">{error}</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex gap-3 rounded-lg border border-primary bg-primary/10 p-4">
          <Loader2 className="h-5 w-5 text-primary animate-spin flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-primary">Processing</p>
            <p className="text-xs text-muted-foreground mt-1">Extracting name and checking sanctions list...</p>
          </div>
        </div>
      )}
    </div>
  )
}
