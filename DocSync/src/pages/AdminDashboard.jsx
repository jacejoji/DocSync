/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useMemo } from "react";
import {
  Users,
  Building2,
  AlertCircle,
  TrendingUp,
  RefreshCcw,
  Search,
  Clock 
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import LoadingPage from "./LoadingPage";

import api from "@/lib/axios"; 

const COLORS = [
  "#0ea5e9", // Sky Blue
  "#22c55e", // Green
  "#eab308", // Yellow
  "#f43f5e", // Rose
  "#8b5cf6", // Violet
  "#64748b", // Slate
  "#ec4899", // Pink 
  "#14b8a6", // Teal 
];

// --- Custom Tooltip Component for Charts (Dark Mode Ready) ---
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-slate-100 dark:border-slate-800 rounded-xl shadow-xl p-3 text-sm">
        <p className="font-semibold mb-1 text-slate-700 dark:text-slate-200">{label}</p>
        <p style={{ color: payload[0].color }} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{backgroundColor: payload[0].color}}></span>
          {payload[0].name}: <span className="font-bold">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const { user } = useAuth();

  // --- State ---
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  // Data State
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState(0);

  // Filter State
  const [searchQuery, setSearchQuery] = useState("");

  // --- Helper: Dynamic Greeting ---
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // --- Fetch Logic ---
  const fetchDashboardData = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const [doctorsRes, pendingLeavesRes, departmentsRes] = await Promise.all([
        api.get("/doctor"),
        api.get("/api/leave-requests/status?val=PENDING"),
        api.get("/departments"),
      ]);

      setDoctors(doctorsRes.data);
      setDepartments(departmentsRes.data);
      setPendingApprovals(pendingLeavesRes.data.length);
      
      setLastUpdated(new Date()); 

    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || "Failed to load dashboard data. Please check connection.";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // --- Filter Logic ---
  const filteredDoctors = useMemo(() => {
    if (!searchQuery) return doctors;
    const lowerQuery = searchQuery.toLowerCase();
    return doctors.filter((doc) => 
      (doc.firstName && doc.firstName.toLowerCase().includes(lowerQuery)) ||
      (doc.lastName && doc.lastName.toLowerCase().includes(lowerQuery)) ||
      (doc.email && doc.email.toLowerCase().includes(lowerQuery)) ||
      (doc.department?.name && doc.department.name.toLowerCase().includes(lowerQuery))
    );
  }, [doctors, searchQuery]);

  // --- Chart Data Preparation ---
  const departmentChartData = useMemo(() => {
    const counts = {};
    filteredDoctors.forEach(doc => {
      const name = doc.department?.name || "Unassigned";
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [filteredDoctors]);

  const growthChartData = useMemo(() => {
    const sortedDocs = [...doctors]
        .filter(d => d.hireDate)
        .sort((a, b) => new Date(a.hireDate) - new Date(b.hireDate));

    const timeline = {};
    let runningTotal = 0;

    sortedDocs.forEach(doc => {
        const date = new Date(doc.hireDate);
        const key = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        runningTotal += 1;
        timeline[key] = runningTotal;
    });

    return Object.keys(timeline).map(date => ({
        date,
        total: timeline[date]
    }));
  }, [doctors]);


  if (isLoading) return <LoadingPage />;

  return (
    // MAIN BACKGROUND: Adjusted for both Light (slate-100) and Dark (slate-950)
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 md:p-6 space-y-8 animate-in fade-in duration-500 font-sans transition-colors">
      
      {/* --- Header Section (Sticky & Glassmorphic) --- */}
      <div className="sticky top-0 z-30 -mx-4 -mt-4 px-4 py-4 md:px-6 md:py-6 md:-mx-6 md:-mt-6 backdrop-blur-md bg-white/70 dark:bg-slate-900/80 border-b border-white/20 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
            {getGreeting()}, <span className="text-blue-600 dark:text-blue-400">Admin</span>.
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Hospital performance overview.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
           {/* Last Updated Badge */}
           <div className="hidden sm:flex items-center text-xs font-medium text-slate-600 dark:text-slate-400 bg-white/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
                <Clock className="w-3.5 h-3.5 mr-1.5 text-blue-500 dark:text-blue-400" />
                Updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>

            <Button 
                variant="outline" 
                onClick={() => fetchDashboardData(false)}
                disabled={isRefreshing}
                className="w-full sm:w-auto bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-sm"
            >
                <RefreshCcw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? "Syncing..." : "Refresh"}
            </Button>
        </div>
      </div>

      {/* --- Error Display --- */}
      {error && (
        <Alert variant="destructive" className="animate-in slide-in-from-top-2 shadow-lg border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-900">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* --- KPI Cards (Gradient Style - Dark Mode Compatible) --- */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Total Doctors" 
          value={doctors.length} 
          sub="Registered Staff" 
          icon={Users}
          gradient="from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40"
          border="border-blue-500"
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <StatsCard 
          title="Departments" 
          value={departments.length} 
          sub="Medical Units" 
          icon={Building2} 
          gradient="from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40"
          border="border-emerald-500"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
        <StatsCard 
          title="Pending Actions" 
          value={pendingApprovals} 
          sub="Leave Requests" 
          icon={AlertCircle} 
          highlight={pendingApprovals > 0}
          gradient="from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40"
          border="border-amber-500"
          iconColor="text-amber-600 dark:text-amber-400"
        />
        <StatsCard 
          title="System Health" 
          value="99.9%" 
          sub="Operational" 
          icon={TrendingUp} 
          gradient="from-violet-50 to-fuchsia-50 dark:from-violet-950/40 dark:to-fuchsia-950/40"
          border="border-violet-500"
          iconColor="text-violet-600 dark:text-violet-400"
        />
      </div>

      {/* --- Charts --- */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        
        {/* Growth Chart */}
        <Card className="col-span-1 lg:col-span-4 border-t-4 border-t-blue-500 shadow-md hover:shadow-lg transition-all duration-300 dark:bg-slate-900 dark:border-slate-800">
            <CardHeader>
                <CardTitle className="text-slate-800 dark:text-slate-100">Staff Growth</CardTitle>
                <CardDescription className="dark:text-slate-400">Hiring trends over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] pl-0">
                {growthChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={growthChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            {/* Uses Neutral Gray #94a3b8 for axis text to work on both light/dark */}
                            <XAxis 
                              dataKey="date" 
                              tick={{fontSize: 11, fill: '#94a3b8'}} 
                              axisLine={false}
                              tickLine={false}
                              dy={10}
                            />
                            <YAxis 
                              tick={{fontSize: 11, fill: '#94a3b8'}} 
                              allowDecimals={false}
                              axisLine={false}
                              tickLine={false}
                              dx={-10}
                            />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.4} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area 
                                type="monotone" 
                                dataKey="total" 
                                stroke="#3b82f6" 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill="url(#colorTotal)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                        Not enough data
                    </div>
                )}
            </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="col-span-1 lg:col-span-3 border-t-4 border-t-emerald-500 shadow-md hover:shadow-lg transition-all duration-300 dark:bg-slate-900 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-800 dark:text-slate-100">Departments</CardTitle>
            <CardDescription className="dark:text-slate-400">Staff distribution by unit</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex justify-center">
             {departmentChartData.length > 0 ? (
                <div className="w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={departmentChartData}
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none" 
                      >
                        {departmentChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        layout="horizontal" 
                        verticalAlign="bottom" 
                        align="center"
                        wrapperStyle={{ fontSize: "12px", paddingTop: "10px", color: "#94a3b8" }}
                        iconSize={10}
                        iconType="circle"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
             ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                   No data available
                </div>
             )}
          </CardContent>
        </Card>
      </div>

      {/* --- Directory Table --- */}
      <Card className="border-t-4 border-t-slate-500 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-50/30 dark:bg-slate-800/30">
            <div className="space-y-1">
                <CardTitle className="text-slate-800 dark:text-slate-100">Directory</CardTitle>
                <CardDescription className="dark:text-slate-400">
                    Manage and view staff details.
                </CardDescription>
            </div>
            <div className="w-full md:w-[300px] flex items-center gap-2">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input 
                        placeholder="Search name, email..." 
                        className="pl-9 bg-white dark:bg-slate-950 dark:border-slate-700 dark:text-slate-200 border-slate-200 focus:border-blue-400 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 border-b dark:border-slate-700">
                  <TableHead className="pl-6 font-semibold text-slate-600 dark:text-slate-300">Doctor</TableHead>
                  <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Department</TableHead>
                  <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Status</TableHead>
                  <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Date Hired</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDoctors.slice(0, 10).map((doc) => (
                  <TableRow key={doc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 border-b dark:border-slate-800 transition-colors">
                    <TableCell className="pl-6 font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-700 shadow-sm">
                          <AvatarFallback className="bg-gradient-to-br from-blue-50 to-slate-100 dark:from-blue-900 dark:to-slate-800 text-blue-600 dark:text-blue-300 font-bold">
                            {doc.firstName?.[0]}{doc.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{doc.firstName} {doc.lastName}</span>
                          <span className="text-xs text-muted-foreground">{doc.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                        <Badge variant="outline" className="font-normal bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 shadow-sm">
                            {doc.department?.name || "Unassigned"}
                        </Badge>
                    </TableCell>
                    <TableCell>
                        <StatusBadge status={doc.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm font-medium">
                        {doc.hireDate ? new Date(doc.hireDate).toLocaleDateString() : "-"}
                    </TableCell>
                  </TableRow>
                ))}
                
                {filteredDoctors.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                            {searchQuery ? "No doctors match your search." : "No doctors found."}
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// --- Components ---

function StatsCard({ title, value, sub, icon: Icon, highlight, gradient, border, iconColor }) {
  return (
    <Card className={`
        relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300
        bg-gradient-to-br ${gradient}
    `}>
      {/* Colored Left Border */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${border.replace('border-', 'bg-')}`}></div>

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pl-6">
        <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</CardTitle>
        <div className={`p-2 rounded-xl bg-white/60 dark:bg-black/20 shadow-sm ${iconColor}`}>
            <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="pl-6">
        <div className={`text-2xl font-bold ${highlight ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-white'}`}>
            {value}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }) {
    let className = "";

    switch(status) {
        case "Active":
            className = "bg-green-100/50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800";
            break;
        case "On Leave":
            className = "bg-amber-100/50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800";
            break;
        case "Inactive":
            className = "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700";
            break;
        default:
            className = "text-muted-foreground";
    }
    return <Badge variant="outline" className={`${className} border transition-colors shadow-sm`}>{status || "Unknown"}</Badge>;
}