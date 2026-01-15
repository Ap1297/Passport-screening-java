export default function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto max-w-6xl px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Passport Screening System</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Advanced identity verification against international sanctions lists
            </p>
          </div>
          <div className="rounded-lg bg-primary/10 px-4 py-2">
            <p className="text-xs font-medium text-primary">OCR Enabled</p>
          </div>
        </div>
      </div>
    </header>
  )
}
