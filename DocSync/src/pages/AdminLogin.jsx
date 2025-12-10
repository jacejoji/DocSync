import { Link } from "react-router-dom";
import {
  Stethoscope,
  ShieldCheck,
  ClipboardList,
  Hospital,
  Users,
  FileSpreadsheet,
} from "lucide-react";

import ThemeToggle from "@/components/theme/ThemeToggle";
import LoginForm from "@/components/auth/LoginForm";

export default function AdminLogin() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Stethoscope className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-base">Doc<span className="text-blue-600 dark:text-blue-400">Sync</span></span>
              <span className="text-[11px] text-muted-foreground">
                Admin Portal
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3 text-xs">
            <Link
              to="/"
              className="hidden sm:inline text-muted-foreground hover:text-foreground"
            >
              ← Home
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-5xl rounded-2xl border bg-background shadow-sm overflow-hidden grid md:grid-cols-2">
          {/* Left column */}
          <div className="hidden md:flex flex-col gap-6 bg-muted/60 px-8 py-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-primary">
                <ShieldCheck className="h-4 w-4" />
                <span>Admin access</span>
              </div>
              <h1 className="text-xl font-semibold tracking-tight">
                Your control center for DocSync.
              </h1>
              <p className="text-xs text-muted-foreground max-w-sm">
                Manage doctors, departments, appointments, HR workflows, and
                system configuration from one secure console.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <Feature icon={<Hospital className="h-4 w-4" />} label="Departments" />
              <Feature icon={<Users className="h-4 w-4" />} label="Doctor accounts" />
              <Feature icon={<ClipboardList className="h-4 w-4" />} label="Schedules" />
              <Feature icon={<FileSpreadsheet className="h-4 w-4" />} label="Payroll & HR" />
            </div>

            <p className="text-[11px] text-muted-foreground max-w-xs">
              Actions taken here are tied to audit logs, notifications, and your
              underlying HR & clinical data — keeping operations consistent and traceable.
            </p>
          </div>

          {/* Right column – login */}
          <div className="px-6 py-8 flex items-center justify-center">
            <div className="w-full max-w-sm space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">Admin Login</h2>
                <p className="text-xs text-muted-foreground">
                  Enter your administrator credentials to continue.
                </p>
              </div>
              <LoginForm
                roleLabel="Admin"
                subtitle="Enter your administrator credentials to continue."
            
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Feature({ icon, label }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-background/70 px-3 py-2">
      <span className="text-primary">{icon}</span>
      <span className="text-[11px]">{label}</span>
    </div>
  );
}
