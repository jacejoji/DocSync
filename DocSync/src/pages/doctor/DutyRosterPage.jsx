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
  MoreHorizontal,
  User
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

import { useAuth } from "@/context/AuthContext"; // Ensure you have this
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  const { user } = useAuth(); // Get logged-in user
  
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

  // --- Fetch Data ---
  const fetchData = async () => {
    if (!user?.username) return;
    setIsLoading(true);
    try {
      // 1. First, find out WHO the current doctor is based on email
      const docRes = await fetch(`http://localhost:8080/doctor/email/${user.username}`);
      if (!docRes.ok) throw new Error("Doctor profile not found");
      const doctorData = await docRes.json();
      setCurrentDoctor(doctorData);

      // 2. Fetch Roster (Global view so they see teammates)
      const rosterRes = await fetch("http://localhost:8080/api/duty-rosters");
      const allRosters = await rosterRes.json();
      setRosters(allRosters);

      // 3. Fetch Overtime (Only THEIR records)
      // Note: In a real app, backend should filter this. For now we filter on frontend or use a specific endpoint
      const otRes = await fetch("http://localhost:8080/overtimerecord");
      const allOt = await otRes.json();
      // Filter for current doctor only
      setOvertimeRecords(allOt.filter(rec => rec.doctor?.id === doctorData.id));

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
            doctor: { id: currentDoctor.id }, // Hardcoded to current user
            dutyDate: formData.date,
            shift: formData.shift,
            dutyType: formData.dutyType || "Regular"
        };
        
        const res = await fetch("http://localhost:8080/api/duty-rosters", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            setIsRosterModalOpen(false);
            setFormData({});
            fetchData();
        }
    } catch (err) {
        console.error(err);
    }
  };

  const handleSubmitOvertime = async (e) => {
    e.preventDefault();
    if (!currentDoctor) return;

    try {
        const payload = {
            doctor: { id: currentDoctor.id }, // Hardcoded to current user
            date: formData.date,
            hours: parseInt(formData.hours)
        };
        
        const res = await fetch("http://localhost:8080/overtimerecord", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            setIsOvertimeModalOpen(false);
            setFormData({});
            fetchData();
        }
    } catch (err) {
        console.error(err);
    }
  };

  // --- Derived Data ---
  const monthDays = useMemo(() => 
    getMonthDays(currentDate.getFullYear(), currentDate.getMonth()), 
  [currentDate]);

  const stats = useMemo(() => {
    // 1. My Upcoming Shifts (Next 7 days)
    const today = new Date();
    const myUpcoming = rosters
        .filter(r => r.doctor?.id === currentDoctor?.id && new Date(r.dutyDate) >= today)
        .sort((a,b) => new Date(a.dutyDate) - new Date(b.dutyDate))
        .slice(0, 5);

    // 2. My Shift Distribution (Pie Chart)
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
    <div className="min-h-screen bg-muted/20 p-6 space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Schedule</h1>
          <p className="text-muted-foreground">
             Welcome, Dr. {currentDoctor?.lastName}. Manage your shifts and overtime.
          </p>
        </div>
        <div className="flex bg-muted p-1 rounded-lg border">
            <button 
                onClick={() => setActiveTab("roster")}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === "roster" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
                Calendar
            </button>
            <button 
                onClick={() => setActiveTab("overtime")}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === "overtime" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
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
                <Card className="h-full border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <div className="flex items-center gap-4">
                            <CardTitle className="text-xl">
                                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </CardTitle>
                            <div className="flex items-center border rounded-md bg-white">
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
                        <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden border">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="bg-muted/50 p-2 text-center text-xs font-semibold text-muted-foreground">
                                    {day}
                                </div>
                            ))}
                            {monthDays.map((date, i) => {
                                const daysRosters = rosters.filter(r => r.dutyDate === date.toISOString().split('T')[0]);
                                // Highlight if it's MY shift
                                const isMyShift = daysRosters.some(r => r.doctor?.id === currentDoctor?.id);

                                return (
                                    <div key={i} className={`bg-white min-h-[120px] p-2 hover:bg-slate-50 transition-colors group relative ${isMyShift ? "bg-blue-50/30" : ""}`}>
                                        <span className={`text-sm font-medium ${date.toDateString() === new Date().toDateString() ? "bg-primary text-primary-foreground w-6 h-6 flex items-center justify-center rounded-full" : "text-muted-foreground"}`}>
                                            {date.getDate()}
                                        </span>
                                        
                                        <div className="mt-2 space-y-1">
                                            {daysRosters.map(roster => {
                                                const isMe = roster.doctor?.id === currentDoctor?.id;
                                                return (
                                                    <div 
                                                        key={roster.id} 
                                                        className={`text-xs p-1.5 rounded border border-l-4 truncate flex items-center gap-1 shadow-sm ${isMe ? "font-bold ring-1 ring-primary/20" : "opacity-80"}`}
                                                        style={{ borderLeftColor: SHIFT_COLORS[roster.shift] || '#ccc' }}
                                                    >
                                                        {roster.shift === "Morning" && <Sun className="w-3 h-3 text-amber-500" />}
                                                        {roster.shift === "Evening" && <Sunset className="w-3 h-3 text-orange-500" />}
                                                        {roster.shift === "Night" && <Moon className="w-3 h-3 text-violet-500" />}
                                                        <span className="text-gray-700">
                                                            {isMe ? "Me" : roster.doctor?.lastName}
                                                        </span>
                                                    </div>
                                                )
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
                <Card>
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
                                        <TableCell>{rec.date}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="px-3 bg-blue-50 text-blue-700 border-blue-200">
                                                +{rec.hours} hrs
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-green-600 border-green-200">Logged</Badge>
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
            <Card>
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
                                outerRadius={60}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {stats.pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={SHIFT_COLORS[entry.name] || '#8884d8'} />
                                ))}
                            </Pie>
                            <Tooltip />
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
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Upcoming Duties</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {stats.myUpcoming.length > 0 ? stats.myUpcoming.map(r => (
                            <div key={r.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                <div>
                                    <p className="font-medium text-sm">{new Date(r.dutyDate).toLocaleDateString(undefined, {weekday: 'short', month: 'short', day: 'numeric'})}</p>
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

      {/* --- Modals (Simplified for Self-Service) --- */}
      
      {/* 1. Add Roster Modal */}
      {isRosterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader>
                    <CardTitle>Add Self Schedule</CardTitle>
                    <CardDescription>Add a shift for yourself ({currentDoctor?.firstName} {currentDoctor?.lastName}).</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmitRoster}>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Input type="date" required onChange={(e) => setFormData({...formData, date: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label>Shift</Label>
                                <select 
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                            <Input placeholder="e.g. Regular, Emergency, On-Call" onChange={(e) => setFormData({...formData, dutyType: e.target.value})} />
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
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader>
                    <CardTitle>Log My Overtime</CardTitle>
                    <CardDescription>Record extra hours for {currentDoctor?.firstName}.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmitOvertime}>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Input type="date" required onChange={(e) => setFormData({...formData, date: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label>Hours</Label>
                                <Input type="number" min="1" max="24" required placeholder="e.g. 2" onChange={(e) => setFormData({...formData, hours: e.target.value})} />
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