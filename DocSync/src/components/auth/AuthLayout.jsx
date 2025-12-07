import { Link } from "react-router-dom";
import { Stethoscope } from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { Badge } from "@/components/ui/badge";

export default function AuthLayout({
  title,
  subtitle,
  highlight,
  children,
  stats = [],
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top bar */}
      <header className="w-full border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Stethoscope className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-base">DocSync</span>
              <span className="text-[11px] text-muted-foreground">
                Doctor Management System
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3 text-xs">
            <Link
              to="/"
              className="hidden sm:inline text-muted-foreground hover:text-foreground"
            >
              ← Back to homepage
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12 grid gap-10 md:grid-cols-[1.1fr,1fr] items-center">
          {/* Left: context panel */}
          <div className="space-y-6">
            {highlight && (
              <Badge className="rounded-full px-3 py-1 text-xs">
                {highlight}
              </Badge>
            )}

            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                {title}
              </h1>
              <p className="text-sm text-muted-foreground max-w-xl">
                {subtitle}
              </p>
            </div>

            {stats.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-3 text-xs">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-lg border bg-background/70 px-3 py-2 space-y-1"
                  >
                    <p className="text-[11px] text-muted-foreground">
                      {s.label}
                    </p>
                    <p className="text-sm font-semibold">{s.value}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-1 text-[11px] text-muted-foreground">
              <p>
                DocSync connects logins to real doctor records, schedules,
                appointments, and HR data — not just a flat user table.
              </p>
              <p>
                Actions from this portal are recorded in audit logs and can
                trigger notifications for your team.
              </p>
            </div>
          </div>

          {/* Right: form slot */}
          <div className="flex justify-center">{children}</div>
        </div>
      </main>
    </div>
  );
}
