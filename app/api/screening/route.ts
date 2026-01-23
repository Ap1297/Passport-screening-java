import { type NextRequest, NextResponse } from "next/server"

export const POST = async (request: NextRequest) => {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.includes("pdf") && !file.type.includes("image")) {
      return NextResponse.json({ error: "Invalid file type. Please upload a PDF or image." }, { status: 400 })
    }

    // Convert file to base64
    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString("base64")

    // 1. Determine the Base URL (Domain only)
    const isProduction = process.env.NODE_ENV === "production"
    const baseUrl = process.env.SPRING_BOOT_API_URL || 
      (isProduction 
        ? "https://passport-screening-backend.onrender.com" 
        : "http://localhost:10000")

    // 2. Construct the Full Endpoint URL
    // We remove any trailing slash from baseUrl to avoid double slashes //
    const cleanBaseUrl = baseUrl.replace(/\/$/, "")
    const backendUrl = `${cleanBaseUrl}/api/screening/check`

    console.log("[v0] Environment:", process.env.NODE_ENV)
    console.log("[v0] Base URL:", cleanBaseUrl)
    console.log("[v0] Full Backend URL:", backendUrl)

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) 

      const backendResponse = await fetch(backendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          file: base64,
          fileName: file.name,
          fileType: file.type,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!backendResponse.ok) {
        const errorText = await backendResponse.text()
        console.error("[v0] Backend error:", backendResponse.status, errorText)
        throw new Error(`Backend error: ${backendResponse.status}`)
      }

      const result = await backendResponse.json()
      return NextResponse.json(result)
    } catch (backendError) {
      console.error("[v0] Backend call failed:", backendError)

      // Fallback: Mock data ONLY in development
      if (process.env.NODE_ENV === "development") {
        return NextResponse.json({
          success: true,
          extractedName: "JOHN DOE",
          confidence: 0.92,
          sanctioned: false,
          matchedEntries: [],
          message: "Mock data - Backend not running",
        })
      }
      throw backendError
    }
  } catch (error) {
    console.error("[v0] Screening error:", error)
    return NextResponse.json(
      { error: "Screening failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}