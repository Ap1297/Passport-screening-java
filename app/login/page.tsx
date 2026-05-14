"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { AnimatedParticles } from "@/components/animated-particles"
import { 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Lock, 
  User, 
  Mail, 
  Loader2, 
  Phone, 
  ArrowLeft, 
  CheckCircle,
  Fingerprint,
  Globe,
  FileCheck,
  Scan,
  Database,
  Shield,
  BadgeCheck,
  ExternalLink,
  Zap,
  ArrowRight,
  Sparkles,
  Activity,
  TrendingUp,
  Award
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { GoogleLoginButton } from "@/components/google-login-button"
import { GoogleOAuthProvider } from "@react-oauth/google"

type ViewType = "login" | "register" | "forgotPassword" | "verifyOtp" | "resetPassword"

export default function LoginPage() {
  const router = useRouter()
  const [view, setView] = useState<ViewType>("login")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    mobile: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Mouse tracking for spotlight effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        })
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccessMessage("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username: formData.username, 
          password: formData.password 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed")
      }

      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify({
        username: data.username,
        email: data.email,
        role: data.role,
      }))

      router.push("/")
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          mobile: formData.mobile,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      setSuccessMessage("Registration successful! Please sign in with your credentials.")
      setFormData({ ...formData, password: "", email: "", mobile: "" })
      setView("login")
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: formData.mobile }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP")
      }

      setSuccessMessage("OTP sent to your registered mobile number")
      setView("verifyOtp")
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send OTP"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          mobile: formData.mobile, 
          otp: formData.otp 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Invalid OTP")
      }

      setSuccessMessage("")
      setView("resetPassword")
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Invalid OTP"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          mobile: formData.mobile, 
          otp: formData.otp,
          newPassword: formData.newPassword 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password")
      }

      setSuccessMessage("Password reset successful! Please sign in with your new password.")
      setFormData({ ...formData, otp: "", newPassword: "", confirmPassword: "" })
      setView("login")
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to reset password"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const resetView = (newView: ViewType) => {
    setView(newView)
    setError("")
    if (newView !== "login") {
      setSuccessMessage("")
    }
  }

  const features = [
    {
      icon: <Database className="h-5 w-5" />,
      title: "Official UN Data",
      description: "UN SC Consolidated List"
    },
    {
      icon: <Scan className="h-5 w-5" />,
      title: "Advanced OCR",
      description: "AI-powered extraction"
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Real-time",
      description: "Instant verification"
    },
    {
      icon: <FileCheck className="h-5 w-5" />,
      title: "Reports",
      description: "Audit-ready docs"
    }
  ]

  const stats = [
    { value: "99.9%", label: "Accuracy", icon: <TrendingUp className="h-4 w-4" /> },
    { value: "<2s", label: "Response", icon: <Activity className="h-4 w-4" /> },
    { value: "24/7", label: "Available", icon: <Zap className="h-4 w-4" /> },
    { value: "100K+", label: "Screenings", icon: <Award className="h-4 w-4" /> },
  ]

  return (
    <main ref={containerRef} className="min-h-screen bg-background overflow-hidden relative">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Base gradient - rich and warm */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50/50 to-yellow-50/30 dark:from-[#0c0a09] dark:via-[#0a0908] dark:to-[#0f0d0a]"></div>
        
        {/* Large morphing gradient orbs */}
        <div 
          className="absolute -top-1/4 -right-1/4 w-[1000px] h-[1000px] rounded-full opacity-60 dark:opacity-40"
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(251,191,36,0.5) 0%, rgba(245,158,11,0.3) 30%, rgba(217,119,6,0.15) 60%, transparent 80%)',
            animation: 'morphBlob1 25s ease-in-out infinite',
            filter: 'blur(60px)'
          }}
        />
        <div 
          className="absolute -bottom-1/3 -left-1/4 w-[900px] h-[900px] rounded-full opacity-50 dark:opacity-30"
          style={{
            background: 'radial-gradient(circle at 70% 70%, rgba(217,119,6,0.4) 0%, rgba(180,83,9,0.2) 40%, transparent 70%)',
            animation: 'morphBlob2 20s ease-in-out infinite',
            filter: 'blur(80px)'
          }}
        />
        <div 
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-40 dark:opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(253,224,71,0.4) 0%, rgba(250,204,21,0.2) 40%, transparent 70%)',
            animation: 'morphBlob3 30s ease-in-out infinite',
            filter: 'blur(100px)'
          }}
        />

        {/* Floating particles */}
        <AnimatedParticles />

        {/* Animated grid lines */}
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(217,119,6,1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(217,119,6,1) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
            animation: 'gridMove 20s linear infinite'
          }}
        />

        {/* Diagonal light rays */}
        <div className="absolute inset-0 overflow-hidden opacity-20 dark:opacity-10">
          <div 
            className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%]"
            style={{
              background: 'repeating-linear-gradient(45deg, transparent, transparent 100px, rgba(251,191,36,0.03) 100px, rgba(251,191,36,0.03) 200px)',
              animation: 'diagonalMove 30s linear infinite'
            }}
          />
        </div>

        {/* Spotlight following mouse */}
        <div 
          className="absolute pointer-events-none transition-all duration-500 ease-out"
          style={{
            left: mousePosition.x - 300,
            top: mousePosition.y - 300,
            width: 600,
            height: 600,
            background: 'radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 50%)',
            filter: 'blur(40px)'
          }}
        />

        {/* Noise texture overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
          }}
        />

        {/* Top accent line with animation */}
        <div className="absolute top-0 left-0 right-0 h-1 overflow-hidden">
          <div 
            className="h-full w-[200%] bg-gradient-to-r from-transparent via-amber-500 to-transparent"
            style={{ animation: 'shimmerLine 3s linear infinite' }}
          />
        </div>

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-amber-500/10 to-transparent blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-amber-500/10 to-transparent blur-3xl"></div>
      </div>

      <style jsx>{`
        @keyframes morphBlob1 {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
          25% { transform: translate(5%, 5%) scale(1.05) rotate(5deg); }
          50% { transform: translate(-3%, 8%) scale(0.95) rotate(-5deg); }
          75% { transform: translate(8%, -3%) scale(1.02) rotate(3deg); }
        }
        @keyframes morphBlob2 {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
          33% { transform: translate(-5%, -5%) scale(1.08) rotate(-8deg); }
          66% { transform: translate(5%, -3%) scale(0.92) rotate(5deg); }
        }
        @keyframes morphBlob3 {
          0%, 100% { transform: translate(-50%, 0) scale(1); }
          50% { transform: translate(-50%, -10%) scale(1.1); }
        }
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(80px, 80px); }
        }
        @keyframes diagonalMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(200px, 200px); }
        }
        @keyframes shimmerLine {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(251,191,36,0.3); }
          50% { box-shadow: 0 0 40px rgba(251,191,36,0.5); }
        }
      `}</style>

      {/* Header */}
      <header className="relative z-20 border-b border-border/50 bg-background/70 backdrop-blur-2xl">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl blur-md opacity-70 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative p-3 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-white shadow-xl">
                  <ShieldCheck className="h-7 w-7" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-gold-text">SanctionScreen Pro</h1>
                <p className="text-xs text-muted-foreground">Third-Party Sanctions Compliance Tool</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 sm:gap-5">
              <ThemeToggle />
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/50 border border-border/50 backdrop-blur-sm">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">EN</span>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                </div>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto max-w-7xl px-4 sm:px-6 py-4 lg:py-6">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-center min-h-[calc(100vh-180px)]">
          
          {/* Left Side - Hero Content */}
          <div className="hidden lg:flex flex-col justify-center space-y-5">
            {/* Badge */}
            <div className="inline-flex self-start items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-yellow-500/15 border border-amber-500/30 backdrop-blur-sm shadow-lg shadow-amber-500/5">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">Trusted Compliance Solution</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-2">
              <h2 className="text-5xl xl:text-6xl font-bold leading-[1.1] tracking-tight">
                <span className="text-foreground">Sanctions Screening</span>
                <br />
                <span className="gradient-gold-text">Made Simple</span>
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed max-w-lg">
                Third-party compliance tool powered by official UN Security Council Consolidated List. 
                Fast, accurate, and reliable identity verification for your business.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-2">
              {stats.map((stat, idx) => (
                <div 
                  key={idx} 
                  className="group relative p-3 rounded-lg bg-card/60 border border-border/50 backdrop-blur-sm hover:bg-card/90 hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 cursor-default"
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative">
                    <div className="flex items-center gap-1 mb-1 text-muted-foreground group-hover:text-amber-500 transition-colors">
                      {stat.icon}
                    </div>
                    <div className="text-lg font-bold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, idx) => (
                <div 
                  key={idx}
                  className="group relative p-5 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm overflow-hidden hover:bg-card/80 hover:border-amber-500/30 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-500 hover:-translate-y-1"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 text-amber-600 dark:text-amber-400 group-hover:from-amber-500 group-hover:to-orange-500 group-hover:text-white group-hover:border-transparent group-hover:shadow-lg group-hover:shadow-amber-500/30 transition-all duration-300">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Data Source Card */}
            <div className="relative p-5 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-green-500/10 dark:from-emerald-500/5 dark:via-teal-500/5 dark:to-green-500/5"></div>
              <div className="absolute inset-0 border border-emerald-500/20 rounded-2xl"></div>
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
              
              <div className="relative flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-lg animate-pulse"></div>
                  <div className="relative p-3.5 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
                    <BadgeCheck className="h-6 w-6 text-emerald-500" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Verified Data Source</span>
                    <div className="relative">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-75"></div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Data validated from UN Security Council official website
                  </p>
                </div>
                <a 
                  href="https://main.un.org/securitycouncil/en/content/un-sc-consolidated-list" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                >
                  <span>View</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Forms */}
          <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
            {/* Success Message */}
            {successMessage && (
                      <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm flex items-start gap-2">
                <div className="p-1 rounded-full bg-emerald-500/20">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                </div>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">{successMessage}</p>
              </div>
            )}

            {/* Form Card Container */}
            <div className="relative">
              {/* Glow effect */}
              <div 
                className="absolute -inset-4 rounded-[2rem] opacity-75 blur-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(251,191,36,0.2) 0%, rgba(245,158,11,0.15) 50%, rgba(217,119,6,0.2) 100%)'
                }}
              ></div>
              
              {/* Card */}
              <div className="relative bg-card/90 backdrop-blur-2xl border border-border/50 rounded-3xl shadow-2xl overflow-hidden">
                {/* Top gradient border */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500"></div>
                
                {/* Animated shine effect */}
                <div className="absolute inset-0 overflow-hidden rounded-3xl">
                  <div 
                    className="absolute -top-1/2 -left-1/2 w-full h-full"
                    style={{
                      background: 'linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.03) 50%, transparent 60%)',
                      animation: 'cardShine 8s linear infinite',
                      transform: 'rotate(45deg) scale(2)'
                    }}
                  />
                </div>

                <div className="relative p-6">
                  {/* Login View */}
                  {view === "login" && (
                    <>
                      <div className="text-center mb-6">
                        <div className="relative inline-flex mb-3">
                          <div className="absolute -inset-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl blur-lg opacity-50"></div>
                          <div 
                            className="relative p-3 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-white shadow-lg"
                            style={{ animation: 'pulseGlow 3s ease-in-out infinite' }}
                          >
                            <Fingerprint className="h-7 w-7" />
                          </div>
                        </div>
                        <h2 className="text-lg font-bold text-foreground mb-1">Welcome Back</h2>
                        <p className="text-muted-foreground text-xs">Sign in to access the screening portal</p>
                      </div>

                      {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                          <div className="p-1 rounded-full bg-red-500/20">
                            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                      )}

                      <form onSubmit={handleLogin} className="space-y-3">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-foreground">Username</label>
                          <div className="relative group">
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 opacity-0 group-focus-within:opacity-100 blur transition-opacity"></div>
                            <div className="relative">
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-amber-500 transition-colors" />
                              <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="w-full pl-12 pr-4 py-4 bg-secondary/50 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50 focus:bg-card transition-all"
                                placeholder="Enter your username"
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-foreground">Password</label>
                          <div className="relative group">
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 opacity-0 group-focus-within:opacity-100 blur transition-opacity"></div>
                            <div className="relative">
                              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-amber-500 transition-colors" />
                              <input
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full pl-12 pr-12 py-4 bg-secondary/50 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50 focus:bg-card transition-all"
                                placeholder="Enter your password"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" className="w-4 h-4 rounded border-border text-amber-500 focus:ring-amber-500/20 bg-secondary" />
                            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Remember me</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => resetView("forgotPassword")}
                            className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium transition-colors"
                          >
                            Forgot password?
                          </button>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="relative w-full py-4 rounded-xl font-semibold text-white overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500"></div>
                          <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity" style={{ background: 'radial-gradient(circle at 50% 50%, white, transparent 60%)' }}></div>
                          <span className="relative flex items-center justify-center gap-2">
                            {loading ? (
                              <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Signing in...
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="h-5 w-5" />
                                Sign In
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                              </>
                            )}
                          </span>
                        </button>
                      </form>

                      <div className="mt-8 pt-6 border-t border-border/50">
                        <p className="text-muted-foreground text-sm text-center mb-4">Or continue with</p>
                        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
                          <GoogleLoginButton
                            onSuccess={(token) => {
                              router.push("/")
                            }}
                            onError={(error) => {
                              setError("Google login failed. Please try again.")
                            }}
                            loading={loading}
                          />
                        </GoogleOAuthProvider>
                      </div>

                      <div className="mt-6 pt-6 border-t border-border/50 text-center">
                        <p className="text-muted-foreground text-sm">
                          {"Don't have an account?"}{" "}
                          <button
                            onClick={() => resetView("register")}
                            className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-semibold transition-colors"
                          >
                            Register Now
                          </button>
                        </p>
                      </div>
                    </>
                  )}

                  {/* Register View */}
                  {view === "register" && (
                    <>
                      <div className="text-center mb-4">
                        <div className="relative inline-flex mb-2">
                          <div className="absolute -inset-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl blur-lg opacity-50"></div>
                          <div className="relative p-4 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-white shadow-xl">
                            <User className="h-8 w-8" />
                          </div>
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-1">Create Account</h2>
                        <p className="text-muted-foreground text-sm">Register to access the screening system</p>
                      </div>

                      {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                      )}

                      <form onSubmit={handleRegister} className="space-y-3">
                        <div className="space-y-1.5">
                          <label className="block text-sm font-medium text-foreground">Username</label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                              type="text"
                              value={formData.username}
                              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border/50 rounded-xl text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50 transition-all"
                              placeholder="Choose a username"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-sm font-medium text-foreground">Email</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border/50 rounded-xl text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50 transition-all"
                              placeholder="Enter your email"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-sm font-medium text-foreground">Mobile</label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                              type="tel"
                              value={formData.mobile}
                              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border/50 rounded-xl text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50 transition-all"
                              placeholder="+971 50 123 4567"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-sm font-medium text-foreground">Password</label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                              type={showPassword ? "text" : "password"}
                              value={formData.password}
                              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                              className="w-full pl-10 pr-10 py-3 bg-secondary/50 border border-border/50 rounded-xl text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50 transition-all"
                              placeholder="Create a password"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="relative w-full py-3.5 rounded-xl font-semibold text-white overflow-hidden group disabled:opacity-50 mt-2"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500"></div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                          <span className="relative flex items-center justify-center gap-2">
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Account"}
                          </span>
                        </button>
                      </form>

                      <div className="mt-6 pt-4 border-t border-border/50">
                        <p className="text-muted-foreground text-sm text-center mb-4">Or sign up with</p>
                        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
                          <GoogleLoginButton
                            onSuccess={(token) => {
                              router.push("/")
                            }}
                            onError={(error) => {
                              setError("Google registration failed. Please try again.")
                            }}
                            loading={loading}
                          />
                        </GoogleOAuthProvider>
                      </div>

                      <div className="mt-6 pt-6 border-t border-border/50 text-center">
                        <p className="text-muted-foreground text-sm">
                          Already have an account?{" "}
                          <button onClick={() => resetView("login")} className="text-amber-600 dark:text-amber-400 font-semibold">
                            Sign In
                          </button>
                        </p>
                      </div>
                    </>
                  )}

                  {/* Forgot Password View */}
                  {view === "forgotPassword" && (
                    <>
                      <div className="text-center mb-4">
                        <div className="relative inline-flex mb-4">
                          <div className="absolute -inset-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl blur-lg opacity-50"></div>
                          <div className="relative p-4 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-white shadow-xl">
                            <Lock className="h-8 w-8" />
                          </div>
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-1">Reset Password</h2>
                        <p className="text-muted-foreground text-sm">Enter your mobile to receive OTP</p>
                      </div>

                      {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                      )}

                      <form onSubmit={handleSendOtp} className="space-y-3">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-foreground">Mobile Number</label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <input
                              type="tel"
                              value={formData.mobile}
                              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                              className="w-full pl-12 pr-4 py-4 bg-secondary/50 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50 transition-all"
                              placeholder="Enter your mobile number"
                              required
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="relative w-full py-4 rounded-xl font-semibold text-white overflow-hidden group disabled:opacity-50"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500"></div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                          <span className="relative flex items-center justify-center gap-2">
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send OTP"}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => resetView("login")}
                          className="w-full flex items-center justify-center gap-2 py-3 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Back to Login
                        </button>
                      </form>
                    </>
                  )}

                  {/* Verify OTP View */}
                  {view === "verifyOtp" && (
                    <>
                      <div className="text-center mb-4">
                        <div className="relative inline-flex mb-4">
                          <div className="absolute -inset-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl blur-lg opacity-50"></div>
                          <div className="relative p-4 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-white shadow-xl">
                            <Shield className="h-8 w-8" />
                          </div>
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-1">Verify OTP</h2>
                        <p className="text-muted-foreground text-sm">Enter the code sent to your mobile</p>
                      </div>

                      {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                      )}

                      <form onSubmit={handleVerifyOtp} className="space-y-3">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-foreground">OTP Code</label>
                          <input
                            type="text"
                            value={formData.otp}
                            onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                            className="w-full px-4 py-4 bg-secondary/50 border border-border/50 rounded-xl text-foreground text-center text-2xl tracking-[0.5em] placeholder:text-muted-foreground placeholder:tracking-normal placeholder:text-base focus:outline-none focus:border-amber-500/50 transition-all"
                            placeholder="Enter OTP"
                            maxLength={6}
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="relative w-full py-4 rounded-xl font-semibold text-white overflow-hidden group disabled:opacity-50"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500"></div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                          <span className="relative flex items-center justify-center gap-2">
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify OTP"}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => resetView("forgotPassword")}
                          className="w-full flex items-center justify-center gap-2 py-3 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Back
                        </button>
                      </form>
                    </>
                  )}

                  {/* Reset Password View */}
                  {view === "resetPassword" && (
                    <>
                      <div className="text-center mb-4">
                        <div className="relative inline-flex mb-4">
                          <div className="absolute -inset-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl blur-lg opacity-50"></div>
                          <div className="relative p-4 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-white shadow-xl">
                            <Lock className="h-8 w-8" />
                          </div>
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-1">New Password</h2>
                        <p className="text-muted-foreground text-sm">Create your new password</p>
                      </div>

                      {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                      )}

                      <form onSubmit={handleResetPassword} className="space-y-3">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-foreground">New Password</label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <input
                              type={showPassword ? "text" : "password"}
                              value={formData.newPassword}
                              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                              className="w-full pl-12 pr-12 py-4 bg-secondary/50 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50 transition-all"
                              placeholder="Enter new password"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-foreground">Confirm Password</label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <input
                              type="password"
                              value={formData.confirmPassword}
                              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                              className="w-full pl-12 pr-4 py-4 bg-secondary/50 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50 transition-all"
                              placeholder="Confirm new password"
                              required
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="relative w-full py-4 rounded-xl font-semibold text-white overflow-hidden group disabled:opacity-50 mt-2"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500"></div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                          <span className="relative flex items-center justify-center gap-2">
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Reset Password"}
                          </span>
                        </button>
                      </form>
                    </>
                  )}
                </div>

                {/* Bottom accent */}
                <div className="h-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent"></div>
              </div>
            </div>

            {/* Mobile Features */}
            <div className="lg:hidden mt-8">
              <div className="grid grid-cols-2 gap-3">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      {feature.icon}
                    </div>
                    <span className="text-sm font-medium text-foreground">{feature.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 bg-background/60 backdrop-blur-xl py-5">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-amber-500" />
              <span>Third-party compliance tool - Not affiliated with United Nations</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="hover:text-foreground cursor-pointer transition-colors">Privacy</span>
              <span className="hover:text-foreground cursor-pointer transition-colors">Terms</span>
              <span className="hover:text-foreground cursor-pointer transition-colors">Contact</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
