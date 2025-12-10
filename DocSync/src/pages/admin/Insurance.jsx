/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { 
  ShieldCheck, 
  FileText, 
  Building2, 
  Search, 
  Plus, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  MoreHorizontal, 
  AlertCircle,
  ExternalLink,
  Edit,
  Trash2
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
import { Label } from "@/components/ui/label";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";

export default function Insurance() {
  const [activeTab, setActiveTab] = useState("claims");
  const [loading, setLoading] = useState(true);
  
  // Data Stores
  const [claims, setClaims] = useState([]);
  const [doctorPolicies, setDoctorPolicies] = useState([]);
  const [providers, setProviders] = useState([]);
  const [doctors, setDoctors] = useState([]); // For dropdowns

  // Dialog States
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false);
  const [isPolicyDialogOpen, setIsPolicyDialogOpen] = useState(false);
  const [isProviderDialogOpen, setIsProviderDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Forms
  const [policyForm, setPolicyForm] = useState({});
  const [providerForm, setProviderForm] = useState({});
  // Claim approval/rejection state
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  // --- API Fetching ---

  const fetchData = async () => {
    setLoading(true);
    try {
      const [claimsRes, policiesRes, providersRes, docRes] = await Promise.all([
        api.get("/insurance-claims"),
        api.get("/doctor-insurance-policies"),
        api.get("/insuranceprovider"),
        api.get("/doctor")
      ]);

      setClaims(Array.isArray(claimsRes.data) ? claimsRes.data : []);
      setDoctorPolicies(Array.isArray(policiesRes.data) ? policiesRes.data : []);
      setProviders(Array.isArray(providersRes.data) ? providersRes.data : []);
      setDoctors(Array.isArray(docRes.data) ? docRes.data : []);
      
    } catch (error) {
      console.error("Error loading insurance data", error);
      toast.error("Failed to load insurance records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Handlers: Claims ---

  const handleApproveClaim = async (claim) => {
    if(!confirm(`Approve claim ${claim.claimReferenceNumber}?`)) return;
    try {
        // Update status to APPROVED
        // NOTE: Your controller uses PUT /{id} with RequestBody. 
        // We need to send the whole object with modified status.
        const updatedClaim = { ...claim, status: "APPROVED", processedDate: new Date().toISOString() };
        await api.put(`/insurance-claims/${claim.id}`, updatedClaim);
        toast.success("Claim approved successfully.");
        fetchData();
    } catch (error) {
        toast.error("Failed to approve claim.");
    }
  };

  const handleRejectClaim = async () => {
    if(!selectedClaim || !rejectionReason) return;
    try {
        const updatedClaim = { 
            ...selectedClaim, 
            status: "REJECTED", 
            rejectionReason: rejectionReason,
            processedDate: new Date().toISOString()
        };
        await api.put(`/insurance-claims/${selectedClaim.id}`, updatedClaim);
        toast.success("Claim rejected.");
        setIsRejectDialogOpen(false);
        setRejectionReason("");
        fetchData();
    } catch (error) {
        toast.error("Failed to reject claim.");
    }
  };

  // --- Handlers: Doctor Policies ---

  const handleSavePolicy = async () => {
    setIsSaving(true);
    try {
        // Construct payload. Ensure provider object is sent correctly based on ID
        const payload = {
            ...policyForm,
            doctor: { id: policyForm.doctorId },
            provider: { id: policyForm.providerId }
        };

        // Check if ID exists for update, else create
        if(policyForm.id) {
            await api.put(`/doctor-insurance-policies/${policyForm.id}`, payload);
        } else {
            await api.post("/doctor-insurance-policies", payload);
        }
        
        toast.success("Policy saved successfully.");
        setIsPolicyDialogOpen(false);
        setPolicyForm({});
        fetchData();
    } catch (error) {
        toast.error("Failed to save policy.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleDeletePolicy = async (id) => {
      if(!confirm("Are you sure?")) return;
      try {
          await api.delete(`/doctor-insurance-policies/${id}`);
          toast.success("Policy removed.");
          fetchData();
      } catch (e) { toast.error("Could not delete policy."); }
  };

  // --- Handlers: Providers ---

  const handleSaveProvider = async () => {
    setIsSaving(true);
    try {
        if(providerForm.id) {
             // Note: Your controller signature for PUT is (Long id, InsuranceProvider details)
             // Check if it accepts ID in path. Your code: @PutMapping("/{id}")
             await api.put(`/insuranceprovider/${providerForm.id}`, providerForm);
        } else {
             await api.post("/insuranceprovider", providerForm);
        }
        toast.success("Provider saved.");
        setIsProviderDialogOpen(false);
        setProviderForm({});
        fetchData();
    } catch (error) {
        toast.error("Failed to save provider.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleDeleteProvider = async (id) => {
    if(!confirm("Delete this provider?")) return;
    try {
        await api.delete(`/insuranceprovider/${id}`);
        toast.success("Provider deleted.");
        fetchData();
    } catch (e) { toast.error("Could not delete provider."); }
  };


  // --- Helpers ---
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0);
  const getDocName = (d) => d ? `${d.firstName} ${d.lastName}` : "Unknown";

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-8 pt-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Insurance Management</h2>
          <p className="text-muted-foreground">Manage claims, employee coverage, and insurance providers.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-[500px]">
            <TabsTrigger value="claims">Claims Processing</TabsTrigger>
            <TabsTrigger value="policies">Doctor Coverage</TabsTrigger>
            <TabsTrigger value="providers">Providers</TabsTrigger>
        </TabsList>

        {/* --- TAB 1: CLAIMS --- */}
        <TabsContent value="claims" className="space-y-4">
            {/* KPI */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Claims</CardTitle>
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{claims.filter(c => c.status === "PENDING").length}</div>
                        <p className="text-xs text-muted-foreground">Awaiting approval</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Claimed Amount</CardTitle>
                        <FileText className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(claims.reduce((acc, c) => acc + (c.claimedAmount || 0), 0))}
                        </div>
                        <p className="text-xs text-muted-foreground">Total value processed</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Settled</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{claims.filter(c => c.status === "APPROVED").length}</div>
                        <p className="text-xs text-muted-foreground">Approved & Processed</p>
                    </CardContent>
                </Card>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Ref #</TableHead>
                            <TableHead>Patient / Policy</TableHead>
                            <TableHead>Appointment</TableHead>
                            <TableHead className="text-right">Claimed</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? <TableRow><TableCell colSpan={6} className="h-24 text-center">Loading...</TableCell></TableRow> : 
                         claims.length === 0 ? <TableRow><TableCell colSpan={6} className="h-24 text-center">No claims found.</TableCell></TableRow> :
                         claims.map(c => (
                            <TableRow key={c.id}>
                                <TableCell className="font-medium">{c.claimReferenceNumber}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">
                                            {c.patientInsurancePolicy?.patient?.firstName} {c.patientInsurancePolicy?.patient?.lastName}
                                        </span>
                                        <span className="text-xs text-muted-foreground">Pol: {c.patientInsurancePolicy?.policyNumber}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-sm">{getDocName(c.appointment?.doctor)}</span>
                                        <span className="text-xs text-muted-foreground">{format(new Date(c.appointment?.appointmentTime || new Date()), "MMM dd, yyyy")}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right font-medium">{formatCurrency(c.claimedAmount)}</TableCell>
                                <TableCell className="text-center">
                                    {c.status === "APPROVED" && <Badge className="bg-green-600">Approved</Badge>}
                                    {c.status === "REJECTED" && <Badge variant="destructive">Rejected</Badge>}
                                    {c.status === "PENDING" && <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">Pending</Badge>}
                                </TableCell>
                                <TableCell className="text-right">
                                    {c.status === "PENDING" && (
                                        <div className="flex justify-end gap-2">
                                            <Button size="icon" variant="ghost" className="text-green-600 h-8 w-8" onClick={() => handleApproveClaim(c)}>
                                                <CheckCircle2 className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="text-red-600 h-8 w-8" onClick={() => { setSelectedClaim(c); setIsRejectDialogOpen(true); }}>
                                                <XCircle className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </TabsContent>

        {/* --- TAB 2: DOCTOR POLICIES --- */}
        <TabsContent value="policies" className="space-y-4">
            <div className="flex justify-between items-center bg-muted/20 p-4 rounded-lg border">
                <div>
                    <h3 className="text-lg font-medium">Doctor Insurance Coverage</h3>
                    <p className="text-sm text-muted-foreground">Manage employee health benefits and policy renewals.</p>
                </div>
                <Button onClick={() => { setPolicyForm({}); setIsPolicyDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Policy
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Doctor</TableHead>
                            <TableHead>Provider</TableHead>
                            <TableHead>Policy #</TableHead>
                            <TableHead>Coverage</TableHead>
                            <TableHead>Valid Until</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {doctorPolicies.map(p => (
                            <TableRow key={p.id}>
                                <TableCell className="font-medium">{getDocName(p.doctor)}</TableCell>
                                <TableCell>{p.provider?.providerName}</TableCell>
                                <TableCell>{p.policyNumber}</TableCell>
                                <TableCell>{formatCurrency(p.coverageAmount)}</TableCell>
                                <TableCell>{p.validUntil}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => {
                                                setPolicyForm({
                                                    id: p.id,
                                                    doctorId: p.doctor?.id?.toString(),
                                                    providerId: p.provider?.id?.toString(),
                                                    policyNumber: p.policyNumber,
                                                    policyType: p.policyType,
                                                    coverageAmount: p.coverageAmount,
                                                    premiumAmount: p.premiumAmount,
                                                    validFrom: p.validFrom,
                                                    validUntil: p.validUntil
                                                });
                                                setIsPolicyDialogOpen(true);
                                            }}>Edit Policy</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeletePolicy(p.id)}>Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </TabsContent>

        {/* --- TAB 3: PROVIDERS --- */}
        <TabsContent value="providers" className="space-y-4">
             <div className="flex justify-end">
                <Button onClick={() => { setProviderForm({}); setIsProviderDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Provider
                </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {providers.map(prov => (
                    <Card key={prov.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{prov.providerName}</CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="mt-4 space-y-2">
                            <div className="text-sm text-muted-foreground">
                                <span className="block">📞 {prov.contactNumber || "N/A"}</span>
                                <span className="block">✉️ {prov.email || "N/A"}</span>
                                <span className="block truncate">🌐 {prov.website || "N/A"}</span>
                            </div>
                            <div className="flex gap-2 mt-4 pt-2">
                                <Button variant="outline" size="sm" className="w-full" onClick={() => { setProviderForm(prov); setIsProviderDialogOpen(true); }}>
                                    <Edit className="h-3 w-3 mr-2" /> Edit
                                </Button>
                                <Button variant="outline" size="sm" className="w-full hover:bg-red-50 hover:text-red-600" onClick={() => handleDeleteProvider(prov.id)}>
                                    <Trash2 className="h-3 w-3 mr-2" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </TabsContent>

      </Tabs>

      {/* --- DIALOG: REJECT CLAIM --- */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
            <DialogHeader><DialogTitle>Reject Claim</DialogTitle></DialogHeader>
            <div className="py-4">
                <Label>Reason for Rejection</Label>
                <Textarea 
                    value={rejectionReason} 
                    onChange={(e) => setRejectionReason(e.target.value)} 
                    placeholder="E.g., Policy expired, non-covered procedure..." 
                    className="mt-2"
                />
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleRejectClaim}>Confirm Rejection</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- DIALOG: ADD/EDIT DOCTOR POLICY --- */}
      <Dialog open={isPolicyDialogOpen} onOpenChange={setIsPolicyDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
            <DialogHeader><DialogTitle>{policyForm.id ? "Edit Policy" : "Add Doctor Policy"}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label>Doctor</Label>
                        <Select value={policyForm.doctorId} onValueChange={(v) => setPolicyForm({...policyForm, doctorId: v})}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>{doctors.map(d => <SelectItem key={d.id} value={d.id.toString()}>{getDocName(d)}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label>Provider</Label>
                        <Select value={policyForm.providerId} onValueChange={(v) => setPolicyForm({...policyForm, providerId: v})}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>{providers.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.providerName}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label>Policy Number</Label>
                        <Input value={policyForm.policyNumber || ""} onChange={e => setPolicyForm({...policyForm, policyNumber: e.target.value})} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Policy Type</Label>
                        <Input value={policyForm.policyType || ""} onChange={e => setPolicyForm({...policyForm, policyType: e.target.value})} placeholder="e.g. Health, Life" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label>Coverage Amount</Label>
                        <Input type="number" value={policyForm.coverageAmount || ""} onChange={e => setPolicyForm({...policyForm, coverageAmount: e.target.value})} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Premium Amount</Label>
                        <Input type="number" value={policyForm.premiumAmount || ""} onChange={e => setPolicyForm({...policyForm, premiumAmount: e.target.value})} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label>Valid From</Label>
                        <Input type="date" value={policyForm.validFrom || ""} onChange={e => setPolicyForm({...policyForm, validFrom: e.target.value})} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Valid Until</Label>
                        <Input type="date" value={policyForm.validUntil || ""} onChange={e => setPolicyForm({...policyForm, validUntil: e.target.value})} />
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsPolicyDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSavePolicy} disabled={isSaving}>Save Policy</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- DIALOG: ADD/EDIT PROVIDER --- */}
      <Dialog open={isProviderDialogOpen} onOpenChange={setIsProviderDialogOpen}>
        <DialogContent>
            <DialogHeader><DialogTitle>{providerForm.id ? "Edit Provider" : "Add Insurance Provider"}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <Label>Provider Name</Label>
                    <Input value={providerForm.providerName || ""} onChange={e => setProviderForm({...providerForm, providerName: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div className="grid gap-2">
                        <Label>Contact #</Label>
                        <Input value={providerForm.contactNumber || ""} onChange={e => setProviderForm({...providerForm, contactNumber: e.target.value})} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Email</Label>
                        <Input value={providerForm.email || ""} onChange={e => setProviderForm({...providerForm, email: e.target.value})} />
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label>Website</Label>
                    <Input value={providerForm.website || ""} onChange={e => setProviderForm({...providerForm, website: e.target.value})} />
                </div>
                 <div className="grid gap-2">
                    <Label>Support Person</Label>
                    <Input value={providerForm.supportContactPerson || ""} onChange={e => setProviderForm({...providerForm, supportContactPerson: e.target.value})} />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsProviderDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveProvider} disabled={isSaving}>Save Provider</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}