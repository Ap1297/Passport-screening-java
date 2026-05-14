"use client"

import { Shield, CheckCircle2, Database, Globe, ExternalLink, BadgeCheck, Lock, FileCheck } from "lucide-react"

export default function LegitimacyBanner() {
  const trustPoints = [
    {
      icon: <Database className="h-5 w-5" />,
      title: "Official UN Data Source",
      description: "Data validated directly from UN Security Council Consolidated List published by United Nations",
      highlight: true,
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "International Compliance",
      description: "Aligned with UN Security Council resolutions for global sanctions compliance screening",
      highlight: false,
    },
    {
      icon: <Lock className="h-5 w-5" />,
      title: "Secure Processing",
      description: "End-to-end encrypted document handling with no data retention policy",
      highlight: false,
    },
    {
      icon: <FileCheck className="h-5 w-5" />,
      title: "Audit Ready",
      description: "Comprehensive screening reports for regulatory audit requirements",
      highlight: false,
    },
  ]

  return (
    <div className="mb-4">
      {/* Main Legitimacy Header */}
      <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-4 mb-3 legitimacy-glow">
        <div className="absolute inset-0 bg-grid-pattern opacity-50"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          {/* Animated Shield Icon */}
          <div className="relative">
            <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 pulse-ring">
              <BadgeCheck className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <span className="badge-success verified-badge">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                VERIFIED DATA SOURCE
              </span>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Third-Party Tool Powered by Official UN Security Council Data</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              SanctionScreen Pro is an independent third-party compliance tool that validates identity data against the 
              <a 
                href="https://main.un.org/securitycouncil/en/content/un-sc-consolidated-list" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-foreground hover:underline font-semibold mx-1 underline-offset-2 transition-colors"
              >
                UN SC Consolidated List
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
              published by the United Nations Security Council official website.
            </p>
          </div>
          
          {/* Data Source Badge */}
          <div className="hidden lg:block">
            <a 
              href="https://main.un.org/securitycouncil/en/content/un-sc-consolidated-list" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary border border-border hover:border-foreground/20 transition-all duration-300 group"
            >
              <Globe className="h-5 w-5 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <p className="text-xs text-muted-foreground">Data Source</p>
                <p className="text-sm font-semibold text-foreground">un.org</p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </a>
          </div>
        </div>
      </div>

      {/* Trust Points Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {trustPoints.map((point, idx) => (
          <div 
            key={idx} 
            className={`relative p-4 rounded-xl border transition-all duration-300 group hover:scale-[1.02] ${
              point.highlight 
                ? "bg-amber-500/5 border-amber-500/20 highlight-card" 
                : "bg-card border-border hover:border-amber-500/30"
            }`}
          >
            {point.highlight && (
              <div className="absolute -top-2 -right-2">
                <span className="flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
                </span>
              </div>
            )}
            <div className={`p-2 rounded-lg w-fit mb-3 ${
              point.highlight 
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" 
                : "bg-secondary text-muted-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:bg-amber-500/10"
            } transition-all duration-300`}>
              {point.icon}
            </div>
            <h4 className={`text-sm font-semibold mb-1 ${point.highlight ? "text-foreground" : "text-foreground"}`}>
              {point.title}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">{point.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
