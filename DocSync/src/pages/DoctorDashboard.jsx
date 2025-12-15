import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  Users,
  Activity,
  FileText,
  Briefcase,
  ChevronRight,
  TrendingUp,
  Stethoscope
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import LoadingPage from "./LoadingPage";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // --- State ---
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalPatients: 0,
    appointmentsToday: [],
    appointmentCount: 0,
    nextDuty: null,
    pendingReports: 5, 
    activityStats: []  
  });

  // --- Data Fetching ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.username) return;

      try {
        setIsLoading(true);

        // 1. Get Doctor Details
        const docRes = await api.get(`/doctor/email/${user.username}`);
        const doctorId = docRes.data.id;

        // 2. Parallel Fetching
        const [patientsRes, appointmentsRes, rosterRes] = await Promise.all([
          api.get("/api/patients"),
          api.get(`/appointments/doctor/${doctorId}/upcoming`),
          api.get(`/api/duty-rosters/doctor/${doctorId}`)
        ]);

        // --- Process Appointments ---
        const todayStr = new Date().toISOString().split('T')[0]; 
        
        const allUpcoming = appointmentsRes.data;
        const todaysAppts = allUpcoming.filter(app => 
            app.appointmentTime.startsWith(todayStr)
        ).sort((a, b) => new Date(a.appointmentTime) - new Date(b.appointmentTime));

        // --- Process Roster ---
        const sortedRoster = rosterRes.data
            .filter(r => r.dutyDate >= todayStr)
            .sort((a, b) => new Date(a.dutyDate) - new Date(b.dutyDate));
        
        const nextShift = sortedRoster.length > 0 ? sortedRoster[0] : null;

        // --- Mock Chart Data ---
        const chartMock = [
            { name: "Mon", total: 4 },
            { name: "Tue", total: 6 },
            { name: "Wed", total: 3 },
            { name: "Thu", total: 8 },
            { name: "Fri", total: todaysAppts.length > 0 ? todaysAppts.length : 5 },
            { name: "Sat", total: 2 },
        ];

        setDashboardData({
            totalPatients: patientsRes.data.length,
            appointmentsToday: todaysAppts,
            appointmentCount: allUpcoming.length,
            nextDuty: nextShift,
            pendingReports: 3, 
            activityStats: chartMock
        });

      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        // Add a small delay if you want to force the loading animation to play for at least 800ms
        // otherwise it might flicker too fast on local dev
        setTimeout(() => setIsLoading(false), 800);
      }
    };

    fetchDashboardData();
  }, [user]);

  // --- RENDER LOADING PAGE ---
  if (isLoading) {
    return <LoadingPage />;
  }

  // --- RENDER DASHBOARD ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-blue-950/20 animate-in fade-in duration-500">
      <main className="p-6 space-y-8 max-w-7xl mx-auto">
        
        {/* --- Header Section --- */}
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
              Dashboard
            </h2>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              Welcome back, <span className="font-semibold text-blue-600 dark:text-blue-400">Dr. {user?.username?.split("@")[0] || "Doctor"}</span>
              <Stethoscope className="h-4 w-4 text-blue-500" />
            </p>
          </div>
          <div className="flex gap-2">
             <Button 
                onClick={() => navigate("/doctor/roster")} 
                className="bg-white text-slate-700 border hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 shadow-sm"
             >
                <CalendarDays className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" /> View Roster
             </Button>
          </div>
        </div>

        {/* --- Stats Cards --- */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          
          {/* CARD 1: HERO CARD (Gradient Blue) */}
          <Card className="border-none shadow-md bg-gradient-to-br from-blue-600 to-indigo-600 text-white dark:from-blue-700 dark:to-indigo-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">Appointments Today</CardTitle>
              <div className="p-2 bg-white/20 rounded-full">
                <Clock className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dashboardData.appointmentsToday.length}</div>
              <p className="text-xs text-blue-100 mt-1">
                {dashboardData.appointmentCount} upcoming total
              </p>
            </CardContent>
          </Card>
          
          {/* CARD 2: Standard Styled */}
          <Card className="shadow-sm hover:shadow-md transition-shadow dark:bg-slate-900/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Patients</CardTitle>
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                 <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{dashboardData.totalPatients}</div>
              <p className="text-xs text-muted-foreground">Registered in system</p>
            </CardContent>
          </Card>
          
          {/* CARD 3: Next Shift */}
          <Card className="shadow-sm hover:shadow-md transition-shadow dark:bg-slate-900/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Next Shift</CardTitle>
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <Briefcase className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
            </CardHeader>
            <CardContent>
              {dashboardData.nextDuty ? (
                  <>
                    <div className="text-lg font-bold truncate text-slate-800 dark:text-slate-100">
                        {new Date(dashboardData.nextDuty.dutyDate).toLocaleDateString(undefined, {weekday: 'short', month: 'short', day: 'numeric'})}
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">
                        {dashboardData.nextDuty.shift} <span className="text-slate-300 mx-1">|</span> {dashboardData.nextDuty.dutyType}
                    </p>
                  </>
              ) : (
                  <div className="text-sm text-muted-foreground mt-1">No upcoming shifts</div>
              )}
            </CardContent>
          </Card>

          {/* CARD 4: Activity */}
          <Card className="shadow-sm hover:shadow-md transition-shadow dark:bg-slate-900/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Activity</CardTitle>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">+12%</div>
              <p className="text-xs text-muted-foreground">Patient volume vs last week</p>
            </CardContent>
          </Card>
        </div>

        {/* --- Main Content Split --- */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          
          {/* Left Column: Schedule (Span 4) */}
          <Card className="col-span-4 lg:col-span-4 flex flex-col shadow-md border-t-4 border-t-blue-500 dark:bg-slate-900/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-blue-500" /> Today's Schedule
              </CardTitle>
              <CardDescription>
                You have <span className="font-semibold text-blue-600 dark:text-blue-400">{dashboardData.appointmentsToday.length}</span> appointments scheduled.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                {dashboardData.appointmentsToday.length > 0 ? (
                    <ScrollArea className="h-[350px] pr-4">
                        <div className="space-y-4">
                            {dashboardData.appointmentsToday.map((apt) => (
                                <div key={apt.id} className="group flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-white hover:border-blue-200 hover:shadow-sm transition-all dark:bg-slate-900 dark:border-slate-800 dark:hover:border-blue-900">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-1 h-10 rounded-full ${
                                            apt.status === 'Confirmed' ? 'bg-blue-500' : 
                                            apt.status === 'Completed' ? 'bg-emerald-500' : 'bg-slate-300'
                                        }`} />
                                        
                                        <Avatar className="h-10 w-10 border border-blue-100">
                                            <AvatarFallback className="bg-blue-50 text-blue-600 font-bold text-sm dark:bg-blue-900 dark:text-blue-300">
                                                {apt.patient?.firstName?.[0]}{apt.patient?.lastName?.[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        
                                        <div className="space-y-1">
                                            <p className="text-sm font-semibold leading-none text-slate-800 dark:text-slate-100">
                                                {apt.patient?.firstName} {apt.patient?.lastName}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal text-muted-foreground border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700">
                                                    {apt.notes || "Routine"}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className="font-bold text-sm text-slate-700 dark:text-slate-200">
                                            {new Date(apt.appointmentTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </p>
                                        <span className={`text-[10px] font-medium ${
                                            apt.status === 'Confirmed' ? 'text-blue-600' : 
                                            apt.status === 'Completed' ? 'text-emerald-600' : 'text-slate-500'
                                        }`}>
                                            {apt.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                ) : (
                    <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground bg-slate-50/50 rounded-xl border border-dashed border-slate-200 dark:bg-slate-900/50 dark:border-slate-800">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-full mb-3 shadow-sm">
                            <CalendarDays className="h-8 w-8 text-blue-300" />
                        </div>
                        <p className="font-medium text-slate-600 dark:text-slate-400">No appointments today</p>
                        <p className="text-xs text-slate-400 mb-4">Enjoy your free time!</p>
                        <Button variant="outline" size="sm" onClick={() => navigate("/doctor/appointments")}>
                            Check upcoming days
                        </Button>
                    </div>
                )}
            </CardContent>
            <CardFooter className="border-t p-2 bg-slate-50/50 dark:bg-slate-900/30">
                <Button variant="ghost" className="w-full text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/50" onClick={() => navigate("/doctor/appointments")}>
                    View All Appointments <ChevronRight className="ml-1 h-3 w-3"/>
                </Button>
            </CardFooter>
          </Card>

          {/* Right Column: Analytics & Quick Actions (Span 3) */}
          <div className="col-span-3 lg:col-span-3 space-y-6">
              
             {/* Weekly Overview Chart */}
             <Card className="shadow-md dark:bg-slate-900/50">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-100 rounded-md dark:bg-indigo-900/30">
                            <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400"/> 
                        </div>
                        Patient Visits
                    </CardTitle>
                </CardHeader>
                <CardContent className="pl-0 pb-2">
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={dashboardData.activityStats}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-100 dark:stroke-slate-800" />
                            <XAxis 
                                dataKey="name" 
                                stroke="#94a3b8" 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false} 
                            />
                            <YAxis 
                                stroke="#94a3b8" 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false} 
                                tickFormatter={(value) => `${value}`} 
                            />
                            <Tooltip 
                                cursor={{fill: 'transparent'}}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                            />
                            <Bar 
                                dataKey="total" 
                                fill="currentColor" 
                                radius={[4, 4, 0, 0]} 
                                className="fill-blue-600 dark:fill-blue-500" 
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
             </Card>

             {/* Quick Actions */}
             <Card className="shadow-md dark:bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3">
                    <Button variant="outline" className="w-full justify-start h-12 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:hover:border-blue-800 transition-all" onClick={() => navigate("/doctor/appointments")}>
                        <Clock className="mr-3 h-4 w-4 text-blue-600" />
                        Schedule Appointment
                    </Button>
                    <Button variant="outline" className="w-full justify-start h-12 hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 dark:hover:border-emerald-800 transition-all" onClick={() => navigate("/doctor/patients")}>
                        <Users className="mr-3 h-4 w-4 text-emerald-600" />
                        Patient Directory
                    </Button>
                    <Button variant="outline" className="w-full justify-start h-12 hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 dark:hover:border-orange-800 transition-all" onClick={() => navigate("/doctor/roster")}>
                        <FileText className="mr-3 h-4 w-4 text-orange-600" />
                        My Duty Roster
                    </Button>
                </CardContent>
             </Card>
          </div>

        </div>
      </main>
    </div>
  );
}