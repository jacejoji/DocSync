import { Link } from "react-router-dom";
import {
  Stethoscope,
  CalendarRange,
  Activity,
  Users,
  ShieldCheck,
  Hospital,
  Clock,
  TrendingUp,
  ArrowRight,
  ClipboardList,
  FileText,
  Wallet,
  HeartPulse,
  BriefcaseMedical,
  LayoutDashboard
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import LoadingPage from "./LoadingPage";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const { user, loading: authLoading } = useAuth(); // Get Auth Loading status
  const [showSplash, setShowSplash] = useState(true);

  // Effect: Force the splash screen to stay for at least 1.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500); // Adjust time as needed

    return () => clearTimeout(timer);
  }, []);

  // CONDITION: If Auth is still checking OR the timer hasn't finished, show loader
  if (authLoading || showSplash) {
    return <LoadingPage />;
  }

  // Helper to determine where the dashboard button leads
  const dashboardLink = user?.role === "ADMIN" ? "/admin/dashboard" : "/doctor/dashboard";
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* HEADER */}
      <header className="w-full border-b bg-background/70 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Stethoscope className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-base">Doc<span className="text-blue-600 dark:text-blue-400">Sync</span></span>
              <span className="text-[11px] text-muted-foreground">
                Doctor Management System
              </span>
            </div>
          </Link>

          {/* Nav + Actions */}
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
              <a href="#modules" className="hover:text-foreground">
                Modules
              </a>
              <a href="#workflow" className="hover:text-foreground">
                Workflow
              </a>
              <a href="#roles" className="hover:text-foreground">
                For Teams
              </a>
              <a href="#depth" className="hover:text-foreground">
                Data Depth
              </a>
               <ThemeToggle />
            </nav>

            <div className="flex items-center gap-2">
             
              {/* --- CONDITIONAL RENDERING --- */}
            {user ? (
              // Case A: User IS Logged In
              <Button asChild>
                <Link to={dashboardLink}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Link>
              </Button>
            ) : (
              // Case B: User is NOT Logged In
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link to="/admin/login">
                    <ShieldCheck className="mr-2 h-4 w-4 text-muted-foreground" />
                    Admin
                  </Link>
                </Button>
                <Button asChild>
                  <Link to="/doctor/login">
                    Doctor Login <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
            {/* ----------------------------- */}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1">
        {/* HERO */}
        <section className="border-b bg-gradient-to-b from-muted/60 to-background">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16 grid gap-10 md:grid-cols-2 items-center">
            {/* Left */}
            <div className="space-y-6">
              <Badge className="rounded-full px-3 py-1 text-xs w-fit">
                End-to-end doctor lifecycle · Appointments · HR · Insurance
              </Badge>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                One system to manage doctors, patients, HR, and compliance —
                in sync.
              </h1>

              <p className="text-sm md:text-base text-muted-foreground max-w-xl">
                DocSync is designed around the real structure of your hospital:
                doctors, patients, schedules, payroll, training, grievances,
                insurance, and appointments. No more jumping between tools or
                spreadsheets to understand your workforce and patient load.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link to="/admin/login">
                  <Button size="lg" className="gap-2">
                    Get Started as Admin
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/doctor/login">
                  <Button size="lg" variant="outline">
                    Doctor Portal
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap gap-6 pt-2 text-xs md:text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span>Role-based access across modules</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <span>Built over structured HR & clinical data</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Reduce coordination time across teams</span>
                </div>
              </div>
            </div>

            {/* Right: Overview Card */}
            <div className="flex justify-center md:justify-end">
              <Card className="w-full max-w-md shadow-xl border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between gap-2 text-base">
                    <span>Operational snapshot</span>
                    <Badge variant="outline" className="text-[11px]">
                      From live data
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3 text-center text-xs">
                    <StatItem
                      label="Active doctors"
                      value="120"
                      icon={<Users className="h-4 w-4 text-primary" />}
                    />
                    <StatItem
                      label="Today&apos;s appointments"
                      value="342"
                      icon={<CalendarRange className="h-4 w-4 text-primary" />}
                    />
                    <StatItem
                      label="Open grievances"
                      value="3"
                      icon={<ClipboardList className="h-4 w-4 text-primary" />}
                    />
                  </div>

                  <Separator />

                  {/* Streams */}
                  <div className="space-y-2 text-xs">
                    <p className="font-medium text-foreground flex items-center gap-2">
                      <HeartPulse className="h-4 w-4 text-primary" />
                      Care & operations at a glance
                    </p>
                    <div className="space-y-2">
                      <MiniStatusRow
                        label="OPD & follow-up appointments"
                        value="198 scheduled"
                        accent="bg-emerald-500/70"
                      />
                      <MiniStatusRow
                        label="Insurance claims in review"
                        value="27 in queue"
                        accent="bg-amber-500/70"
                      />
                      <MiniStatusRow
                        label="Pending leave & shift requests"
                        value="11 open"
                        accent="bg-rose-500/70"
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Small performance hint */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span>Better visibility across HR & clinical data</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px]">
                      View admin console
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* MODULES (mapped to your schema) */}
        <section id="modules" className="border-b">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16 space-y-6">
            <SectionHeader
              label="Core modules"
              title="Modeled directly on your hospital’s data"
              subtitle="DocSync mirrors how your data is stored — departments, doctors, patients, HR, insurance, equipment, and more — so workflows match reality."
            />

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              <FeatureCard
                icon={<BriefcaseMedical className="h-6 w-6 text-primary" />}
                title="Doctor lifecycle"
                desc="From hiring and profiles to equipment, training, promotions, payroll, and even resignation requests — all linked to each doctor."
                extra="doctors, doctor_profiles, doctor_documents, salary_records, payroll, promotions, training_periods, doctor_training_status, resignation_requests"
              />
              <FeatureCard
                icon={<HeartPulse className="h-6 w-6 text-primary" />}
                title="Patient & appointments"
                desc="Maintain a clean patient registry with appointments, clinical notes, insurance, and claims connected to a single patient."
                extra="patients, appointments, patient_records, patient_insurance_policies, insurance_claims"
              />
              <FeatureCard
                icon={<Wallet className="h-6 w-6 text-primary" />}
                title="Insurance & finance"
                desc="Track provider contracts, doctor and patient policies, claims, co-pays, and salary payouts in one place."
                extra="insurance_providers, doctor_insurance_policies, patient_insurance_policies, payroll"
              />
              <FeatureCard
                icon={<Hospital className="h-6 w-6 text-primary" />}
                title="HR, shifts & compliance"
                desc="Duty rosters, schedules, overtime, leave, attendance, training, grievances — all captured with an audit trail."
                extra="schedules, duty_rosters, attendance_records, overtime_records, leave_requests, paid_leaves, compliance_training, grievance_tickets"
              />
            </div>
          </div>
        </section>

        {/* WORKFLOW */}
        <section id="workflow" className="border-b bg-muted/40">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16 space-y-8">
            <SectionHeader
              label="Daily flow"
              title="How DocSync supports a full day in your hospital"
              subtitle="From a new doctor application to salary processing, DocSync follows the same journey your data does."
            />

            <div className="grid md:grid-cols-3 gap-5">
              <WorkflowCard
                step="1"
                title="Staffing & scheduling"
                desc="Create schedules and duty rosters from real doctor availability and training periods. Link them to departments and medical camps."
                extra="schedules, duty_rosters, medical_camps, doctor_camp_assignments"
              />
              <WorkflowCard
                step="2"
                title="Appointments & care"
                desc="Book appointments, capture diagnoses and treatment, and automatically connect insurance policies and claims where required."
                extra="appointments, patient_records, patient_insurance_policies, insurance_claims"
              />
              <WorkflowCard
                step="3"
                title="HR, payroll & governance"
                desc="Handle leave, overtime, payroll, grievances, and performance reviews with a full audit trail of who did what and when."
                extra="leave_requests, overtime_records, payroll, performance_reviews, grievance_tickets, audit_logs"
              />
            </div>
          </div>
        </section>

        {/* ROLE-FOCUSED TABS */}
        <section id="roles" className="border-b">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16 space-y-6">
            <SectionHeader
              label="For your teams"
              title="Tailored views for admins, doctors, HR, and finance"
              subtitle="Everyone works on the same underlying data but sees the slice that matters to them."
            />

            <Tabs defaultValue="admin" className="w-full">
              <TabsList className="grid grid-cols-3 md:w-auto w-full">
                <TabsTrigger value="admin">Admin</TabsTrigger>
                <TabsTrigger value="doctor">Doctors</TabsTrigger>
                <TabsTrigger value="hr">HR & Finance</TabsTrigger>
              </TabsList>

              <TabsContent value="admin" className="mt-4">
                <RoleTabCard
                  tag="Hospital Administration"
                  title="A complete view of departments, doctors, and operations"
                  bullets={[
                    "Configure departments, hiring workflows, and new doctor applications.",
                    "Assign doctors to departments, equipment, and duty rosters.",
                    "Monitor grievances, resignations, escalations, and compliance status.",
                  ]}
                  primaryText="Admin Login"
                  primaryTo="/admin/login"
                />
              </TabsContent>

              <TabsContent value="doctor" className="mt-4">
                <RoleTabCard
                  tag="Doctors"
                  title="A clean, focused workspace for every doctor"
                  bullets={[
                    "See your schedule, duty roster, and upcoming appointments.",
                    "Access relevant patient records and visit history quickly.",
                    "Track your training, performance reviews, and assigned tasks.",
                  ]}
                  primaryText="Doctor Login"
                  primaryTo="/doctor/login"
                />
              </TabsContent>

              <TabsContent value="hr" className="mt-4">
                <RoleTabCard
                  tag="HR & Finance"
                  title="From attendance to payroll, all in one system"
                  bullets={[
                    "Track attendance, overtime, leave, and shift changes per doctor.",
                    "Plan salary hikes, process payroll, and manage deductions.",
                    "Ensure compliance training is completed and properly logged.",
                  ]}
                  primaryText="Access via Admin Console"
                  primaryTo="/admin/login"
                />
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* DATA DEPTH SECTION */}
        <section id="depth" className="border-b bg-muted/30">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16 space-y-10">
            <SectionHeader
              label="Data depth"
              title="Not just a UI — DocSync reflects a full relational model"
              subtitle="Built for systems where departments, training, insurance, schedules, grievances, and payroll have to work together cleanly."
            />

            <div className="grid gap-6 lg:grid-cols-[2fr,1.2fr]">
              {/* Left: grouped entities */}
              <div className="grid sm:grid-cols-2 gap-4 text-xs text-muted-foreground">
                <EntityGroup
                  title="Master data"
                  items={[
                    "departments",
                    "equipment",
                    "insurance_providers",
                    "compliance_training",
                    "medical_camps",
                    "new_applications",
                  ]}
                />
                <EntityGroup
                  title="Patients & clinical"
                  items={[
                    "patients",
                    "patient_insurance_policies",
                    "appointments",
                    "patient_records",
                    "insurance_claims",
                  ]}
                />
                <EntityGroup
                  title="Doctors & org"
                  items={[
                    "doctors",
                    "doctor_profiles",
                    "doctor_documents",
                    "doctor_equipment",
                    "org_chart",
                    "emergency_contacts",
                    "doctor_camp_assignments",
                  ]}
                />
                <EntityGroup
                  title="HR, payroll & grievances"
                  items={[
                    "schedules",
                    "duty_rosters",
                    "attendance_records",
                    "overtime_records",
                    "leave_requests",
                    "paid_leaves",
                    "salary_records",
                    "payroll",
                    "performance_reviews",
                    "grievance_tickets",
                    "grievance_responses",
                    "resignation_requests",
                    "task_assignments",
                    "training_periods",
                    "doctor_training_status",
                  ]}
                />
              </div>

              {/* Right: summary card */}
              <Card className="h-full flex flex-col justify-between shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
                    Why this matters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <p className="text-xs text-muted-foreground">
                    DocSync sits on top of a structured relational schema — which
                    means reports, dashboards, and automations can grow with your
                    hospital without breaking.
                  </p>
                  <ul className="space-y-2 text-xs">
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>
                        Easy to extend: new modules plug into existing doctor & patient records.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
                      <span>
                        Clean separation between master data, clinical, HR, and finance.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
                      <span>
                        Audit logs and notifications keep critical actions traceable.
                      </span>
                    </li>
                  </ul>
                  <Separator className="my-2" />
                  <p className="text-[11px] text-muted-foreground">
                    Use DocSync as the operational layer that sits between your
                    database and your teams — not just a basic appointment tool.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="bg-background">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-14">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="flex flex-col md:flex-row items-center justify-between gap-6 py-8">
                <div className="space-y-2 text-center md:text-left">
                  <p className="text-xs uppercase tracking-[0.2em] text-primary">
                    Ready to operationalize your schema?
                  </p>
                  <h3 className="text-xl md:text-2xl font-semibold">
                    Turn your database into a clean, usable system for your team.
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xl">
                    DocSync already understands doctors, patients, payroll,
                    training, claims, and grievances. All that&apos;s left is to
                    connect it to your Spring Boot APIs and go live.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-center">
                  <Link to="/admin/login" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto gap-2">
                      Admin Login
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/doctor/login" className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full sm:w-auto">
                      Doctor Login
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t text-xs text-muted-foreground">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-3.5 w-3.5" />
            <span>DocSync · Doctor Management System</span>
          </div>
          <div className="flex flex-wrap gap-4">
            <span>Backed by a full doctor, patient, HR & insurance team</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* Helper subcomponents */

