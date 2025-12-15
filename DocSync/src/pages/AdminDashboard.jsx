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

// IMPORT YOUR CUSTOM AXIOS INSTANCE
// Make sure the path points to where you saved your custom axios file
import api from "@/lib/axios"; // <-- Adjust this path (e.g., ./api or ../lib/api)

const COLORS = [
  "#0ea5e9", // Sky Blue
  "#22c55e", // Green
  "#eab308", // Yellow
  "#f43f5e", // Rose
  "#8b5cf6", // Violet
  "#64748b", // Slate
  "#ec4899", // Pink (Added)
  "#14b8a6", // Teal (Added)
];
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

  // --- Fetch Logic (UPDATED TO USE AXIOS) ---
  const fetchDashboardData = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      // 1. Use api.get instead of fetch
      // 2. Remove the full URL (16.112.128.57:8080) because your api instance already has baseURL
      const [doctorsRes, pendingLeavesRes, departmentsRes] = await Promise.all([
        api.get("/doctor"),
        api.get("/api/leave-requests/status?val=PENDING"),
        api.get("/departments"),
      ]);

      // 3. Axios stores the actual JSON data in .data
      setDoctors(doctorsRes.data);
      setDepartments(departmentsRes.data);
      setPendingApprovals(pendingLeavesRes.data.length);
      
      setLastUpdated(new Date()); 

    } catch (err) {
      console.error(err);
      // Axios errors usually store the server message in err.response.data
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

  // ... (The rest of your component: Filter Logic, Chart Data, JSX remains exactly the same)
  
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
    <div className="min-h-screen bg-muted/20 p-6 space-y-8 animate-in fade-in duration-500">
      
      {/* --- Header Section --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div>
          {/* Dynamic Greeting */}
          <h1 className="text-3xl font-bold tracking-tight">
            {getGreeting()}, Admin.
          </h1>
          <p className="text-muted-foreground mt-1">
            Here is what's happening in your hospital today.
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
           {/* Actions Row */}
           <div className="flex items-center gap-3">
                {/* Last Updated Text */}
                <div className="flex items-center text-xs text-muted-foreground px-3 py-1 rounded-full border">
                    <Clock className="w-3 h-3 mr-1.5" />
                    Last updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>

                <Button 
                    variant="outline" 
                    onClick={() => fetchDashboardData(false)}
                    disabled={isRefreshing}
                >
                    <RefreshCcw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? "Syncing..." : "Refresh Data"}
                </Button>
           </div>
        </div>
      </div>

      {/* --- Error Display --- */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* --- KPI Cards --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Total Doctors" 
          value={doctors.length} 
          sub="Registered in system" 
          icon={Users} 
        />
        <StatsCard 
          title="Departments" 
          value={departments.length} 
          sub="Active medical units" 
          icon={Building2} 
        />
        <StatsCard 
          title="Pending Approvals" 
          value={pendingApprovals} 
          sub="Leave requests waiting" 
          icon={AlertCircle} 
          highlight={pendingApprovals > 0}
        />
        <StatsCard 
          title="System Health" 
          value="99.9%" 
          sub="Operational" 
          icon={TrendingUp} 
          className="text-green-600"
        />
      </div>

      {/* --- Charts --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Staff Growth Trend</CardTitle>
                <CardDescription>Cumulative doctor hiring over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
                {growthChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={growthChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="date" tick={{fontSize: 12}} />
                            <YAxis tick={{fontSize: 12}} allowDecimals={false}/>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <Tooltip />
                            <Area 
                                type="monotone" 
                                dataKey="total" 
                                stroke="#0ea5e9" 
                                fillOpacity={1} 
                                fill="url(#colorTotal)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                        Not enough data to show trends
                    </div>
                )}
            </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
            <CardDescription>Staff allocation by unit</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex justify-center">
             {departmentChartData.length > 0 ? (
                <div className="w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={departmentChartData}
                        cx="40%"                 // Moved left to make room for legend
                        cy="50%"
                        innerRadius={50}         // Slightly thicker ring
                        outerRadius={120}        // Increased overall size
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {departmentChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      {/* Legend moved to the right side (Vertical Layout) */}
                      <Legend 
                        layout="vertical" 
                        verticalAlign="middle" 
                        align="right"
                        wrapperStyle={{ fontSize: "12px" }}
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
                <CardTitle>Doctor Directory</CardTitle>
                <CardDescription>
                    Manage and view staff details.
                </CardDescription>
            </div>
            <div className="w-[300px] flex items-center gap-2">
                <div className="relative w-full">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search name, email, or dept..." 
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Hired</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDoctors.slice(0, 10).map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {doc.firstName?.[0]}{doc.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">{doc.firstName} {doc.lastName}</span>
                          <span className="text-xs text-muted-foreground">{doc.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{doc.department?.name || "Unassigned"}</TableCell>
                    <TableCell>
                        <StatusBadge status={doc.status} />
                    </TableCell>
                    <TableCell>
                        {doc.hireDate ? new Date(doc.hireDate).toLocaleDateString() : "-"}
                    </TableCell>
                  </TableRow>
                ))}
                
                {filteredDoctors.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
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

// --- Components (Unchanged) ---

function StatsCard({ title, value, sub, icon: Icon, highlight, className }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-muted-foreground ${className || ''} ${highlight ? 'text-red-500' : ''}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }) {
    let variant = "secondary";
    let className = "";

    switch(status) {
        case "Active":
            variant = "outline";
            className = "bg-green-50 text-green-700 border-green-200";
            break;
        case "On Leave":
            variant = "outline";
            className = "bg-yellow-50 text-yellow-700 border-yellow-200";
            break;
        case "Inactive":
            className = "bg-gray-100 text-gray-500";
            break;
        default:
            className = "text-muted-foreground";
    }
    return <Badge variant={variant} className={className}>{status || "Unknown"}</Badge>;
}