"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ShieldCheck, LogOut, User, Globe } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"

interface UserData {
  username: string
  email: string
  role: string
}

export default function Header() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  return (
    <header className="relative border-b border-border bg-background/90 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto max-w-6xl px-4 py-4 relative z-10">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/20">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-gold-text">SanctionScreen Pro</h1>
              <p className="text-xs text-muted-foreground">Third-Party Sanctions Compliance Tool</p>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* System Status */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="status-dot status-active"></div>
              <span className="text-xs font-medium text-green-600 dark:text-green-400">System Online</span>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Language */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary border border-border text-muted-foreground">
              <Globe className="h-4 w-4" />
              <span className="text-xs font-medium">EN</span>
            </div>

            {user && (
              <>
                {/* User Info */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary border border-border">
                  <User className="h-4 w-4 text-foreground" />
                  <span className="text-sm font-medium text-foreground hidden sm:inline">{user.username}</span>
                </div>
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/20 hover:border-red-500/30 transition-all duration-300"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm font-medium hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
