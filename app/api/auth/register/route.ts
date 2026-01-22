import { NextRequest, NextResponse } from "next/server"

// Determine Backend URL based on Environment
const isProduction = process.env.NODE_ENV === "production"

// Priority: 1. Environment Variable -> 2. Production URL -> 3. Localhost
const BACKEND_URL = process.env.BACKEND_URL || 
  (isProduction 
    ? "https://passport-screening-backend.onrender.com" 
    : "http://localhost:8080")

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log(`[Auth] Attempting login via: ${BACKEND_URL}/api/auth/login`);

    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Invalid credentials" },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Authentication service unavailable" },
      { status: 503 }
    )
  }
}