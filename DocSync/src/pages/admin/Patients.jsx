import React, { useState, useEffect, useRef } from "react";
// import { format } from "date-fns";
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Upload, 
  Download, 
  FileSpreadsheet, 
  Loader2, 
  User,
  Phone,
  MapPin,
  AlertCircle
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Dialog States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCsvDialogOpen, setIsCsvDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // File Upload Ref
  const fileInputRef = useRef(null);
  const [csvStats, setCsvStats] = useState({ total: 0, preview: [] });

  // Form State
  const initialFormState = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "Male",
    bloodGroup: "",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: ""
  };
  const [formData, setFormData] = useState(initialFormState);

  // --- API Actions ---

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/patients");
      setPatients(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error("Failed to load patient directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // --- CRUD Handlers ---

  const handleSave = async () => {
    if(!formData.firstName || !formData.phone) {
      toast.error("First Name and Phone Number are required.");
      return;
    }

    setIsSaving(true);
    try {
      if (currentId) {
        // UPDATE
        await api.put(`/api/patients/${currentId}`, formData);
        toast.success("Patient details updated.");
      } else {
        // CREATE
        await api.post("/api/patients", formData);
        toast.success("New patient registered.");
      }
      setIsDialogOpen(false);
      resetForm();
      fetchPatients();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save patient record.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if(!confirm("Are you sure you want to delete this patient record?")) return;
    try {
      await api.delete(`/api/patients/${id}`);
      toast.success("Patient record deleted.");
      fetchPatients();
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error("Failed to delete patient.");
    }
  };

  // --- CSV Processing Logic ---

  const handleCsvFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      processCSV(text);
    };
    reader.readAsText(file);
  };

  const processCSV = (csvText) => {
    const lines = csvText.split("\n");
    const headers = lines[0].split(",").map(h => h.trim());
    
    const parsedData = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      // FIX: Use Regex to split by comma ONLY if not inside quotes
      const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      
      const obj = {};

      headers.forEach((header, index) => {
        // Clean quotes around the value
        let val = values[index]?.trim().replace(/^"|"$/g, '') || "";
        obj[header] = val;
      });

      // Basic validation
      if(obj.firstName) {
          parsedData.push(obj);
      }
    }

    setCsvStats({ total: parsedData.length, preview: parsedData });
  };

  const handleBulkUpload = async () => {
    if (csvStats.preview.length === 0) return;

    setIsSaving(true);
    try {
      // POST /api/patients/batch
      await api.post("/api/patients/batch", csvStats.preview);
      toast.success(`Successfully imported ${csvStats.total} patients.`);
      setIsCsvDialogOpen(false);
      fetchPatients();
    } catch (error) {
      console.error(error);
      toast.error("Bulk upload failed. Please check your CSV format.");
    } finally {
      setIsSaving(false);
      setCsvStats({ total: 0, preview: [] });
      if(fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const downloadTemplate = () => {
    const headers = "firstName,lastName,email,phone,dateOfBirth,gender,address,bloodGroup,emergencyContactName,emergencyContactPhone";
    const sample = "John,Doe,john@example.com,9876543210,1990-01-01,Male,123 Street NY,O+,Jane Doe,9876543211";
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + sample;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "patient_import_template.csv");
    document.body.appendChild(link);
    link.click();
  };

  // --- Helpers ---

  const resetForm = () => {
    setCurrentId(null);
    setFormData(initialFormState);
  };

  const openEdit = (patient) => {
    setCurrentId(patient.id);
    setFormData({
        firstName: patient.firstName || "",
        lastName: patient.lastName || "",
        email: patient.email || "",
        phone: patient.phone || "",
        dateOfBirth: patient.dateOfBirth || "",
        gender: patient.gender || "Male",
        bloodGroup: patient.bloodGroup || "",
        address: patient.address || "",
        emergencyContactName: patient.emergencyContactName || "",
        emergencyContactPhone: patient.emergencyContactPhone || ""
    });
    setIsDialogOpen(true);
  };

  const filteredPatients = patients.filter(p => 
    (p.firstName?.toLowerCase() + " " + p.lastName?.toLowerCase()).includes(searchTerm.toLowerCase()) ||
    p.phone?.includes(searchTerm)
  );

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-8 pt-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Patient Directory</h2>
          <p className="text-muted-foreground">Manage patient registrations and records.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsCsvDialogOpen(true)}>
                <FileSpreadsheet className="mr-2 h-4 w-4" /> Bulk Import
            </Button>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" /> Add Patient
            </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or phone..." 
              className="pl-8 bg-background" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm text-muted-foreground hidden md:block">
            Total Records: {patients.length}
          </div>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient Name</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Demographics</TableHead>
              <TableHead>Blood Group</TableHead>
              <TableHead>Emergency Contact</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow><TableCell colSpan={6} className="h-24 text-center"><Loader2 className="animate-spin inline mr-2"/> Loading...</TableCell></TableRow>
            ) : filteredPatients.length === 0 ? (
               <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No patients found.</TableCell></TableRow>
            ) : (
                filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-100">
                                    {patient.firstName?.charAt(0)}{patient.lastName?.charAt(0)}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium">{patient.firstName} {patient.lastName}</span>
                                    <span className="text-xs text-muted-foreground">ID: #{patient.id}</span>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-col text-sm">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                    <Phone className="h-3 w-3" /> {patient.phone}
                                </div>
                                <span className="text-xs">{patient.email}</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="text-sm">
                                {patient.gender}, {patient.dateOfBirth ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : "?"} yrs
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant="outline" className="text-red-600 bg-red-50 border-red-100 font-bold">
                                {patient.bloodGroup || "N/A"}
                            </Badge>
                        </TableCell>
                        <TableCell>
                             <div className="flex flex-col text-sm">
                                <span className="font-medium">{patient.emergencyContactName || "-"}</span>
                                <span className="text-xs text-muted-foreground">{patient.emergencyContactPhone}</span>
                            </div>
                        </TableCell>
                        <TableCell className="text-right">
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => openEdit(patient)}>
                                        <Pencil className="mr-2 h-4 w-4" /> Edit Details
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleDelete(patient.id)} className="text-red-600">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete Record
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- DIALOG: ADD / EDIT PATIENT --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>{currentId ? "Edit Patient" : "Register New Patient"}</DialogTitle>
                <DialogDescription>Enter patient demographics and contact details.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label>First Name <span className="text-red-500">*</span></Label>
                        <Input value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Last Name</Label>
                        <Input value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label>Phone <span className="text-red-500">*</span></Label>
                        <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Email</Label>
                        <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label>Date of Birth</Label>
                        <Input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Gender</Label>
                        <Select value={formData.gender} onValueChange={(val) => setFormData({...formData, gender: val})}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                         <Label>Blood Group</Label>
                         <Select value={formData.bloodGroup} onValueChange={(val) => setFormData({...formData, bloodGroup: val})}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                                    <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label>Address</Label>
                    <Textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                </div>

                <Separator className="my-2" />
                <h4 className="text-sm font-semibold">Emergency Contact</h4>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label>Contact Name</Label>
                        <Input value={formData.emergencyContactName} onChange={(e) => setFormData({...formData, emergencyContactName: e.target.value})} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Contact Phone</Label>
                        <Input value={formData.emergencyContactPhone} onChange={(e) => setFormData({...formData, emergencyContactPhone: e.target.value})} />
                    </div>
                </div>

            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Patient
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* --- DIALOG: BULK IMPORT (CSV) --- */}
      <Dialog open={isCsvDialogOpen} onOpenChange={setIsCsvDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle>Import Patients via CSV</DialogTitle>
                <DialogDescription>Upload a CSV file to add multiple patients at once.</DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-col gap-6 py-4">
                
                {/* Step 1: Template */}
                <div className="bg-muted/40 p-4 rounded-lg border border-dashed flex items-center justify-between">
                    <div className="text-sm">
                        <p className="font-medium">1. Download Template</p>
                        <p className="text-muted-foreground text-xs">Use this format for your data.</p>
                    </div>
                    <Button variant="secondary" size="sm" onClick={downloadTemplate}>
                        <Download className="mr-2 h-4 w-4" /> CSV Template
                    </Button>
                </div>

                {/* Step 2: Upload */}
                <div className="space-y-2">
                    <p className="text-sm font-medium">2. Upload Filled CSV</p>
                    <Input 
                        ref={fileInputRef}
                        type="file" 
                        accept=".csv" 
                        onChange={handleCsvFileChange}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        Supported file: .csv only. Date format: YYYY-MM-DD.
                    </p>
                </div>

                {/* Step 3: Preview Stats */}
                {csvStats.total > 0 && (
                    <Card>
                        <CardContent className="pt-4 flex items-center gap-4">
                             <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <FileSpreadsheet className="h-5 w-5" />
                             </div>
                             <div>
                                <p className="font-bold text-lg">{csvStats.total} Patients</p>
                                <p className="text-sm text-muted-foreground">Ready to import</p>
                             </div>
                        </CardContent>
                    </Card>
                )}

                {csvStats.total === 0 && fileInputRef.current?.value && (
                     <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-md text-sm">
                        <AlertCircle className="h-4 w-4" />
                        No valid data found in file. Check formatting.
                     </div>
                )}
            </div>

            <DialogFooter>
                <Button variant="outline" onClick={() => setIsCsvDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleBulkUpload} disabled={isSaving || csvStats.total === 0}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
                    Upload & Save
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}