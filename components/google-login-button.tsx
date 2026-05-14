import { GoogleLogin } from "@react-oauth/google"
import { useState } from "react"

interface GoogleLoginButtonProps {
  onSuccess?: (token: string) => void
  onError?: (error: any) => void
  loading?: boolean
}

export function GoogleLoginButton({
  onSuccess,
  onError,
  loading = false,
}: GoogleLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSuccess = async (credentialResponse: any) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken: credentialResponse.credential,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Google authentication failed")
      }

      // Store token and user data
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify({
        username: data.username,
        email: data.email,
        role: data.role,
      }))

      onSuccess?.(data.token)
    } catch (error) {
      console.error("Google login error:", error)
      onError?.(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleError = () => {
    console.error("Google login failed")
    onError?.(new Error("Google login failed"))
  }

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  if (!clientId) {
    console.warn("Google Client ID is not configured")
    return null
  }

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={handleError}
      theme="dark"
      size="large"
      width="100%"
    />
  )
}
