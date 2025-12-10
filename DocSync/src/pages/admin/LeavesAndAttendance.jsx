import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  CalendarDays, 
  UserCheck, 
  AlertCircle,
  Search,
  Loader2,
  Filter
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function LeavesAndAttendance() {
  const [activeTab, setActiveTab] = useState("leaves");
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [leaves, setLeaves] = useState([]);
  const [attendance, setAttendance] = useState([]);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // For leaves

  // --- API Actions ---

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Leaves: GET /api/leave-requests
      const leavesRes = await api.get("/api/leave-requests");
      setLeaves(Array.isArray(leavesRes.data) ? leavesRes.data : []);

      // 2. Fetch Attendance: GET /attendance (Note: No /api prefix based on your controller)
      const attendanceRes = await api.get("/attendance");
      setAttendance(Array.isArray(attendanceRes.data) ? attendanceRes.data : []);
      
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Leave Approval
  const handleApprove = async (id) => {
    try {
      // PUT /api/leave-requests/{id}/approve
      await api.put(`/api/leave-requests/${id}/approve`);
      toast.success("Leave request approved.");
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Approval failed", error);
      toast.error("Failed to approve request.");
    }
  };

  // Handle Leave Rejection
  const handleReject = async (id) => {
    if(!window.confirm("Are you sure you want to reject this request?")) return;
    try {
      // PUT /api/leave-requests/{id}/reject
      await api.put(`/api/leave-requests/${id}/reject`);
      toast.success("Leave request rejected.");
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Rejection failed", error);
      toast.error("Failed to reject request.");
    }
  };

  // --- Helper Functions ---

  const getDoctorName = (doc) => {
    if (!doc) return "Unknown Doctor";
    return `${doc.firstName} ${doc.lastName}`;
  };

  const formatDate = (dateStr) => {
    if(!dateStr) return "-";
    return format(new Date(dateStr), "MMM dd, yyyy");
  };

  const formatTime = (timeStr) => {
    if(!timeStr) return "-";
    // Check if it's strictly HH:mm:ss or HH:mm
    return timeStr.substring(0, 5); 
  };

  // Calculate Duration for Leaves
  const getDuration = (from, to) => {
    const start = new Date(from);
    const end = new Date(to);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive
    return `${diffDays} Day${diffDays > 1 ? 's' : ''}`;
  };

  // Filter Logic
  const filteredLeaves = leaves.filter(l => {
    const matchesSearch = getDoctorName(l.doctor).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredAttendance = attendance.filter(a => 
    getDoctorName(a.doctor).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-8 pt-6 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Leaves & Attendance</h2>
        <p className="text-muted-foreground">Monitor staff presence and process leave applications.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        
        <TabsList>
          <TabsTrigger value="leaves" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" /> Leave Requests
            {leaves.filter(l => l.status === "PENDING").length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                    {leaves.filter(l => l.status === "PENDING").length}
                </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" /> Attendance Log
          </TabsTrigger>
        </TabsList>

        {/* --- LEAVES TAB --- */}
        <TabsContent value="leaves" className="space-y-4">
          
          {/* Leave Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                <AlertCircle className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">
                    {leaves.filter(l => l.status === "PENDING").length}
                </div>
                <p className="text-xs text-muted-foreground">Requires action</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved (This Month)</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                    {leaves.filter(l => l.status === "APPROVED").length}
                </div>
                <p className="text-xs text-muted-foreground">Staff on scheduled leave</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                    {leaves.filter(l => l.status === "REJECTED").length}
                </div>
                <p className="text-xs text-muted-foreground">Denied requests</p>
              </CardContent>
            </Card>
          </div>

          {/* Leave Filters */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
             <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search doctor..." 
                        className="pl-8" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Filter Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Status</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="APPROVED">Approved</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                </Select>
             </div>
             <Button variant="outline" size="sm" onClick={fetchData}>
                Refresh Data
             </Button>
          </div>

          {/* Leave Table */}
          <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                         <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" /> Loading requests...
                                </div>
                            </TableCell>
                         </TableRow>
                    ) : filteredLeaves.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                No leave requests found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredLeaves.map((request) => (
                            <TableRow key={request.id}>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{getDoctorName(request.doctor)}</span>
                                        <span className="text-xs text-muted-foreground">{request.doctor?.specialization}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{request.type}</TableCell>
                                <TableCell>{getDuration(request.leaveFrom, request.leaveTo)}</TableCell>
                                <TableCell>
                                    <div className="text-sm">
                                        {formatDate(request.leaveFrom)} <span className="text-muted-foreground">to</span> {formatDate(request.leaveTo)}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {request.status === "PENDING" && <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>}
                                    {request.status === "APPROVED" && <Badge className="bg-green-600 hover:bg-green-700">Approved</Badge>}
                                    {request.status === "REJECTED" && <Badge variant="destructive">Rejected</Badge>}
                                </TableCell>
                                <TableCell className="text-right">
                                    {request.status === "PENDING" ? (
                                        <div className="flex justify-end gap-2">
                                            <Button 
                                                size="sm" 
                                                variant="outline" 
                                                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                                                onClick={() => handleApprove(request.id)}
                                                title="Approve"
                                            >
                                                <CheckCircle2 className="h-4 w-4" />
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                                onClick={() => handleReject(request.id)}
                                                title="Reject"
                                            >
                                                <XCircle className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground text-xs italic">Processed</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
          </div>
        </TabsContent>


        {/* --- ATTENDANCE TAB --- */}
        <TabsContent value="attendance" className="space-y-4">
            
            <div className="flex items-center justify-between">
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search doctor in logs..." 
                        className="pl-8" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" onClick={fetchData}>
                    <Clock className="mr-2 h-4 w-4" /> Refresh Logs
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Doctor</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Check In</TableHead>
                            <TableHead>Check Out</TableHead>
                            <TableHead className="text-right">Work Hours</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                    {loading ? (
                         <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" /> Loading attendance...
                                </div>
                            </TableCell>
                         </TableRow>
                    ) : filteredAttendance.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                No attendance records found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredAttendance.map((record) => (
                            <TableRow key={record.id}>
                                <TableCell className="font-medium">
                                    {getDoctorName(record.doctor)}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <CalendarDays className="h-3 w-3 text-muted-foreground" />
                                        {formatDate(record.date)}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                                        {record.status || "PRESENT"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-green-700 font-medium">
                                    {record.checkIn ? formatTime(record.checkIn) : "-"}
                                </TableCell>
                                <TableCell className="text-red-700 font-medium">
                                    {record.checkOut ? formatTime(record.checkOut) : <span className="text-muted-foreground text-xs italic">Active</span>}
                                </TableCell>
                                <TableCell className="text-right font-mono text-sm">
                                    {/* Logic to calculate hours if both exist, else placeholder */}
                                    {record.checkIn && record.checkOut ? (
                                        "8h 30m" // Placeholder for simple calculation logic
                                    ) : (
                                        "-"
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                    </TableBody>
                </Table>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}