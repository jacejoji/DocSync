import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { 
  Calendar, 
  Clock, 
  Search, 
  Plus, 
  Trash2, 
  Loader2, 
  User, 
  Stethoscope, 
  Filter,
  X
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
import { Textarea } from "@/components/ui/textarea";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter/View Mode State
  const [viewMode, setViewMode] = useState("ALL"); // ALL, DOCTOR, PATIENT
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("");

  // Dialog & Saving State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Scheduling Form State
  const [formData, setFormData] = useState({
    doctorId: "",
    patientId: "",
    appointmentTime: "", 
    status: "SCHEDULED",
    notes: ""
  });

  // --- 1. Master Data Fetching (Doctors/Patients for Dropdowns) ---
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [docRes, patRes] = await Promise.all([
          api.get("/doctor"),
          api.get("/api/patients")
        ]);
        setDoctors(Array.isArray(docRes.data) ? docRes.data : []);
        setPatients(Array.isArray(patRes.data) ? patRes.data : []);
      } catch (error) {
        console.error("Failed to load master data", error);
        // Don't toast here to avoid spamming if one fails silently
      }
    };
    fetchMasterData();
  }, []);

  // --- 2. Appointments Fetching Logic (Based on View Mode) ---
  const fetchAppointments = async () => {
    setLoading(true);
    setAppointments([]); // Clear current view
    try {
      let response;

      if (viewMode === "ALL") {
        // GET: /appointments (Total View)
        response = await api.get("/appointments");
      } 
      else if (viewMode === "DOCTOR" && selectedDoctorId) {
        // GET: /appointments/doctor/{id}/upcoming
        response = await api.get(`/appointments/doctor/${selectedDoctorId}/upcoming`);
      } 
      else if (viewMode === "PATIENT" && selectedPatientId) {
        // GET: /appointments/patient/{id}/history
        response = await api.get(`/appointments/patient/${selectedPatientId}/history`);
      }

      if (response) {
        setAppointments(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error("Error fetching appointments", error);
      toast.error("Could not load appointments.");
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when filters change
  useEffect(() => {
    // Only fetch if we are in ALL mode, or if a specific ID is selected in the other modes
    if (viewMode === "ALL" || (viewMode === "DOCTOR" && selectedDoctorId) || (viewMode === "PATIENT" && selectedPatientId)) {
        fetchAppointments();
    }
  }, [viewMode, selectedDoctorId, selectedPatientId]);


  // --- 3. CRUD Actions ---

  const handleCreate = async () => {
    if(!formData.doctorId || !formData.patientId || !formData.appointmentTime) {
      toast.error("Doctor, Patient, and Date/Time are required.");
      return;
    }

    setIsSaving(true);
    try {
      // --- FIX: Ensure Seconds are included for Java LocalDateTime ---
      let isoDate = formData.appointmentTime;
      // If the string is length 16 (e.g., "2023-10-27T14:30"), add ":00"
      if (isoDate && isoDate.length === 16) {
         isoDate = isoDate + ":00";
      }

      const payload = {
        doctor: { id: formData.doctorId },
        patient: { id: formData.patientId },
        appointmentTime: isoDate, // Send the fixed ISO date
        status: formData.status,
        notes: formData.notes
      };

      await api.post("/appointments", payload);
      toast.success("Appointment scheduled successfully.");
      setIsDialogOpen(false);
      
      setFormData({
        doctorId: "",
        patientId: "",
        appointmentTime: "",
        status: "SCHEDULED",
        notes: ""
      });
      
      fetchAppointments(); // Refresh current view
    } catch (error) {
      console.error(error);
      const msg = error.response?.data ? String(error.response.data) : "Failed to schedule appointment.";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if(!confirm("Are you sure you want to cancel (delete) this appointment?")) return;
    try {
      await api.delete(`/appointments/${id}`);
      toast.success("Appointment cancelled.");
      fetchAppointments();
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error("Failed to cancel appointment.");
    }
  };

  // --- 4. Helper Functions ---

  const getDoctorName = (doc) => doc ? `${doc.firstName} ${doc.lastName}` : "Unknown";
  const getPatientName = (pat) => pat ? `${pat.firstName} ${pat.lastName}` : "Unknown";

  const formatDateTime = (dateStr) => {
    if(!dateStr) return "-";
    return format(new Date(dateStr), "MMM dd, yyyy • h:mm a");
  };

  const getStatusBadge = (status) => {
    switch(status?.toUpperCase()) {
        case "SCHEDULED": return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Scheduled</Badge>;
        case "COMPLETED": return <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">Completed</Badge>;
        case "CANCELLED": return <Badge variant="destructive">Cancelled</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const clearFilters = () => {
    setSelectedDoctorId("");
    setSelectedPatientId("");
    setViewMode("ALL");
  };

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-8 pt-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Appointments</h2>
          <p className="text-muted-foreground">Monitor schedules and manage patient visits.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Book Appointment
        </Button>
      </div>

      {/* KPI Cards (Always visible for Total Context) */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{appointments.length}</div>
                <p className="text-xs text-muted-foreground">In current view</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {appointments.filter(a => a.status === "SCHEDULED").length}
                </div>
                <p className="text-xs text-muted-foreground">Upcoming visits</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Doctors Active</CardTitle>
                <Stethoscope className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{doctors.length}</div>
                <p className="text-xs text-muted-foreground">Available specialists</p>
            </CardContent>
        </Card>
      </div>

      {/* --- ADMIN FILTER BAR --- */}
      <div className="bg-muted/30 p-4 rounded-lg border flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
         
         <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-end md:items-center">
             
             {/* 1. Select View Mode */}
             <div className="flex flex-col gap-1.5 w-full md:w-auto">
                <Label className="text-xs font-semibold text-muted-foreground uppercase">Filter By</Label>
                <Select value={viewMode} onValueChange={(val) => {
                    setViewMode(val);
                    setAppointments([]); // Clear table temporarily
                }}>
                    <SelectTrigger className="w-[180px] bg-background">
                        <SelectValue placeholder="Select View" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Appointments</SelectItem>
                        <SelectItem value="DOCTOR">Specific Doctor</SelectItem>
                        <SelectItem value="PATIENT">Specific Patient</SelectItem>
                    </SelectContent>
                </Select>
             </div>

             {/* 2. Contextual Dropdown based on View Mode */}
             {viewMode === "DOCTOR" && (
                 <div className="flex flex-col gap-1.5 w-full md:w-auto animate-in fade-in slide-in-from-left-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase">Select Doctor</Label>
                    <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                        <SelectTrigger className="w-[240px] bg-background">
                            <SelectValue placeholder="Choose Doctor..." />
                        </SelectTrigger>
                        <SelectContent>
                            {doctors.map(d => (
                                <SelectItem key={d.id} value={d.id.toString()}>
                                    {d.firstName} {d.lastName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                 </div>
             )}

             {viewMode === "PATIENT" && (
                 <div className="flex flex-col gap-1.5 w-full md:w-auto animate-in fade-in slide-in-from-left-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase">Select Patient</Label>
                    <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                        <SelectTrigger className="w-[240px] bg-background">
                            <SelectValue placeholder="Choose Patient..." />
                        </SelectTrigger>
                        <SelectContent>
                            {patients.map(p => (
                                <SelectItem key={p.id} value={p.id.toString()}>
                                    {p.firstName} {p.lastName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                 </div>
             )}
         </div>

         {viewMode !== "ALL" && (
             <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
                 <X className="mr-2 h-4 w-4" /> Clear Filters
             </Button>
         )}
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Patient Details</TableHead>
                    <TableHead>Assigned Doctor</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    <TableRow><TableCell colSpan={6} className="h-24 text-center"><Loader2 className="animate-spin inline mr-2"/> Loading...</TableCell></TableRow>
                ) : appointments.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            {viewMode === "ALL" 
                                ? "No appointments found." 
                                : "Select a doctor/patient to view their schedule."}
                        </TableCell>
                    </TableRow>
                ) : (
                    appointments.map((appt) => (
                        <TableRow key={appt.id}>
                            <TableCell>
                                <div className="flex items-center gap-2 font-medium">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    {formatDateTime(appt.appointmentTime)}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium">{getPatientName(appt.patient)}</span>
                                    <span className="text-xs text-muted-foreground">{appt.patient?.phone}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2 text-sm">
                                    <Stethoscope className="h-3 w-3 text-muted-foreground" />
                                    {getDoctorName(appt.doctor)}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="secondary" className="font-normal bg-slate-100 text-slate-600">
                                    {appt.doctor?.department?.name || "General"}
                                </Badge>
                            </TableCell>
                            <TableCell>{getStatusBadge(appt.status)}</TableCell>
                            <TableCell className="text-right">
                                <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleDelete(appt.id)}
                                    title="Cancel Appointment"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
      </div>

      {/* --- DIALOG: SCHEDULE APPOINTMENT --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle>Book Appointment</DialogTitle>
                <DialogDescription>Admin override to schedule a patient visit.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                
                {/* Doctor Select */}
                <div className="grid gap-2">
                    <Label>Doctor <span className="text-red-500">*</span></Label>
                    <Select 
                        value={formData.doctorId} 
                        onValueChange={(val) => setFormData({...formData, doctorId: val})}
                    >
                        <SelectTrigger><SelectValue placeholder="Select Doctor" /></SelectTrigger>
                        <SelectContent>
                            {doctors.map(d => (
                                <SelectItem key={d.id} value={d.id.toString()}>
                                    {d.firstName} {d.lastName} <span className="text-xs text-muted-foreground">({d.specialization})</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Patient Select */}
                <div className="grid gap-2">
                    <Label>Patient <span className="text-red-500">*</span></Label>
                    <Select 
                        value={formData.patientId} 
                        onValueChange={(val) => setFormData({...formData, patientId: val})}
                    >
                        <SelectTrigger><SelectValue placeholder="Select Patient" /></SelectTrigger>
                        <SelectContent>
                            {patients.length > 0 ? patients.map(p => (
                                <SelectItem key={p.id} value={p.id.toString()}>
                                    {p.firstName} {p.lastName} <span className="text-xs text-muted-foreground">({p.phone})</span>
                                </SelectItem>
                            )) : <div className="p-2 text-sm text-center">No patients found.</div>}
                        </SelectContent>
                    </Select>
                </div>

                {/* Date & Time */}
                <div className="grid gap-2">
                    <Label>Date & Time <span className="text-red-500">*</span></Label>
                    <Input 
                        type="datetime-local" 
                        value={formData.appointmentTime}
                        onChange={(e) => setFormData({...formData, appointmentTime: e.target.value})}
                    />
                </div>

                {/* Status */}
                <div className="grid gap-2">
                    <Label>Status</Label>
                    <Select 
                        value={formData.status} 
                        onValueChange={(val) => setFormData({...formData, status: val})}
                    >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Notes */}
                <div className="grid gap-2">
                    <Label>Notes</Label>
                    <Textarea 
                        placeholder="Internal notes..."
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    />
                </div>

            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Confirm Booking
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}