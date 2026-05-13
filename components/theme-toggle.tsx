"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-lg bg-secondary border border-border" />
    )
  }

  const isDark = resolvedTheme === "dark"

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <button
      onClick={handleToggle}
      className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-secondary border border-border text-foreground hover:bg-accent transition-all duration-300"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <Sun className={`h-4 w-4 absolute transition-all duration-300 ${isDark ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"}`} />
      <Moon className={`h-4 w-4 absolute transition-all duration-300 ${isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"}`} />
    </button>
  )
}
