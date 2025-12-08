import { useAuth } from "@/context/AuthContext";
import {
  CalendarDays,
  Clock,
  Users,
  Activity,
  FileText,
  Search,
  Bell,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import DoctorNavbar from "@/components/layout/DoctorNavbar";
import { useEffect, useState } from "react";
import LoadingPage from "./LoadingPage";

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true); // <--- 3. Loading State

  // 4. Simulate Data Fetching Effect
  useEffect(() => {
    // In the future, this is where you would await fetch("http://.../appointments")
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Show loader for 2 seconds

    return () => clearTimeout(timer);
  }, []);

  // 5. Render Loading Screen if active
  if (isLoading) {
    return <LoadingPage />;
  }

  // Mock Data
  const appointments = [
    {
      id: 1,
      patient: "Sarah Connor",
      time: "09:00 AM",
      type: "Check-up",
      status: "Confirmed",
      initials: "SC",
    },
    {
      id: 2,
      patient: "Bruce Wayne",
      time: "10:30 AM",
      type: "Follow-up",
      status: "Pending",
      initials: "BW",
    },
    {
      id: 3,
      patient: "Clark Kent",
      time: "11:15 AM",
      type: "Consultation",
      status: "Confirmed",
      initials: "CK",
    },
  ];

  return (
    <div className="min-h-screen bg-muted/20">
      {/* NAVBAR */}
      <DoctorNavbar />

      <main className="p-6 space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">
              Welcome back, Dr. {user?.username?.split("@")[0] || "User"}. Here is your daily overview.
            </p>
          </div>
          <div className="flex gap-2">
             <Button>
                <CalendarDays className="mr-2 h-4 w-4" /> View Schedule
             </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Appointments</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">4 remaining today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+2,350</div>
              <p className="text-xs text-muted-foreground">+180 from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">Requires review</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activity</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+573</div>
              <p className="text-xs text-muted-foreground">+201 since last hour</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Split */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          
          {/* Upcoming Schedule */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>
                You have {appointments.length} appointments scheduled for today.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {appointments.map((apt) => (
                  <div key={apt.id} className="flex items-center">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{apt.initials}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{apt.patient}</p>
                      <p className="text-sm text-muted-foreground">{apt.type}</p>
                    </div>
                    <div className="ml-auto font-medium text-sm flex items-center gap-4">
                        <span>{apt.time}</span>
                        <Badge variant={apt.status === "Confirmed" ? "default" : "secondary"}>
                            {apt.status}
                        </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions / Recent Activity */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks you perform daily.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    Register New Patient
                </Button>
                <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Create Medical Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Request Time Off
                </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}