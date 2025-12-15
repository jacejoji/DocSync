/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  User,
  FileText,
  ShieldCheck,
  ShieldAlert,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  DollarSign,
  ChevronRight,
  Check,
  ChevronsUpDown
} from "lucide-react";
import { toast } from "sonner"; // IMPORT SONNER

import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import LoadingPage from "../LoadingPage";
import { cn } from "@/lib/utils";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // IMPORT ALERT DIALOG
import { Separator } from "@/components/ui/separator";

export default function Appointment() {
  const { user } = useAuth();
  
  // --- State ---
  const [isLoading, setIsLoading] = useState(true);
  const [currentDoctor, setCurrentDoctor] = useState(null);
  
  // Data State
  const [appointments, setAppointments] = useState([]);
  const [allPatients, setAllPatients] = useState([]); 
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  // Patient Specific Data
  const [patientPolicies, setPatientPolicies] = useState([]);
  const [appointmentClaims, setAppointmentClaims] = useState([]);
  
  // Modals State
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isAddApptModalOpen, setIsAddApptModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false); // New Confirmation State
  
  // Combobox State
  const [openPatientCombo, setOpenPatientCombo] = useState(false);

  // Form Data State
  const [newClaimData, setNewClaimData] = useState({ amount: "", policyId: "" });
  const [newApptData, setNewApptData] = useState({ patientId: "", dateTime: "", notes: "" });
  const [rescheduleData, setRescheduleData] = useState({ dateTime: "" });

  // --- Initial Fetch ---
  useEffect(() => {
    const fetchInitialData = async () => {
        if (!user?.username) return;
        setIsLoading(true);
        try {
            // 1. Get Doctor ID
            const docRes = await api.get(`/doctor/email/${user.username}`);
            const doctorData = docRes.data;
            setCurrentDoctor(doctorData);

            // 2. Get Upcoming Appointments
            await refreshAppointments(doctorData.id);

            // 3. Fetch All Patients
            try {
                const patRes = await api.get("/api/patients"); 
                setAllPatients(patRes.data);
            } catch (err) {
                console.warn("Could not fetch patient list", err);
            }

        } catch (error) {
            console.error("Error fetching initial data:", error);
            toast.error("Failed to load appointment data");
        } finally {
            setIsLoading(false);
        }
    };

    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Helper to refresh list
  const refreshAppointments = async (doctorId) => {
      const idToUse = doctorId || currentDoctor?.id;
      if(!idToUse) return;
      try {
        const apptRes = await api.get(`/appointments/doctor/${idToUse}/upcoming`);
        setAppointments(apptRes.data);
        
        if (selectedAppointment) {
            const updatedSelected = apptRes.data.find(a => a.id === selectedAppointment.id);
            if (updatedSelected) {
                setSelectedAppointment(updatedSelected);
            }
        } else if (apptRes.data.length > 0) {
            handleSelectAppointment(apptRes.data[0]);
        }
      } catch (error) {
        console.error("Refresh failed", error);
      }
  };

  // --- Handlers ---

  const handleSelectAppointment = async (appt) => {
    setSelectedAppointment(appt);
    if (appt?.patient?.id) {
        try {
            const policyRes = await api.get(`/api/patient-insurance/patient/${appt.patient.id}`);
            setPatientPolicies(policyRes.data);

            const claimRes = await api.get(`/insurance-claims/appointment/${appt.id}`);
            setAppointmentClaims(claimRes.data);
        } catch (error) {
            console.error("Error fetching details:", error);
            toast.error("Could not fetch patient insurance details");
        }
    }
  };

  const handleAddAppointment = async () => {
    if (!newApptData.patientId || !newApptData.dateTime) return;

    try {
        const payload = {
            doctor: { id: currentDoctor.id },
            patient: { id: newApptData.patientId },
            appointmentTime: newApptData.dateTime, 
            status: "Scheduled",
            notes: newApptData.notes
        };

        await api.post("/appointments", payload);
        
        setIsAddApptModalOpen(false);
        setNewApptData({ patientId: "", dateTime: "", notes: "" });
        await refreshAppointments();
        toast.success("Appointment scheduled successfully");

    } catch (error) {
        console.error("Failed to create appointment:", error);
        toast.error("Failed to schedule appointment");
    }
  };

  const handleReschedule = async () => {
      if (!selectedAppointment || !rescheduleData.dateTime) return;
      try {
          const payload = {
              ...selectedAppointment,
              appointmentTime: rescheduleData.dateTime,
              status: "Rescheduled"
          };
          await api.put(`/appointments/${selectedAppointment.id}`, payload);
          setIsRescheduleModalOpen(false);
          setRescheduleData({ dateTime: "" });
          await refreshAppointments();
          toast.success("Appointment rescheduled");
      } catch (error) {
          console.error("Failed to reschedule:", error);
          toast.error("Failed to reschedule appointment");
      }
  };

  const handleCompleteConsultation = async () => {
      if (!selectedAppointment) return;

      // 1. Clean Payload: Only send the fields the backend actually updates.
      // We exclude 'patient' and 'doctor' objects to prevent circular JSON issues.
      const payload = {
          id: selectedAppointment.id,
          appointmentTime: selectedAppointment.appointmentTime,
          status: "Completed",
          notes: selectedAppointment.notes
      };

      try {
          await api.put(`/appointments/${selectedAppointment.id}`, payload);
          
          // Happy Path: If backend returns 200 OK
          await refreshAppointments();
          setIsCompleteDialogOpen(false);
          toast.success("Consultation completed successfully");

      } catch (error) {
          console.warn("Update request threw error, verifying data integrity...");

          // WORKAROUND:
          // If the backend saved the data but crashed while returning the response (JSON recursion),
          // the database is actually correct. We manually verify this here.
          try {
              // 1. Fetch the specific appointment fresh from the server
              const verifyRes = await api.get(`/appointments/${selectedAppointment.id}`);
              const freshData = verifyRes.data;

              // 2. Check if the status IS actually "Completed" in the database
              if (freshData && freshData.status === "Completed") {
                  // SUCCESS! It worked despite the error.
                  await refreshAppointments(); 
                  setIsCompleteDialogOpen(false);
                  toast.success("Consultation completed successfully");
                  return; 
              }
          } catch (verifyErr) {
              console.error("Verification check failed", verifyErr);
          }

          // Real Failure: If verification didn't find "Completed", then it really failed.
          console.error("Failed to complete:", error);
          toast.error("Failed to update status. Please try again.");
      }
  };

  const handleSubmitClaim = async () => {
    if (!selectedAppointment || !newClaimData.policyId || !newClaimData.amount) return;
    try {
        const payload = {
            appointment: { id: selectedAppointment.id },
            patientInsurancePolicy: { id: parseInt(newClaimData.policyId) },
            submissionDate: new Date().toISOString(),
            totalBillAmount: parseFloat(newClaimData.amount),
            claimedAmount: parseFloat(newClaimData.amount),
            status: "PENDING",
            claimReferenceNumber: `CLM-${Date.now()}`
        };

        await api.post("/insurance-claims", payload);
        const claimRes = await api.get(`/insurance-claims/appointment/${selectedAppointment.id}`);
        setAppointmentClaims(claimRes.data);
        setIsClaimModalOpen(false);
        setNewClaimData({ amount: "", policyId: "" });
        toast.success("Insurance claim submitted");
    } catch (error) {
        console.error("Failed to submit claim:", error);
        toast.error("Failed to submit claim");
    }
  };

  if (isLoading) return <LoadingPage />;

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full bg-muted/20 dark:bg-neutral-950 animate-in fade-in duration-500">
      
      {/* --- LEFT SIDEBAR: Appointment List --- */}
      <div className="w-full md:w-80 lg:w-96 border-r bg-background flex flex-col">
        <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold tracking-tight">Appointments</h2>
                <Button size="icon" variant="ghost" onClick={() => setIsAddApptModalOpen(true)}>
                    <Plus className="h-5 w-5" />
                </Button>
            </div>
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search patients..." className="pl-8" />
            </div>
        </div>
        
        <ScrollArea className="flex-1">
            <div className="flex flex-col gap-1 p-2">
                {appointments.length > 0 ? appointments.map((appt) => (
                    <button
                        key={appt.id}
                        onClick={() => handleSelectAppointment(appt)}
                        className={`
                            flex flex-col items-start gap-2 rounded-lg p-3 text-left text-sm transition-all hover:bg-accent
                            ${selectedAppointment?.id === appt.id ? "bg-accent text-accent-foreground ring-1 ring-border" : ""}
                        `}
                    >
                        <div className="flex w-full flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-base">{appt.patient?.firstName} {appt.patient?.lastName}</span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(appt.appointmentTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {new Date(appt.appointmentTime).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className={
                                    appt.status === 'Completed' ? 'text-blue-600 border-blue-200 bg-blue-50' :
                                    appt.status === 'Confirmed' || appt.status === 'Scheduled' ? 'text-green-600 border-green-200 bg-green-50' : 
                                    appt.status === 'Pending' ? 'text-amber-600 border-amber-200 bg-amber-50' : ''
                                }>
                                    {appt.status}
                                </Badge>
                            </div>
                        </div>
                    </button>
                )) : (
                    <div className="p-8 text-center text-muted-foreground">
                        No upcoming appointments found.
                    </div>
                )}
            </div>
        </ScrollArea>
      </div>

      {/* --- RIGHT MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedAppointment ? (
            <>
                <div className="flex items-center justify-between p-6 border-b bg-background">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                            {selectedAppointment.patient?.firstName?.[0]}{selectedAppointment.patient?.lastName?.[0]}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{selectedAppointment.patient?.firstName} {selectedAppointment.patient?.lastName}</h1>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1"><User className="h-3 w-3"/> Patient ID: #{selectedAppointment.patient?.id}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1"><Clock className="h-3 w-3"/> {new Date(selectedAppointment.appointmentTime).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                         <Button 
                            variant="outline" 
                            onClick={() => {
                                setRescheduleData({ dateTime: selectedAppointment.appointmentTime });
                                setIsRescheduleModalOpen(true);
                            }}
                            disabled={selectedAppointment.status === "Completed"}
                         >
                            Reschedule
                         </Button>

                         {selectedAppointment.status === "Completed" ? (
                             <Button disabled className="bg-green-600 text-white opacity-100">
                                <Check className="mr-2 h-4 w-4"/> Completed
                             </Button>
                         ) : (
                             <Button onClick={() => setIsCompleteDialogOpen(true)}>
                                Complete Consultation
                             </Button>
                         )}
                    </div>
                </div>

                <ScrollArea className="flex-1 p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="dark:bg-neutral-900/50">
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <FileText className="h-4 w-4"/> Reason for Visit & Notes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {selectedAppointment.notes || "No notes provided for this appointment."}
                                    </p>
                                    <Separator className="my-4"/>
                                    <Label>Add Clinical Note</Label>
                                    <Textarea placeholder="Type findings here..." className="mt-2" />
                                </CardContent>
                            </Card>

                            <Card className="dark:bg-neutral-900/50">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <DollarSign className="h-4 w-4"/> Claims & Billing
                                    </CardTitle>
                                    <Button size="sm" variant="secondary" onClick={() => setIsClaimModalOpen(true)}>
                                        Create Claim
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {appointmentClaims.length > 0 ? appointmentClaims.map(claim => (
                                            <div key={claim.id} className="flex items-center justify-between p-3 border rounded-lg bg-background">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm">Ref: {claim.claimReferenceNumber}</span>
                                                    <span className="text-xs text-muted-foreground">Submitted: {new Date(claim.submissionDate).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <span className="block font-bold text-sm">${claim.totalBillAmount}</span>
                                                        <span className="text-xs text-muted-foreground">Billed</span>
                                                    </div>
                                                    <Badge className={
                                                        claim.status === 'APPROVED' ? 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200' :
                                                        claim.status === 'REJECTED' ? 'bg-red-100 text-red-700 hover:bg-red-200 border-red-200' :
                                                        'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200'
                                                    }>
                                                        {claim.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="text-center py-6 text-sm text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                                                No insurance claims filed for this visit yet.
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card className="border-l-4 border-l-blue-500 shadow-sm dark:bg-neutral-900/50">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                                        Insurance Coverage
                                        {patientPolicies.length > 0 ? (
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {patientPolicies.length > 0 ? (
                                        <div className="space-y-3">
                                            {patientPolicies.map(policy => (
                                                <div key={policy.id} className={`p-3 rounded-md border ${policy.isPrimary ? "bg-blue-50/50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-900" : "bg-muted/30"}`}>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <ShieldCheck className="h-4 w-4 text-blue-600" />
                                                        <span className="font-semibold text-sm">{policy.provider?.providerName}</span>
                                                    </div>
                                                    <div className="text-xs space-y-1 text-muted-foreground">
                                                        <p>Policy #: <span className="font-mono text-foreground">{policy.policyNumber}</span></p>
                                                        {policy.isPrimary && (
                                                            <Badge variant="secondary" className="mt-2 text-[10px] h-5 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">Primary Payer</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                                            <ShieldAlert className="h-8 w-8 text-red-400" />
                                            <p className="text-sm font-medium">No Active Policy Found</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                             <Card className="dark:bg-neutral-900/50">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Last Recorded Vitals</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-2 bg-muted/40 rounded"><p className="text-xs text-muted-foreground">BP</p><p className="font-bold">120/80</p></div>
                                        <div className="p-2 bg-muted/40 rounded"><p className="text-xs text-muted-foreground">Heart Rate</p><p className="font-bold">72 bpm</p></div>
                                    </div>
                                </CardContent>
                             </Card>
                        </div>
                    </div>
                </ScrollArea>
            </>
        ) : (
            <div className="flex h-full flex-col items-center justify-center text-muted-foreground bg-muted/10">
                <User className="h-12 w-12 opacity-20 mb-4" />
                <p>Select an appointment to view details.</p>
            </div>
        )}
      </div>

      {/* --- MODAL: Add Appointment with Searchable Patient List --- */}
      <Dialog open={isAddApptModalOpen} onOpenChange={setIsAddApptModalOpen}>
        <DialogContent className="sm:max-w-[425px] overflow-visible">
            <DialogHeader>
                <DialogTitle>Create New Appointment</DialogTitle>
                <DialogDescription>
                    Search and select a patient to schedule a visit.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid gap-2 flex flex-col">
                    <Label htmlFor="patient">Patient</Label>
                    
                    {/* Searchable Combobox */}
                    <Popover open={openPatientCombo} onOpenChange={setOpenPatientCombo}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openPatientCombo}
                                className="w-full justify-between"
                            >
                                {newApptData.patientId
                                    ? allPatients.find((patient) => patient.id.toString() === newApptData.patientId)?.firstName + " " + allPatients.find((patient) => patient.id.toString() === newApptData.patientId)?.lastName
                                    : "Select patient..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0">
                            <Command>
                                <CommandInput placeholder="Search patient name or ID..." />
                                <CommandList>
                                    <CommandEmpty>No patient found.</CommandEmpty>
                                    <CommandGroup>
                                        {allPatients.map((patient) => (
                                            <CommandItem
                                                key={patient.id}
                                                value={`${patient.firstName} ${patient.lastName} ${patient.id}`}
                                                onSelect={() => {
                                                    setNewApptData({...newApptData, patientId: patient.id.toString()});
                                                    setOpenPatientCombo(false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        newApptData.patientId === patient.id.toString() ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                <div className="flex flex-col">
                                                    <span>{patient.firstName} {patient.lastName}</span>
                                                    <span className="text-xs text-muted-foreground">ID: {patient.id} | {patient.email}</span>
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="datetime">Date & Time</Label>
                    <Input 
                        id="datetime" 
                        type="datetime-local" 
                        onChange={(e) => setNewApptData({...newApptData, dateTime: e.target.value})}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="notes">Initial Notes</Label>
                    <Textarea 
                        id="notes" 
                        placeholder="Reason for visit..."
                        onChange={(e) => setNewApptData({...newApptData, notes: e.target.value})}
                    />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddApptModalOpen(false)}>Cancel</Button>
                <Button onClick={handleAddAppointment} disabled={!newApptData.patientId || !newApptData.dateTime}>
                    Schedule
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- MODAL: Reschedule Appointment --- */}
      <Dialog open={isRescheduleModalOpen} onOpenChange={setIsRescheduleModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Reschedule Appointment</DialogTitle>
                <DialogDescription>
                    Choose a new time for {selectedAppointment?.patient?.firstName}'s visit.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <Label htmlFor="reschedule-time">New Date & Time</Label>
                    <Input 
                        id="reschedule-time" 
                        type="datetime-local"
                        value={rescheduleData.dateTime} 
                        onChange={(e) => setRescheduleData({ dateTime: e.target.value })}
                    />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsRescheduleModalOpen(false)}>Cancel</Button>
                <Button onClick={handleReschedule} disabled={!rescheduleData.dateTime}>
                    Confirm Reschedule
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- MODAL: Create Insurance Claim --- */}
      <Dialog open={isClaimModalOpen} onOpenChange={setIsClaimModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Submit Insurance Claim</DialogTitle>
                <DialogDescription>Create a new claim.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                {patientPolicies.length === 0 && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-200 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4"/>
                        Warning: No insurance policies on file.
                    </div>
                )}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="policy" className="text-right">Policy</Label>
                    <Select 
                        onValueChange={(val) => setNewClaimData({...newClaimData, policyId: val})}
                        disabled={patientPolicies.length === 0}
                    >
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select Policy" />
                        </SelectTrigger>
                        <SelectContent>
                            {patientPolicies.map(p => (
                                <SelectItem key={p.id} value={p.id.toString()}>
                                    {p.provider?.providerName} ({p.policyNumber})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amount" className="text-right">Total Bill</Label>
                    <div className="col-span-3 relative">
                        <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            id="amount" 
                            type="number" 
                            className="pl-8" 
                            placeholder="0.00"
                            value={newClaimData.amount}
                            onChange={(e) => setNewClaimData({...newClaimData, amount: e.target.value})}
                        />
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsClaimModalOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmitClaim} disabled={patientPolicies.length === 0 || !newClaimData.policyId || !newClaimData.amount}>
                    Submit Claim
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- ALERT DIALOG: Complete Consultation Confirmation --- */}
      <AlertDialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Complete Consultation?</AlertDialogTitle>
                <AlertDialogDescription>
                    This will mark the appointment as completed and finalize the visit. 
                    Ensure all clinical notes and claims are added before proceeding.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleCompleteConsultation}>
                    Complete Consultation
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}