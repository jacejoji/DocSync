import React, { useState, useEffect } from "react";
import { format, differenceInCalendarDays } from "date-fns";
import { 
  CalendarPlus, 
  History, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Trash2,
  Calendar as CalendarIcon,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext"; 

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

export default function DoctorLeaves() {
  const { user: contextUser, loading: contextLoading } = useAuth(); 
  
  // Local state to hold the User ID (whether from Context or Manual Fetch)
  const [resolvedUserId, setResolvedUserId] = useState(null);
  
  const [leaves, setLeaves] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    leaveFrom: "",
    leaveTo: "",
    type: "Casual Leave"
  });

  // --- 1. ROBUST USER ID RESOLUTION ---
  useEffect(() => {
    const resolveUser = async () => {
      // Case A: Context has the user and ID. Perfect.
      if (contextUser && contextUser.id) {
        setResolvedUserId(contextUser.id);
        return;
      }

      // Case B: Context is done loading but User is missing or missing ID.
      // Attempt manual fetch to "heal" the session.
      if (!contextLoading) {
        try {
          console.log("Context missing ID. Attempting manual fetch...");
          const res = await api.get("/auth/me");
          if (res.data && res.data.id) {
            setResolvedUserId(res.data.id);
            console.log("Manual fetch success. ID:", res.data.id);
          } else {
            console.error("Manual fetch failed or ID missing in response:", res.data);
            setIsLoadingData(false); // Stop loading if we really can't find a user
          }
        } catch (error) {
          console.error("Manual auth check failed", error);
          setIsLoadingData(false);
        }
      }
    };

    resolveUser();
  }, [contextUser, contextLoading]);

  // --- 2. FETCH LEAVES (Once ID is Resolved) ---
  useEffect(() => {
    if (resolvedUserId) {
      fetchLeaves(resolvedUserId);
    }
  }, [resolvedUserId]);

  const fetchLeaves = async (doctorId) => {
    setIsLoadingData(true);
    try {
      const response = await api.get(`/api/leave-requests/doctor/${doctorId}`);
      setLeaves(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching leaves:", error);
      if (error.response?.status !== 404) {
        toast.error("Failed to load leave history.");
      }
    } finally {
      setIsLoadingData(false);
    }
  };

  // --- 3. HANDLERS ---

  const handleApply = async () => {
    // Basic Form Validation
    if (!formData.leaveFrom || !formData.leaveTo) {
      toast.error("Please select both start and end dates.");
      return;
    }
    if (new Date(formData.leaveTo) < new Date(formData.leaveFrom)) {
        toast.error("End date cannot be before start date.");
        return;
    }

    // ID Check
    if (!resolvedUserId) {
        toast.error("User session invalid. Please reload the page.");
        return;
    }

    setIsSaving(true);
    try {
      const payload = {
        doctor: { id: resolvedUserId }, // Use the resolved ID
        leaveFrom: formData.leaveFrom,
        leaveTo: formData.leaveTo,
        type: formData.type,
        status: "PENDING"
      };

      await api.post("/api/leave-requests", payload);
      toast.success("Leave application submitted.");
      setIsDialogOpen(false);
      setFormData({ leaveFrom: "", leaveTo: "", type: "Casual Leave" }); 
      fetchLeaves(resolvedUserId);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Failed to apply for leave.";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm("Are you sure you want to withdraw this request?")) return;
    try {
      await api.delete(`/api/leave-requests/${id}`);
      toast.success("Request withdrawn.");
      fetchLeaves(resolvedUserId);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error("Could not cancel request.");
    }
  };

  // --- HELPERS ---
  const formatDate = (dateStr) => (!dateStr ? "-" : format(new Date(dateStr), "MMM dd, yyyy"));
  const getDuration = (from, to) => {
    const days = differenceInCalendarDays(new Date(to), new Date(from)) + 1; 
    return `${days} Day${days > 1 ? 's' : ''}`;
  };
  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case "APPROVED": return <Badge className="bg-green-600 hover:bg-green-700">Approved</Badge>;
      case "REJECTED": return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">Pending</Badge>;
    }
  };

  // Stats
  const pendingCount = leaves.filter(l => l.status === "PENDING").length;
  const approvedCount = leaves.filter(l => l.status === "APPROVED").length;

  // --- RENDERING ---

  if (contextLoading || (isLoadingData && !resolvedUserId)) {
      return (
          <div className="flex h-screen w-full items-center justify-center flex-col gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-muted-foreground text-sm">Verifying profile...</span>
          </div>
      );
  }

  // Only show error if loading finished AND we still have no ID
  if (!isLoadingData && !resolvedUserId) {
      return (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
              <AlertTriangle className="h-12 w-12 text-red-500" />
              <h2 className="text-xl font-bold">Access Error</h2>
              <p className="text-muted-foreground max-w-md">
                  We could not verify your doctor profile. Please try refreshing the page.
              </p>
              <Button onClick={() => window.location.reload()}>Refresh Page</Button>
          </div>
      );
  }

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-8 pt-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Leaves</h2>
          <p className="text-muted-foreground">Apply for time off and check application status.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} disabled={!resolvedUserId}>
            <CalendarPlus className="mr-2 h-4 w-4" /> Apply for Leave
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved (All Time)</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{approvedCount}</div>
                <p className="text-xs text-muted-foreground">Approved applications</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">History Total</CardTitle>
                <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{leaves.length}</div>
                <p className="text-xs text-muted-foreground">Total records</p>
            </CardContent>
        </Card>
      </div>

      {/* History Table */}
      <div className="rounded-md border bg-card">
        <div className="p-4 border-b">
            <h3 className="font-semibold flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" /> Application History
            </h3>
        </div>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Applied On</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoadingData ? (
                    <TableRow><TableCell colSpan={6} className="h-24 text-center"><Loader2 className="animate-spin inline mr-2"/> Loading...</TableCell></TableRow>
                ) : leaves.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No leave records found.</TableCell></TableRow>
                ) : (
                    leaves.sort((a,b) => b.id - a.id).map((req) => (
                        <TableRow key={req.id}>
                            <TableCell className="font-medium">{req.type}</TableCell>
                            <TableCell>
                                <div className="text-sm">
                                    {formatDate(req.leaveFrom)} <span className="text-muted-foreground">to</span> {formatDate(req.leaveTo)}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                                    {getDuration(req.leaveFrom, req.leaveTo)}
                                </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                                {formatDate(req.leaveFrom)} 
                            </TableCell>
                            <TableCell>{getStatusBadge(req.status)}</TableCell>
                            <TableCell className="text-right">
                                {req.status === "PENDING" && (
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8"
                                        onClick={() => handleCancel(req.id)}
                                    >
                                        <Trash2 className="mr-2 h-3 w-3" /> Withdraw
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
      </div>

      {/* --- DIALOG --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Apply for Leave</DialogTitle>
                <DialogDescription>Submit a new request for approval.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <Label>Leave Type</Label>
                    <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Casual Leave">Casual Leave</SelectItem>
                            <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                            <SelectItem value="Emergency">Emergency</SelectItem>
                            <SelectItem value="Vacation">Vacation</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label>From Date</Label>
                        <Input type="date" value={formData.leaveFrom} onChange={(e) => setFormData({...formData, leaveFrom: e.target.value})} />
                    </div>
                    <div className="grid gap-2">
                        <Label>To Date</Label>
                        <Input type="date" value={formData.leaveTo} onChange={(e) => setFormData({...formData, leaveTo: e.target.value})} />
                    </div>
                </div>
                {formData.leaveFrom && formData.leaveTo && (
                    <div className="bg-muted/50 p-3 rounded-md flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total Duration:</span>
                        <span className="font-semibold">
                            {new Date(formData.leaveTo) < new Date(formData.leaveFrom) 
                                ? "Invalid Dates" 
                                : getDuration(formData.leaveFrom, formData.leaveTo)}
                        </span>
                    </div>
                )}
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleApply} disabled={isSaving || !resolvedUserId}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Submit Application
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}