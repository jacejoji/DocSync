/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { 
  Users, 
  Network, 
  Plus, 
  Search, 
  MoreHorizontal, 
  FileText, 
  Trash2, 
  Pencil, 
  Mail, 
  Phone, 
  Briefcase, 
  Loader2 
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

import OrgChart from "./OrgChart";

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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export default function Workforce() {
  const [activeTab, setActiveTab] = useState("directory");
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null); // For Profile Sheet
  const [doctorProfile, setDoctorProfile] = useState(null); // Fetched profile details
  
  // Search
  const [searchTerm, setSearchTerm] = useState("");

  // Dialog States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({});

  // --- API Actions ---

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const response = await api.get("/doctor");
      setDoctors(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error("Failed to load doctor directory.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorProfile = async (id) => {
    try {
      // GET /doctorprofile/{id}
      const response = await api.get(`/doctorprofile/${id}`);
      setDoctorProfile(response.data);
    } catch (error) {
      setDoctorProfile(null); // No extra profile found
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // --- Handlers ---

  const handleSave = async () => {
    if(!formData.firstName || !formData.lastName) {
        toast.error("Name is required");
        return;
    }
    setIsSaving(true);
    try {
        if(formData.id) {
            await api.put(`/doctor/${formData.id}`, formData);
            toast.success("Doctor updated.");
        } else {
            await api.post("/doctor", formData);
            toast.success("Doctor added.");
        }
        setIsDialogOpen(false);
        fetchDoctors();
    } catch (error) {
        toast.error("Failed to save doctor.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
      if(!confirm("Are you sure? This cannot be undone.")) return;
      try {
          await api.delete(`/doctor/${id}`);
          toast.success("Doctor deleted.");
          fetchDoctors();
      } catch(e) { toast.error("Delete failed."); }
  };

  const openProfile = (doc) => {
      setSelectedDoctor(doc);
      setDoctorProfile(null); // Reset prev profile
      fetchDoctorProfile(doc.id);
      setIsSheetOpen(true);
  };

  // --- Helpers ---
  const getInitials = (f, l) => `${f?.charAt(0) || ""}${l?.charAt(0) || ""}`;
  const filteredDoctors = doctors.filter(d => 
    (d.firstName + " " + d.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-8 pt-6 animate-in fade-in duration-500 h-[calc(100vh-65px)]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Workforce</h2>
          <p className="text-muted-foreground">Manage doctor directory and organizational hierarchy.</p>
        </div>
        <div className="flex items-center gap-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[300px]">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="directory"><Users className="h-4 w-4 mr-2"/> Directory</TabsTrigger>
                    <TabsTrigger value="chart"><Network className="h-4 w-4 mr-2"/> Org Chart</TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
      </div>

      {/* --- TAB 1: DIRECTORY --- */}
      {activeTab === "directory" && (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search doctors..." 
                        className="pl-8" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button onClick={() => { setFormData({}); setIsDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Doctor
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Doctor</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Specialization</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? <TableRow><TableCell colSpan={6} className="h-24 text-center"><Loader2 className="animate-spin inline mr-2"/> Loading...</TableCell></TableRow> :
                         filteredDoctors.map(doc => (
                            <TableRow key={doc.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarFallback className="bg-blue-100 text-blue-700">
                                                {getInitials(doc.firstName, doc.lastName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{doc.firstName} {doc.lastName}</span>
                                            <span className="text-xs text-muted-foreground">ID: {doc.id}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col text-sm">
                                        <span className="flex items-center gap-1 text-muted-foreground"><Mail className="h-3 w-3"/> {doc.email}</span>
                                        <span className="flex items-center gap-1 text-muted-foreground"><Phone className="h-3 w-3"/> {doc.phone}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{doc.department?.name || "-"}</TableCell>
                                <TableCell><Badge variant="outline">{doc.specialization}</Badge></TableCell>
                                <TableCell>
                                    <Badge variant={doc.status === "Active" ? "default" : "secondary"} className={doc.status === "Active" ? "bg-green-600" : ""}>
                                        {doc.status || "Active"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4"/></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => openProfile(doc)}>
                                                <FileText className="mr-2 h-4 w-4" /> View Profile
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => { setFormData(doc); setIsDialogOpen(true); }}>
                                                <Pencil className="mr-2 h-4 w-4" /> Edit Details
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(doc.id)}>
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
      )}

      {/* --- TAB 2: ORG CHART (Cleaned up) --- */}
      {activeTab === "chart" && (
        <OrgChart />
      )}

      {/* --- DIALOG: ADD/EDIT DOCTOR --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
            <DialogHeader><DialogTitle>{formData.id ? "Edit Doctor" : "Add New Doctor"}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label>First Name</Label>
                        <Input value={formData.firstName || ""} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Last Name</Label>
                        <Input value={formData.lastName || ""} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label>Email</Label>
                        <Input value={formData.email || ""} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Phone</Label>
                        <Input value={formData.phone || ""} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label>Specialization</Label>
                    <Input value={formData.specialization || ""} onChange={e => setFormData({...formData, specialization: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label>Status</Label>
                        <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="On Leave">On Leave</SelectItem>
                                <SelectItem value="Inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label>Hire Date</Label>
                        <Input type="date" value={formData.hireDate || ""} onChange={e => setFormData({...formData, hireDate: e.target.value})} />
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={isSaving}>Save</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- SHEET: VIEW PROFILE --- */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
            {selectedDoctor && (
                <>
                    <SheetHeader className="mb-6">
                        <SheetTitle>Doctor Profile</SheetTitle>
                        <SheetDescription>Detailed records for Dr. {selectedDoctor.lastName}</SheetDescription>
                    </SheetHeader>
                    
                    <div className="flex flex-col items-center mb-6">
                        <Avatar className="h-24 w-24 mb-4">
                            <AvatarFallback className="text-2xl bg-blue-100 text-blue-700">
                                {getInitials(selectedDoctor.firstName, selectedDoctor.lastName)}
                            </AvatarFallback>
                        </Avatar>
                        <h3 className="text-2xl font-bold">{selectedDoctor.firstName} {selectedDoctor.lastName}</h3>
                        <p className="text-muted-foreground">{selectedDoctor.specialization}</p>
                        <Badge className="mt-2">{selectedDoctor.status || "Active"}</Badge>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Contact Information</h4>
                            <div className="grid gap-3 text-sm">
                                <div className="flex items-center gap-3">
                                    <Mail className="h-4 w-4 text-muted-foreground" /> {selectedDoctor.email}
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 text-muted-foreground" /> {selectedDoctor.phone}
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Professional Details</h4>
                            <div className="grid gap-3 text-sm">
                                <div className="flex items-center gap-3">
                                    <Briefcase className="h-4 w-4 text-muted-foreground" /> 
                                    Department: {selectedDoctor.department?.name || "Unassigned"}
                                </div>
                                <div className="flex items-center gap-3">
                                    <Search className="h-4 w-4 text-muted-foreground" /> 
                                    Specialty: {selectedDoctor.specialization}
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Extended Profile</h4>
                            {doctorProfile ? (
                                <div className="space-y-4 text-sm">
                                    <div>
                                        <span className="font-semibold block mb-1">Bio:</span>
                                        <p className="text-muted-foreground leading-relaxed">{doctorProfile.bio || "No bio available."}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">Experience:</span>
                                        {doctorProfile.experienceYears} Years
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                        <span>{doctorProfile.address}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-muted/30 p-4 rounded-md text-center text-sm text-muted-foreground">
                                    No extended profile data found.
                                    <Button variant="link" size="sm" className="ml-2 h-auto p-0">Add Profile</Button>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </SheetContent>
      </Sheet>

    </div>
  );
}