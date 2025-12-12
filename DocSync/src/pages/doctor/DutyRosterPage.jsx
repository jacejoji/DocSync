/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Moon,
  Sun,
  Sunset,
  MoreHorizontal
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import { useAuth } from "@/context/AuthContext"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import LoadingPage from "../LoadingPage";

// IMPORT CUSTOM AXIOS
import api from "@/lib/axios"; // Adjust path if necessary

// --- Constants ---
const SHIFT_COLORS = {
  Morning: "#f59e0b",
  Evening: "#f97316",
  Night: "#8b5cf6",
};

const getMonthDays = (year, month) => {
  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

export default function DoctorDutyRoster() {
  const { user } = useAuth(); 
  
  // --- State ---
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("roster");
  
  // Data
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [rosters, setRosters] = useState([]);
  const [overtimeRecords, setOvertimeRecords] = useState([]);
  
  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Modal State
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [isOvertimeModalOpen, setIsOvertimeModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  // --- Fetch Data (Using Axios) ---
  const fetchData = async () => {
    if (!user?.username) return;
    setIsLoading(true);
    try {
      // 1. Fetch Doctor Profile
      const docRes = await api.get(`/doctor/email/${user.username}`);
      const doctorData = docRes.data;
      setCurrentDoctor(doctorData);

      // 2. Fetch Rosters
      const rosterRes = await api.get("/api/duty-rosters");
      setRosters(rosterRes.data);

      // 3. Fetch Overtime
      const otRes = await api.get("/overtimerecord");
      // Filter strictly for this doctor
      setOvertimeRecords(otRes.data.filter(rec => rec.doctor?.id === doctorData.id));

    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // --- Handlers ---
  const handleMonthChange = (offset) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    setCurrentDate(newDate);
  };

  const handleSubmitRoster = async (e) => {
    e.preventDefault();
    if (!currentDoctor) return;

    try {
        const payload = {
            doctor: { id: currentDoctor.id },
            dutyDate: formData.date,
            shift: formData.shift,
            dutyType: formData.dutyType || "Regular"
        };
        
        // Axios POST
        await api.post("/api/duty-rosters", payload);

        // On success:
        setIsRosterModalOpen(false);
        setFormData({});
        fetchData();
    } catch (err) {
        console.error("Failed to post roster:", err);
    }
  };

  const handleSubmitOvertime = async (e) => {
    e.preventDefault();
    if (!currentDoctor) return;

    try {
        const payload = {
            doctor: { id: currentDoctor.id },
            date: formData.date,
            hours: parseInt(formData.hours)
        };
        
        // Axios POST
        await api.post("/overtimerecord", payload);

        // On success:
        setIsOvertimeModalOpen(false);
        setFormData({});
        fetchData();
    } catch (err) {
        console.error("Failed to log overtime:", err);
    }
  };

  // --- Derived Data ---
  const monthDays = useMemo(() => 
    getMonthDays(currentDate.getFullYear(), currentDate.getMonth()), 
  [currentDate]);

  const stats = useMemo(() => {
    // FIX: Use string comparison for dates to avoid Timezone issues
    // 'en-CA' locale consistently gives YYYY-MM-DD format
    const todayStr = new Date().toLocaleDateString("en-CA");
    
    const myUpcoming = rosters
        .filter(r => {
            // Check if it belongs to current doctor AND date is today or future
            return r.doctor?.id === currentDoctor?.id && r.dutyDate >= todayStr;
        })
        .sort((a,b) => a.dutyDate.localeCompare(b.dutyDate)) // String sort is safe for ISO dates
        .slice(0, 5);

    const shiftCounts = { Morning: 0, Evening: 0, Night: 0 };
    rosters
        .filter(r => r.doctor?.id === currentDoctor?.id)
        .forEach(r => {
            if (shiftCounts[r.shift] !== undefined) shiftCounts[r.shift]++;
        });
    const pieData = Object.keys(shiftCounts).map(k => ({ name: k, value: shiftCounts[k] }));

    return { myUpcoming, pieData };
  }, [rosters, currentDoctor]);

  if (isLoading) return <LoadingPage />;

  return (
    // Neutral-950 background for deep black/gray feel
    <div className="min-h-screen bg-muted/20 dark:bg-neutral-950 p-6 space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Schedule</h1>
          <p className="text-muted-foreground">
              Welcome, Dr. {currentDoctor?.lastName}. Manage your shifts and overtime.
          </p>
        </div>
        
        {/* Toggle Switch */}
        <div className="flex bg-muted dark:bg-neutral-900 p-1 rounded-lg border dark:border-neutral-800">
            <button 
                onClick={() => setActiveTab("roster")}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    activeTab === "roster" 
                    ? "bg-background shadow-sm text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
            >
                Calendar
            </button>
            <button 
                onClick={() => setActiveTab("overtime")}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    activeTab === "overtime" 
                    ? "bg-background shadow-sm text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
            >
                My Overtime
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Main View */}
        <div className="lg:col-span-3 space-y-6">
            
            {/* Roster View */}
            {activeTab === "roster" && (
                <Card className="h-full border-none shadow-sm dark:bg-neutral-900/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <div className="flex items-center gap-4">
                            <CardTitle className="text-xl">
                                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </CardTitle>
                            <div className="flex items-center border rounded-md bg-background dark:bg-neutral-900 dark:border-neutral-800">
                                <Button variant="ghost" size="icon" onClick={() => handleMonthChange(-1)}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div className="w-px h-4 bg-border" />
                                <Button variant="ghost" size="icon" onClick={() => handleMonthChange(1)}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <Button onClick={() => setIsRosterModalOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Request Shift
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {/* Grid: Neutral borders and backgrounds */}
                        <div className="grid grid-cols-7 gap-px bg-muted dark:bg-neutral-800 rounded-lg overflow-hidden border dark:border-neutral-800">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="bg-muted/50 dark:bg-neutral-900 p-2 text-center text-xs font-semibold text-muted-foreground">
                                    {day}
                                </div>
                            ))}
                            {monthDays.map((date, i) => {
                                // FIX: Use local date string (YYYY-MM-DD) instead of ISO string (which converts to UTC)
                                const dateKey = date.toLocaleDateString("en-CA"); 
                                const daysRosters = rosters.filter(r => r.dutyDate === dateKey);
                                const isMyShift = daysRosters.some(r => r.doctor?.id === currentDoctor?.id);

                                return (
                                    <div 
                                        key={i} 
                                        className={`
                                            min-h-[120px] p-2 transition-colors group relative
                                            ${isMyShift 
                                                ? "bg-blue-50/30 dark:bg-blue-900/10" 
                                                : "bg-card dark:bg-neutral-950 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                                            }
                                        `}
                                    >
                                        <span className={`text-sm font-medium ${date.toDateString() === new Date().toDateString() ? "bg-primary text-primary-foreground w-6 h-6 flex items-center justify-center rounded-full" : "text-muted-foreground"}`}>
                                            {date.getDate()}
                                        </span>
                                        
                                        <div className="mt-2 space-y-1">
                                            {daysRosters.map(roster => {
                                                const isMe = roster.doctor?.id === currentDoctor?.id;
                                                return (
                                                    <div 
                                                        key={roster.id} 
                                                        className={`
                                                            text-xs p-1.5 rounded border border-l-4 truncate flex items-center gap-1 shadow-sm 
                                                            dark:bg-neutral-900 dark:border-neutral-800
                                                            ${isMe ? "font-bold ring-1 ring-primary/20" : "opacity-80"}
                                                        `}
                                                        style={{ borderLeftColor: SHIFT_COLORS[roster.shift] || '#ccc' }}
                                                    >
                                                        {roster.shift === "Morning" && <Sun className="w-3 h-3 text-amber-500" />}
                                                        {roster.shift === "Evening" && <Sunset className="w-3 h-3 text-orange-500" />}
                                                        {roster.shift === "Night" && <Moon className="w-3 h-3 text-violet-500" />}
                                                        
                                                        {/* Neutral text color */}
                                                        <span className="text-gray-700 dark:text-neutral-300">
                                                            {isMe ? "Me" : roster.doctor?.lastName}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Overtime View */}
            {activeTab === "overtime" && (
                <Card className="dark:bg-neutral-900/50">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>My Overtime Log</CardTitle>
                            <CardDescription>Your personal history of extra hours worked.</CardDescription>
                        </div>
                        <Button onClick={() => setIsOvertimeModalOpen(true)}>
                            <Clock className="mr-2 h-4 w-4" /> Log New Entry
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
                                {overtimeRecords.map((rec) => (
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
                                ))}
                                {overtimeRecords.length === 0 && (
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
            )}
        </div>

        {/* Right Column: Personal Stats */}
        <div className="space-y-6">
            
            {/* My Shift Distribution */}
            <Card className="dark:bg-neutral-900/50">
                <CardHeader>
                    <CardTitle className="text-sm font-medium">My Shift Balance</CardTitle>
                </CardHeader>
                <CardContent className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={stats.pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={75}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {stats.pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={SHIFT_COLORS[entry.name] || '#8884d8'} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'hsl(var(--card))', 
                                    borderColor: 'hsl(var(--border))',
                                    color: 'hsl(var(--foreground))',
                                    borderRadius: '6px'
                                }}
                                itemStyle={{ color: 'hsl(var(--foreground))' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-4 text-xs text-muted-foreground mt-2">
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"/>Morning</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500"/>Evening</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-violet-500"/>Night</div>
                    </div>
                </CardContent>
            </Card>

            {/* Upcoming Shifts List */}
            <Card className="dark:bg-neutral-900/50">
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Upcoming Duties</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {stats.myUpcoming.length > 0 ? stats.myUpcoming.map(r => (
                            <div key={r.id} className="flex items-center justify-between border-b dark:border-neutral-800 pb-2 last:border-0 last:pb-0">
                                <div>
                                    {/* Display date with timezone awareness - append T00:00 to force local interpretation if needed, or rely on parsing string */}
                                    <p className="font-medium text-sm text-foreground">
                                        {/* Create date from string carefully to avoid timezone shifts in display */}
                                        {new Date(r.dutyDate + "T00:00:00").toLocaleDateString(undefined, {weekday: 'short', month: 'short', day: 'numeric'})}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{r.dutyType}</p>
                                </div>
                                <Badge variant="outline" style={{ borderColor: SHIFT_COLORS[r.shift], color: SHIFT_COLORS[r.shift] }}>
                                    {r.shift}
                                </Badge>
                            </div>
                        )) : (
                            <p className="text-sm text-muted-foreground">No upcoming shifts scheduled.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>

      {/* --- Modals --- */}
      
      {/* 1. Add Roster Modal */}
      {isRosterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <Card className="w-full max-w-md shadow-lg bg-background dark:bg-neutral-900 border dark:border-neutral-800">
                <CardHeader>
                    <CardTitle>Add Self Schedule</CardTitle>
                    <CardDescription>Add a shift for yourself ({currentDoctor?.firstName} {currentDoctor?.lastName}).</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmitRoster}>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Input type="date" required onChange={(e) => setFormData({...formData, date: e.target.value})} className="dark:bg-neutral-950" />
                            </div>
                            <div className="space-y-2">
                                <Label>Shift</Label>
                                <select 
                                    className="flex h-10 w-full rounded-md border border-input bg-background dark:bg-neutral-950 px-3 py-2 text-sm text-foreground"
                                    required
                                    onChange={(e) => setFormData({...formData, shift: e.target.value})}
                                >
                                    <option value="">Select Shift</option>
                                    <option value="Morning">Morning</option>
                                    <option value="Evening">Evening</option>
                                    <option value="Night">Night</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Duty Type</Label>
                            <Input placeholder="e.g. Regular, Emergency, On-Call" onChange={(e) => setFormData({...formData, dutyType: e.target.value})} className="dark:bg-neutral-950" />
                        </div>
                    </CardContent>
                    <div className="p-6 pt-0 flex justify-end gap-2">
                        <Button variant="outline" type="button" onClick={() => setIsRosterModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Add to Roster</Button>
                    </div>
                </form>
            </Card>
        </div>
      )}

      {/* 2. Add Overtime Modal */}
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