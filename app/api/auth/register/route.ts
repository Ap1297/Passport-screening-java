import { NextRequest, NextResponse } from "next/server"

// Determine Backend URL based on Environment
const isProduction = process.env.NODE_ENV === "production"

// Priority: 1. Environment Variable -> 2. Production URL -> 3. Localhost
const BACKEND_URL = process.env.BACKEND_URL || 
  (isProduction 
    ? "https://passport-screening-backend.onrender.com" 
    : "http://localhost:10000")

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Registration failed" },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Authentication service unavailable" },
      { status: 503 }
    )
  }
}