function StatItem({ label, value, icon }) {
  return (
    <div className="rounded-lg border bg-background/60 px-2.5 py-2 flex flex-col items-center gap-1">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

function MiniStatusRow({ label, value, accent }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className={`h-2 w-2 rounded-full ${accent}`} />
        <span>{label}</span>
      </div>
      <span className="text-[11px] font-medium text-foreground">{value}</span>
    </div>
  );
}

function SectionHeader({ label, title, subtitle }) {
  return (
    <div className="space-y-2 max-w-3xl">
      {label && (
        <p className="text-[11px] uppercase tracking-[0.2em] text-primary">
          {label}
        </p>
      )}
      <h2 className="text-xl md:text-2xl font-semibold">{title}</h2>
      {subtitle && (
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}

function FeatureCard({ icon, title, desc, extra }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
            {icon}
          </div>
          <CardTitle className="text-sm">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="text-xs text-muted-foreground space-y-2">
        <p>{desc}</p>
        {extra && (
          <p className="text-[11px]">
            <span className="font-semibold">Backed by:</span> {extra}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function WorkflowCard({ step, title, desc, extra }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="rounded-full text-[11px]">
            Step {step}
          </Badge>
        </div>
        <CardTitle className="text-sm mt-2">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-xs text-muted-foreground space-y-2">
        <p>{desc}</p>
        {extra && (
          <p className="text-[11px]">
            <span className="font-semibold">Key tables:</span> {extra}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function RoleTabCard({ tag, title, bullets, primaryText, primaryTo }) {
  return (
    <Card className="border-border/70">
      <CardHeader className="space-y-2">
        <Badge variant="outline" className="w-fit text-[11px]">
          {tag}
        </Badge>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-xs">
        <ul className="space-y-2 list-disc list-inside text-muted-foreground">
          {bullets.map((b, idx) => (
            <li key={idx}>{b}</li>
          ))}
        </ul>
        <div className="pt-1">
          <Link to={primaryTo}>
            <Button size="sm" className="gap-1">
              {primaryText}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function EntityGroup({ title, items }) {
  return (
    <div className="border rounded-lg p-3 bg-background/60">
      <p className="text-[11px] font-semibold mb-1.5">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span
            key={item}
            className="px-2 py-0.5 rounded-full bg-muted text-[11px]"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
