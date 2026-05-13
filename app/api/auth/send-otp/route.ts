import { NextRequest, NextResponse } from "next/server"

const isProduction = process.env.NODE_ENV === "production"

// Priority: 1. Environment Variable -> 2. Production URL -> 3. Localhost
const BACKEND_URL = process.env.SPRING_BOOT_API_URL || 
  (isProduction 
    ? "https://passport-screening-backend.onrender.com" 
    : "http://localhost:8080")

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(`${BACKEND_URL}/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Failed to send OTP" },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Send OTP error:", error)
    return NextResponse.json(
      { error: "Failed to send OTP. Please try again." },
      { status: 500 }
    )
  }
}
