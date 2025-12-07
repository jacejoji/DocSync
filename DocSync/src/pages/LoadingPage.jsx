import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope, Calendar, Users, ClipboardPlus } from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="w-full py-5 border-b backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center gap-4">
          <div className="flex gap-2 items-center">
            <Stethoscope className="h-6 w-6 text-primary" />
            <h1 className="font-bold text-xl">DocSync</h1>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/doctor/login">
              <Button variant="outline" size="sm">
                Doctor Login
              </Button>
            </Link>
            <Link to="/admin/login">
              <Button size="sm">Admin Login</Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center flex flex-col items-center gap-6">
        <h2 className="text-4xl font-bold tracking-tight">
          Manage Doctors, Appointments & Hospital Workflow Effortlessly
        </h2>

        <p className="max-w-2xl text-muted-foreground">
          A modern doctor management system designed to streamline hospital operations,
          automate appointment handling, track performance, and improve patient care.
        </p>

        <div className="flex gap-4 mt-4">
          <Link to="/admin/login">
            <Button size="lg">Get Started (Admin)</Button>
          </Link>
          <Link to="/doctor/login">
            <Button size="lg" variant="outline">
              Doctor Portal
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature Section */}
      <section className="max-w-6xl mx-auto px-6 pb-20 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <FeatureCard
          icon={<Calendar className="w-8 h-8 text-primary" />}
          title="Appointments"
          desc="Schedule, manage and optimize patient appointments."
        />
        <FeatureCard
          icon={<Users className="w-8 h-8 text-primary" />}
          title="Doctors & Staff"
          desc="Handle profiles, roles, departments, and permissions."
        />
        <FeatureCard
          icon={<ClipboardPlus className="w-8 h-8 text-primary" />}
          title="Reports"
          desc="View insights, activity logs, and performance records."
        />
        <FeatureCard
          icon={<Stethoscope className="w-8 h-8 text-primary" />}
          title="Medical Records"
          desc="Securely manage and access digital patient health files."
        />
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <Card className="p-4 shadow hover:shadow-lg transition">
      <CardHeader className="flex flex-col items-center">
        {icon}
        <CardTitle className="mt-4">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center text-muted-foreground text-sm">
        {desc}
      </CardContent>
    </Card>
  );
}
