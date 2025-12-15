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
  ChevronsUpDown,
  ArrowLeft,
  MoreVertical,
  Activity
} from "lucide-react";
import { toast } from "sonner"; 

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
} from "@/components/ui/alert-dialog"; 
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
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false); 
  
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

      const payload = {
          id: selectedAppointment.id,
          appointmentTime: selectedAppointment.appointmentTime,
          status: "Completed",
          notes: selectedAppointment.notes
      };

      try {
          await api.put(`/appointments/${selectedAppointment.id}`, payload);
          
          await refreshAppointments();
          setIsCompleteDialogOpen(false);
          toast.success("Consultation completed successfully");

      } catch (error) {
          console.warn("Update request threw error, verifying data integrity...");
          try {
              const verifyRes = await api.get(`/appointments/${selectedAppointment.id}`);
              const freshData = verifyRes.data;

              if (freshData && freshData.status === "Completed") {
                  await refreshAppointments(); 
                  setIsCompleteDialogOpen(false);
                  toast.success("Consultation completed successfully");
                  return; 
              }
          } catch (verifyErr) {
              console.error("Verification check failed", verifyErr);
          }

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
    // MAIN CONTAINER: Gradient Background matches dashboard
    <div className="flex h-[calc(100vh-4rem)] w-full bg-gradient-to-br from-slate-100 via-blue-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 animate-in fade-in duration-500 overflow-hidden">
      
      {/* --- LEFT SIDEBAR --- */}
      {/* Logic: Hidden on mobile if an appointment is selected, visible otherwise. Always visible on desktop. */}
      <div className={cn(
          "w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl flex-col transition-all duration-300",
          selectedAppointment ? "hidden md:flex" : "flex"
      )}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Appointments</h2>
                <Button size="icon" variant="ghost" onClick={() => setIsAddApptModalOpen(true)} className="hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <Plus className="h-5 w-5" />
                </Button>
            </div>
            <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                    type="search" 
                    placeholder="Search patients..." 
                    className="pl-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500" 
                />
            </div>
        </div>
        
        <ScrollArea className="flex-1">
            <div className="flex flex-col gap-2 p-3">
                {appointments.length > 0 ? appointments.map((appt) => (
                    <button
                        key={appt.id}
                        onClick={() => handleSelectAppointment(appt)}
                        className={cn(
                            "group flex flex-col items-start gap-2 rounded-xl p-4 text-left text-sm transition-all duration-200 border",
                            selectedAppointment?.id === appt.id 
                                ? "bg-white dark:bg-slate-800 border-blue-500 shadow-md ring-1 ring-blue-500/20" 
                                : "bg-white/40 dark:bg-slate-900/40 border-transparent hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm"
                        )}
                    >
                        <div className="flex w-full flex-col gap-1">
                            <div className="flex items-center justify-between w-full">
                                <span className={cn(
                                    "font-semibold text-base",
                                    selectedAppointment?.id === appt.id ? "text-blue-700 dark:text-blue-300" : "text-slate-700 dark:text-slate-200"
                                )}>
                                    {appt.patient?.firstName} {appt.patient?.lastName}
                                </span>
                                <span className="text-xs font-medium text-slate-400">
                                    {new Date(appt.appointmentTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                <Calendar className="h-3 w-3" />
                                {new Date(appt.appointmentTime).toLocaleDateString()}
                            </div>
                            
                            <div className="flex items-center justify-between w-full mt-2">
                                <StatusBadge status={appt.status} size="sm" />
                                <ChevronRight className={cn(
                                    "h-4 w-4 text-slate-300 transition-transform",
                                    selectedAppointment?.id === appt.id ? "text-blue-500 translate-x-1" : "group-hover:translate-x-1"
                                )} />
                            </div>
                        </div>
                    </button>
                )) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground h-40">
                         <Calendar className="h-8 w-8 mb-2 opacity-20" />
                        <p>No upcoming appointments.</p>
                    </div>
                )}
            </div>
        </ScrollArea>
      </div>

      {/* --- RIGHT MAIN CONTENT --- */}
      {/* Logic: Hidden on mobile if NO appointment is selected. Always visible on desktop. */}
      <div className={cn(
          "flex-1 flex-col overflow-hidden bg-slate-50/50 dark:bg-slate-950/50",
          selectedAppointment ? "flex" : "hidden md:flex"
      )}>
        {selectedAppointment ? (
            <>
                {/* Header Card */}
                <div className="flex flex-col border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/90 backdrop-blur-sm z-10 shadow-sm">
                    {/* Mobile Back Button Row */}
                    <div className="md:hidden flex items-center p-2 border-b border-slate-100 dark:border-slate-800">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedAppointment(null)} className="text-slate-500">
                            <ArrowLeft className="h-4 w-4 mr-1" /> Back to list
                        </Button>
                    </div>

                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 md:p-6 gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-slate-800 border border-blue-200 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-xl shadow-inner">
                                {selectedAppointment.patient?.firstName?.[0]}{selectedAppointment.patient?.lastName?.[0]}
                            </div>
                            <div>
                                <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
                                    {selectedAppointment.patient?.firstName} {selectedAppointment.patient?.lastName}
                                </h1>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                        <User className="h-3 w-3"/> ID: #{selectedAppointment.patient?.id}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5 text-blue-500"/> 
                                        {new Date(selectedAppointment.appointmentTime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                             <Button 
                                variant="outline" 
                                className="flex-1 md:flex-none border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                                onClick={() => {
                                    setRescheduleData({ dateTime: selectedAppointment.appointmentTime });
                                    setIsRescheduleModalOpen(true);
                                }}
                                disabled={selectedAppointment.status === "Completed"}
                             >
                                Reschedule
                             </Button>

                             {selectedAppointment.status === "Completed" ? (
                                 <Button disabled className="flex-1 md:flex-none bg-green-600 text-white opacity-90">
                                    <Check className="mr-2 h-4 w-4"/> Completed
                                 </Button>
                             ) : (
                                 <Button 
                                    className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                                    onClick={() => setIsCompleteDialogOpen(true)}
                                 >
                                    Complete Visit
                                 </Button>
                             )}
                        </div>
                    </div>
                </div>

                <ScrollArea className="flex-1 p-4 md:p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                        
                        {/* Left Column: Notes & Billing */}
                        <div className="lg:col-span-2 space-y-6">
                            
                            {/* Clinical Notes Card */}
                            <Card className="border-0 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 bg-white dark:bg-slate-900/60">
                                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/50">
                                    <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                                        <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-md text-indigo-600 dark:text-indigo-400">
                                            <FileText className="h-4 w-4"/> 
                                        </div>
                                        Clinical Notes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800 mb-4">
                                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Reason for Visit</span>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                            {selectedAppointment.notes || "No initial notes provided."}
                                        </p>
                                    </div>
                                    <Label className="text-slate-600 dark:text-slate-400 mb-2 block">Doctor's Findings</Label>
                                    <Textarea 
                                        placeholder="Type clinical findings, diagnosis, and prescription details here..." 
                                        className="min-h-[120px] resize-none bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500" 
                                    />
                                </CardContent>
                            </Card>

                            {/* Billing Card */}
                            <Card className="border-0 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 bg-white dark:bg-slate-900/60">
                                <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/50">
                                    <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                                        <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-md text-emerald-600 dark:text-emerald-400">
                                            <DollarSign className="h-4 w-4"/> 
                                        </div>
                                        Claims & Billing
                                    </CardTitle>
                                    <Button size="sm" variant="outline" onClick={() => setIsClaimModalOpen(true)} className="h-8 text-xs border-dashed border-slate-300 dark:border-slate-700">
                                        <Plus className="h-3 w-3 mr-1"/> New Claim
                                    </Button>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <div className="space-y-3">
                                        {appointmentClaims.length > 0 ? appointmentClaims.map(claim => (
                                            <div key={claim.id} className="flex items-center justify-between p-3.5 border border-slate-100 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950/30 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">Ref: {claim.claimReferenceNumber}</span>
                                                    </div>
                                                    <span className="text-xs text-slate-500 dark:text-slate-400">Submitted: {new Date(claim.submissionDate).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                     <span className="font-bold text-sm text-slate-900 dark:text-slate-100">${claim.totalBillAmount}</span>
                                                     <StatusBadge status={claim.status} size="xs" />
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="text-center py-8 text-sm text-slate-400 bg-slate-50 dark:bg-slate-900/30 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
                                                No insurance claims filed for this visit yet.
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column: Info Widgets */}
                        <div className="space-y-6">
                            
                            {/* Insurance Card */}
                            <Card className="border-0 border-t-4 border-t-blue-500 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden">
                                <CardHeader className="pb-3 bg-blue-50/20 dark:bg-blue-900/10">
                                    <CardTitle className="text-sm font-bold flex items-center justify-between text-slate-800 dark:text-slate-100">
                                        Insurance Coverage
                                        {patientPolicies.length > 0 ? (
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    {patientPolicies.length > 0 ? (
                                        <div className="space-y-3">
                                            {patientPolicies.map(policy => (
                                                <div key={policy.id} className={cn(
                                                    "p-3 rounded-lg border transition-all",
                                                    policy.isPrimary 
                                                        ? "bg-blue-50/50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800" 
                                                        : "bg-slate-50/50 border-slate-100 dark:bg-slate-900/30 dark:border-slate-800"
                                                )}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="p-1 bg-white dark:bg-slate-800 rounded-md shadow-sm">
                                                            <ShieldCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate">{policy.provider?.providerName}</span>
                                                    </div>
                                                    <div className="text-xs space-y-1 text-slate-500 dark:text-slate-400">
                                                        <p className="flex justify-between">
                                                            <span>Policy #:</span> 
                                                            <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{policy.policyNumber}</span>
                                                        </p>
                                                        {policy.isPrimary && (
                                                            <Badge variant="secondary" className="mt-1.5 text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-0">
                                                                Primary Payer
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-6 text-center space-y-2 text-slate-500">
                                            <ShieldAlert className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                                            <p className="text-xs">No Active Policy Found</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                             {/* Vitals Widget */}
                             <Card className="border-0 border-t-4 border-t-rose-500 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 bg-white dark:bg-slate-900/60">
                                <CardHeader className="pb-3 bg-rose-50/20 dark:bg-rose-900/10">
                                    <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                        <Activity className="h-4 w-4 text-rose-500"/>
                                        Last Recorded Vitals
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800">
                                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">BP</p>
                                            <p className="font-bold text-lg text-slate-800 dark:text-slate-200">120/80</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800">
                                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Heart Rate</p>
                                            <p className="font-bold text-lg text-slate-800 dark:text-slate-200">72 <span className="text-xs font-normal text-slate-500">bpm</span></p>
                                        </div>
                                    </div>
                                </CardContent>
                             </Card>
                        </div>
                    </div>
                </ScrollArea>
            </>
        ) : (
            <div className="flex h-full flex-col items-center justify-center text-slate-400 bg-slate-50/50 dark:bg-slate-950/50 p-6 text-center">
                <div className="h-20 w-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <User className="h-10 w-10 text-slate-300 dark:text-slate-700" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">No Appointment Selected</h3>
                <p className="text-sm max-w-xs mt-1">Select a patient from the list on the left to view details, notes, and billing info.</p>
            </div>
        )}
      </div>

      {/* --- MODAL: Add Appointment --- */}
      <Dialog open={isAddApptModalOpen} onOpenChange={setIsAddApptModalOpen}>
        <DialogContent className="sm:max-w-[425px] overflow-visible bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <DialogHeader>
                <DialogTitle>New Appointment</DialogTitle>
                <DialogDescription>
                    Search and select a patient to schedule a visit.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-5 py-4">
                <div className="flex flex-col gap-2">
                    <Label className="text-slate-600 dark:text-slate-400">Patient</Label>
                    <Popover open={openPatientCombo} onOpenChange={setOpenPatientCombo}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openPatientCombo}
                                className="w-full justify-between bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                            >
                                {newApptData.patientId
                                    ? allPatients.find((patient) => patient.id.toString() === newApptData.patientId)?.firstName + " " + allPatients.find((patient) => patient.id.toString() === newApptData.patientId)?.lastName
                                    : "Select patient..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                            <Command className="dark:bg-slate-900">
                                <CommandInput placeholder="Search patient..." className="dark:bg-slate-900" />
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
                                                className="aria-selected:bg-blue-50 dark:aria-selected:bg-blue-900/20"
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4 text-blue-600",
                                                        newApptData.patientId === patient.id.toString() ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-800 dark:text-slate-200">{patient.firstName} {patient.lastName}</span>
                                                    <span className="text-xs text-slate-500">ID: {patient.id}</span>
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
                    <Label className="text-slate-600 dark:text-slate-400">Date & Time</Label>
                    <Input 
                        type="datetime-local" 
                        className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                        onChange={(e) => setNewApptData({...newApptData, dateTime: e.target.value})}
                    />
                </div>
                <div className="grid gap-2">
                    <Label className="text-slate-600 dark:text-slate-400">Initial Notes</Label>
                    <Textarea 
                        placeholder="Reason for visit..."
                        className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                        onChange={(e) => setNewApptData({...newApptData, notes: e.target.value})}
                    />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddApptModalOpen(false)}>Cancel</Button>
                <Button onClick={handleAddAppointment} className="bg-blue-600 hover:bg-blue-700" disabled={!newApptData.patientId || !newApptData.dateTime}>
                    Schedule
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- MODAL: Reschedule --- */}
      <Dialog open={isRescheduleModalOpen} onOpenChange={setIsRescheduleModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <DialogHeader>
                <DialogTitle>Reschedule Appointment</DialogTitle>
                <DialogDescription>
                    Choose a new time for {selectedAppointment?.patient?.firstName}'s visit.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Label className="mb-2 block text-slate-600 dark:text-slate-400">New Date & Time</Label>
                <Input 
                    type="datetime-local"
                    value={rescheduleData.dateTime} 
                    className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                    onChange={(e) => setRescheduleData({ dateTime: e.target.value })}
                />
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsRescheduleModalOpen(false)}>Cancel</Button>
                <Button onClick={handleReschedule} disabled={!rescheduleData.dateTime} className="bg-blue-600 hover:bg-blue-700">
                    Confirm
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- MODAL: Create Claim --- */}
      <Dialog open={isClaimModalOpen} onOpenChange={setIsClaimModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <DialogHeader>
                <DialogTitle>Submit Claim</DialogTitle>
                <DialogDescription>Create a new insurance claim.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                {patientPolicies.length === 0 && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-sm border border-red-200 dark:border-red-900 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4"/>
                        <span>Warning: No insurance policies on file.</span>
                    </div>
                )}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right text-slate-600 dark:text-slate-400">Policy</Label>
                    <Select 
                        onValueChange={(val) => setNewClaimData({...newClaimData, policyId: val})}
                        disabled={patientPolicies.length === 0}
                    >
                        <SelectTrigger className="col-span-3 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                            <SelectValue placeholder="Select Policy" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                            {patientPolicies.map(p => (
                                <SelectItem key={p.id} value={p.id.toString()}>
                                    {p.provider?.providerName} ({p.policyNumber})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right text-slate-600 dark:text-slate-400">Amount</Label>
                    <div className="col-span-3 relative">
                        <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input 
                            type="number" 
                            className="pl-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800" 
                            placeholder="0.00"
                            value={newClaimData.amount}
                            onChange={(e) => setNewClaimData({...newClaimData, amount: e.target.value})}
                        />
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsClaimModalOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmitClaim} className="bg-green-600 hover:bg-green-700 text-white" disabled={patientPolicies.length === 0 || !newClaimData.policyId || !newClaimData.amount}>
                    Submit Claim
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- CONFIRM DIALOG --- */}
      <AlertDialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <AlertDialogHeader>
                <AlertDialogTitle>Complete Consultation?</AlertDialogTitle>
                <AlertDialogDescription>
                    This will mark the appointment as completed. Ensure all notes and claims are finalized.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel className="border-slate-200 dark:border-slate-800">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleCompleteConsultation} className="bg-blue-600 hover:bg-blue-700">
                    Complete
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}

// --- Helper Components ---

function StatusBadge({ status, size = "default" }) {
    let className = "";
    const sizeClass = size === "xs" ? "text-[10px] h-5 px-1.5" : size === "sm" ? "text-xs h-6" : "";

    switch(status) {
        case "Confirmed":
        case "Scheduled":
            className = "bg-green-100/50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800";
            break;
        case "Pending":
        case "PENDING":
            className = "bg-amber-100/50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800";
            break;
        case "Completed":
        case "APPROVED":
            className = "bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800";
            break;
        case "REJECTED":
        case "Cancelled":
            className = "bg-red-100/50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800";
            break;
        default:
            className = "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700";
    }
    return <Badge variant="outline" className={`${className} border transition-colors shadow-sm ${sizeClass}`}>{status || "Unknown"}</Badge>;
}