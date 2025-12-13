import React, { useEffect, useState } from "react";
import {
  Clock,
  MoreHorizontal,
  Briefcase,
  LogIn,
  LogOut,
  History,
  PlayCircle,
  StopCircle,
  CalendarDays,
  Timer
} from "lucide-react";

import { useAuth } from "@/context/AuthContext"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import LoadingPage from "../LoadingPage"; 

import api from "@/lib/axios";

export default function TimeSheet() {
  const { user } = useAuth();
  
  // --- State ---
  const [isLoading, setIsLoading] = useState(true);
  const [currentDoctor, setCurrentDoctor] = useState(null);
  
  // Attendance State
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState("IDLE"); // IDLE, CHECKED_IN, COMPLETED
  const [currentTime, setCurrentTime] = useState(new Date());

  // Overtime State
  const [overtimeRecords, setOvertimeRecords] = useState([]);
  const [isOvertimeModalOpen, setIsOvertimeModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  // --- Live Clock ---
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Fetch Data ---
  const fetchData = async () => {
    if (!user?.username) return;
    setIsLoading(true);
    try {
      // 1. Fetch Doctor Profile
      const docRes = await api.get(`/doctor/email/${user.username}`);
      const doctorData = docRes.data;
      setCurrentDoctor(doctorData);

      // 2. Fetch Attendance History
      const attRes = await api.get(`/attendance/doctor/${doctorData.id}`);
      const history = attRes.data;
      
      // Sort by date desc
      const sortedHistory = history.sort((a, b) => new Date(b.date) - new Date(a.date));
      setAttendanceHistory(sortedHistory);

      // Determine Today's Status
      const todayStr = new Date().toISOString().split('T')[0];
      const todayEntry = sortedHistory.find(rec => rec.date === todayStr);
      
      setTodayRecord(todayEntry || null);
      
      if (todayEntry) {
        if (todayEntry.checkOut) {
            setAttendanceStatus("COMPLETED");
        } else {
            setAttendanceStatus("CHECKED_IN");
        }
      } else {
        setAttendanceStatus("IDLE");
      }

      // 3. Fetch Overtime Records
      const otRes = await api.get("/overtimerecord");
      setOvertimeRecords(otRes.data.filter(rec => rec.doctor?.id === doctorData.id));

    } catch (error) {
      console.error("Failed to fetch timesheet data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // --- Handlers: Attendance ---

  const handleCheckIn = async () => {
    if (!currentDoctor) return;
    try {
        const todayStr = new Date().toISOString().split('T')[0];
        const payload = {
            doctor: { id: currentDoctor.id },
            date: todayStr,
            status: "Present" // Default status
        };
        await api.post("/attendance/check-in", payload);
        fetchData(); // Refresh state
    } catch (err) {
        console.error("Check-in failed:", err);
        alert("Failed to check in. Please try again.");
    }
  };

  const handleCheckOut = async () => {
    if (!currentDoctor) return;
    try {
        await api.put(`/attendance/check-out/${currentDoctor.id}`);
        fetchData(); // Refresh state
    } catch (err) {
        console.error("Check-out failed:", err);
        alert("Failed to check out. Please try again.");
    }
  };

  // --- Handlers: Overtime ---

  const handleSubmitOvertime = async (e) => {
    e.preventDefault();
    if (!currentDoctor) return;

    try {
        const payload = {
            doctor: { id: currentDoctor.id },
            date: formData.date,
            hours: parseInt(formData.hours)
        };
        
        await api.post("/overtimerecord", payload);
        setIsOvertimeModalOpen(false);
        setFormData({});
        fetchData();
    } catch (err) {
        console.error("Failed to log overtime:", err);
    }
  };

  if (isLoading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-muted/20 dark:bg-neutral-950 p-6 space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Time Sheet & Attendance</h1>
        <p className="text-muted-foreground">
            Track your daily shift timings and log additional overtime hours.
        </p>
      </div>

      {/* --- Attendance Action Area --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. Main Action Card */}
        <Card className="md:col-span-2 border shadow-sm dark:bg-neutral-900/50 relative overflow-hidden">
            {/* Background decoration */}
            <div className={`absolute top-0 right-0 p-32 opacity-5 rounded-full blur-3xl -mr-16 -mt-16 transition-colors duration-500
                ${attendanceStatus === 'CHECKED_IN' ? 'bg-green-500' : attendanceStatus === 'COMPLETED' ? 'bg-orange-500' : 'bg-blue-500'}`} 
            />

            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Timer className="w-5 h-5 text-primary" />
                    Daily Attendance
                </CardTitle>
                <CardDescription>
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    {/* Live Clock Display */}
                    <div className="text-center sm:text-left">
                        <div className="text-5xl font-bold tracking-tighter font-mono text-foreground">
                            {currentTime.toLocaleTimeString('en-US', { hour12: false })}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 font-medium">Current Local Time</p>
                    </div>

                    {/* Status Badge */}
                    <div className="flex flex-col items-center sm:items-end gap-2">
                        <span className="text-sm font-medium text-muted-foreground">Current Status</span>
                        {attendanceStatus === 'IDLE' && (
                            <Badge variant="outline" className="text-lg py-1 px-4 border-slate-400 text-slate-500">
                                Not Checked In
                            </Badge>
                        )}
                        {attendanceStatus === 'CHECKED_IN' && (
                            <Badge variant="default" className="text-lg py-1 px-4 bg-green-600 hover:bg-green-700 animate-pulse">
                                On Duty
                            </Badge>
                        )}
                         {attendanceStatus === 'COMPLETED' && (
                            <Badge variant="secondary" className="text-lg py-1 px-4 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                                Shift Completed
                            </Badge>
                        )}
                    </div>
                </div>

                <Separator />

                {/* Actions */}
                <div className="flex items-center gap-4">
                    {attendanceStatus === 'IDLE' && (
                        <Button size="lg" onClick={handleCheckIn} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white shadow-md transition-all hover:scale-105">
                            <PlayCircle className="mr-2 h-5 w-5" /> Check In
                        </Button>
                    )}
                    
                    {attendanceStatus === 'CHECKED_IN' && (
                        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-4 items-center">
                            <Button size="lg" onClick={handleCheckOut} variant="destructive" className="w-full sm:w-auto shadow-md transition-all hover:scale-105">
                                <StopCircle className="mr-2 h-5 w-5" /> Check Out
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                Started at: <span className="font-mono font-bold text-foreground">{todayRecord?.checkIn?.substring(0,5)}</span>
                            </span>
                        </div>
                    )}

                    {attendanceStatus === 'COMPLETED' && (
                        <div className="flex flex-col sm:flex-row w-full gap-4 items-center justify-between">
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex flex-col">
                                    <span className="text-muted-foreground text-xs">Check In</span>
                                    <span className="font-mono font-bold">{todayRecord?.checkIn?.substring(0,5)}</span>
                                </div>
                                <div className="h-8 w-px bg-border"></div>
                                <div className="flex flex-col">
                                    <span className="text-muted-foreground text-xs">Check Out</span>
                                    <span className="font-mono font-bold">{todayRecord?.checkOut?.substring(0,5)}</span>
                                </div>
                            </div>
                            <Button variant="outline" disabled className="w-full sm:w-auto opacity-75 cursor-not-allowed">
                                Done for Today
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>

        {/* 2. Stats / Summary Card */}
        <Card className="flex flex-col justify-center dark:bg-neutral-900/50 shadow-sm">
             <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Work Summary</CardTitle>
             </CardHeader>
             <CardContent className="grid gap-4">
                <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 dark:bg-neutral-800/50">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                        <CalendarDays className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{attendanceHistory.length}</p>
                        <p className="text-xs text-muted-foreground">Days Worked</p>
                    </div>
                </div>
                 <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 dark:bg-neutral-800/50">
                    <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
                        <Clock className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{overtimeRecords.reduce((acc, curr) => acc + curr.hours, 0)}</p>
                        <p className="text-xs text-muted-foreground">Overtime Hours</p>
                    </div>
                </div>
             </CardContent>
        </Card>
      </div>

      {/* --- Data Tabs --- */}
      <Tabs defaultValue="attendance" className="w-full">
        <div className="flex items-center justify-between mb-4">
             <TabsList className="bg-muted dark:bg-neutral-900">
                <TabsTrigger value="attendance" className="gap-2"><History className="w-4 h-4"/> Attendance History</TabsTrigger>
                <TabsTrigger value="overtime" className="gap-2"><Briefcase className="w-4 h-4"/> Overtime Logs</TabsTrigger>
            </TabsList>
            
            {/* Only show "Log Overtime" button when Overtime tab is active? Or always? Let's keep it generally available or context specific. 
                For clean UX, let's keep it here but styled subtly. */}
             <Button variant="outline" size="sm" onClick={() => setIsOvertimeModalOpen(true)} className="hidden sm:flex">
                <Clock className="mr-2 h-3 w-3" /> Log Overtime
            </Button>
        </div>
       

        {/* Tab 1: Attendance History */}
        <TabsContent value="attendance">
            <Card className="dark:bg-neutral-900/50">
                <CardHeader>
                    <CardTitle>Attendance Records</CardTitle>
                    <CardDescription>History of your check-in and check-out timings.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Check In</TableHead>
                                <TableHead>Check Out</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {attendanceHistory.length > 0 ? attendanceHistory.map((record) => (
                                <TableRow key={record.id}>
                                    <TableCell className="font-medium">{record.date}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <LogIn className="w-3 h-3 text-green-500" />
                                            {record.checkIn ? record.checkIn.substring(0,5) : "--:--"}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <LogOut className="w-3 h-3 text-red-400" />
                                            {record.checkOut ? record.checkOut.substring(0,5) : "--:--"}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={record.checkOut ? "text-slate-500" : "text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20"}>
                                            {record.checkOut ? "Completed" : "Active"}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                        No attendance records found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>

        {/* Tab 2: Overtime Logs */}
        <TabsContent value="overtime">
            <Card className="dark:bg-neutral-900/50">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Overtime Log History</CardTitle>
                        <CardDescription>Extra hours submitted for payroll.</CardDescription>
                    </div>
                    {/* Mobile button variant */}
                    <Button size="sm" onClick={() => setIsOvertimeModalOpen(true)} className="sm:hidden">
                        <Clock className="mr-2 h-4 w-4" /> Log
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Hours Logged</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {overtimeRecords.length > 0 ? overtimeRecords.map((rec) => (
                                <TableRow key={rec.id}>
                                    <TableCell className="font-medium text-foreground">{rec.date}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="px-3 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
                                            +{rec.hours} hrs
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-green-600 border-green-200 dark:text-green-400 dark:border-green-900">Logged</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                        You haven't logged any overtime yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>

      {/* --- Add Overtime Modal --- */}
      {isOvertimeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <Card className="w-full max-w-md shadow-lg bg-background dark:bg-neutral-900 border dark:border-neutral-800">
                <CardHeader>
                    <CardTitle>Log My Overtime</CardTitle>
                    <CardDescription>Record extra hours for {currentDoctor?.firstName}.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmitOvertime}>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Input type="date" required onChange={(e) => setFormData({...formData, date: e.target.value})} className="dark:bg-neutral-950" />
                            </div>
                            <div className="space-y-2">
                                <Label>Hours</Label>
                                <Input type="number" min="1" max="24" required placeholder="e.g. 2" onChange={(e) => setFormData({...formData, hours: e.target.value})} className="dark:bg-neutral-950" />
                            </div>
                        </div>
                    </CardContent>
                    <div className="p-6 pt-0 flex justify-end gap-2">
                        <Button variant="outline" type="button" onClick={() => setIsOvertimeModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Submit Log</Button>
                    </div>
                </form>
            </Card>
        </div>
      )}
    </div>
  );
}