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

    // Determine Backend URL based on Environment
    const isProduction = process.env.NODE_ENV === "production"
    
    // Priority: 1. Environment Variable -> 2. Production URL -> 3. Localhost
    const backendUrl = process.env.SPRING_BOOT_API_URL || 
      (isProduction 
        ? "https://passport-screening-backend.onrender.com/api/screening/check" 
        : "http://localhost:10000/api/screening/check")

    console.log("[v0] Environment:", process.env.NODE_ENV)
    console.log("[v0] Calling backend at:", backendUrl)
    console.log("[v0] File:", file.name, file.type, file.size)

    try {
      // Try to call Spring Boot backend
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

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
      console.log("[v0] Backend response:", result) 
      return NextResponse.json(result)
    } catch (backendError) {
      console.error("[v0] Backend call failed:", backendError)

      // Fallback: Return mock data ONLY for development
      if (process.env.NODE_ENV === "development") {
        console.log("[v0] Backend not available, returning mock data for development")
        return NextResponse.json({
          success: true,
          extractedName: "JOHN DOE",
          confidence: 0.92,
          sanctioned: false,
          matchedEntries: [],
          cacheLastUpdated: new Date().toISOString(),
          message:
            "Mock data returned - Backend not running. Please start the Spring Boot backend at http://localhost:8080",
        })
      }

      throw backendError
    }
  } catch (error) {
    console.error("[v0] Screening error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

    return NextResponse.json(
      {
        error: "Screening failed",
        details: errorMessage,
        hint: "Make sure the Spring Boot backend is running",
      },
      { status: 500 },
    )
  }
}