/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Plus, MoreHorizontal, Users, CreditCard } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export default function PatientCoverageTab({ policies, patients, providers, onRefresh }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Helper to format currency
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0);

  const handleSave = async () => {
    // Basic Validation
    if (!formData.patientId || !formData.providerId || !formData.policyNumber) {
        toast.error("Please fill in required fields (Patient, Provider, Policy #)");
        return;
    }

    setIsSaving(true);
    try {
        const payload = {
            ...formData,
            patient: { id: formData.patientId },
            provider: { id: formData.providerId },
            // Ensure numbers are sent as numbers
            coPayAmount: formData.coPayAmount ? parseFloat(formData.coPayAmount) : 0,
            coInsurancePercent: formData.coInsurancePercent ? parseFloat(formData.coInsurancePercent) : 0,
        };

        if(formData.id) {
            await api.put(`/api/patient-insurance/${formData.id}`, payload);
        } else {
            await api.post("/api/patient-insurance", payload);
        }
        
        toast.success("Patient policy saved successfully.");
        setIsDialogOpen(false);
        setFormData({});
        onRefresh();
    } catch (error) {
        console.error(error);
        toast.error("Failed to save patient policy.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
      if(!confirm("Are you sure you want to delete this policy?")) return;
      try {
          await api.delete(`/api/patient-insurance/${id}`);
          toast.success("Policy removed.");
          onRefresh();
      } catch (e) { toast.error("Could not delete policy."); }
  };

  const openEdit = (policy) => {
    setFormData({
        id: policy.id,
        patientId: policy.patient?.id?.toString(),
        providerId: policy.provider?.id?.toString(),
        policyNumber: policy.policyNumber,
        groupNumber: policy.groupNumber,
        policyHolderName: policy.policyHolderName,
        relationshipToPatient: policy.relationshipToPatient,
        planName: policy.planName,
        coPayAmount: policy.coPayAmount,
        coInsurancePercent: policy.coInsurancePercent,
        validFrom: policy.validFrom,
        validUntil: policy.validUntil,
        isPrimary: policy.isPrimary || false
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4">
        {/* Header Section */}
        <div className="flex justify-between items-center bg-muted/20 p-4 rounded-lg border">
            <div>
                <h3 className="text-lg font-medium flex items-center gap-2">
                    <Users className="h-5 w-5" /> Patient Insurance Coverage
                </h3>
                <p className="text-sm text-muted-foreground">Manage insurance details for patients.</p>
            </div>
            <Button onClick={() => { setFormData({}); setIsDialogOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" /> Add Patient Policy
            </Button>
        </div>

        {/* Data Table */}
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Provider / Plan</TableHead>
                        <TableHead>Policy Details</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead className="text-right">Co-Pay</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {policies.length === 0 ? (
                        <TableRow><TableCell colSpan={6} className="h-24 text-center">No patient policies found.</TableCell></TableRow>
                    ) : policies.map(p => (
                        <TableRow key={p.id}>
                            <TableCell>
                                <div className="font-medium">{p.patient?.firstName} {p.patient?.lastName}</div>
                                {p.isPrimary && <Badge variant="secondary" className="mt-1 text-xs">Primary</Badge>}
                            </TableCell>
                            <TableCell>
                                <div className="font-medium">{p.provider?.providerName}</div>
                                <div className="text-xs text-muted-foreground">{p.planName || "N/A"}</div>
                            </TableCell>
                            <TableCell>
                                <div className="text-sm">#: {p.policyNumber}</div>
                                {p.groupNumber && <div className="text-xs text-muted-foreground">Grp: {p.groupNumber}</div>}
                            </TableCell>
                            <TableCell>
                                <div className="text-xs">
                                    {p.validFrom ? format(new Date(p.validFrom), "MMM dd, yyyy") : "N/A"} - 
                                    <br />
                                    {p.validUntil ? format(new Date(p.validUntil), "MMM dd, yyyy") : "N/A"}
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <div>{formatCurrency(p.coPayAmount)}</div>
                                <div className="text-xs text-muted-foreground">{p.coInsurancePercent}% Co-ins</div>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => openEdit(p)}>Edit Policy</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(p.id)}>Delete</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>

        {/* Dialog Form */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader><DialogTitle>{formData.id ? "Edit Patient Policy" : "Add Patient Policy"}</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
                    
                    {/* Row 1: Patient & Provider */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label className="text-red-500 font-medium">Patient *</Label>
                            <Select value={formData.patientId} onValueChange={(v) => setFormData({...formData, patientId: v})}>
                                <SelectTrigger><SelectValue placeholder="Select Patient" /></SelectTrigger>
                                <SelectContent>
                                    {patients.map(pat => (
                                        <SelectItem key={pat.id} value={pat.id.toString()}>
                                            {pat.firstName} {pat.lastName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-red-500 font-medium">Insurance Provider *</Label>
                            <Select value={formData.providerId} onValueChange={(v) => setFormData({...formData, providerId: v})}>
                                <SelectTrigger><SelectValue placeholder="Select Provider" /></SelectTrigger>
                                <SelectContent>
                                    {providers.map(prov => (
                                        <SelectItem key={prov.id} value={prov.id.toString()}>{prov.providerName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Row 2: Policy Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label className="text-red-500 font-medium">Policy Number *</Label>
                            <Input value={formData.policyNumber || ""} onChange={e => setFormData({...formData, policyNumber: e.target.value})} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Group Number</Label>
                            <Input value={formData.groupNumber || ""} onChange={e => setFormData({...formData, groupNumber: e.target.value})} />
                        </div>
                    </div>

                    {/* Row 3: Plan Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Plan Name</Label>
                            <Input value={formData.planName || ""} onChange={e => setFormData({...formData, planName: e.target.value})} placeholder="e.g. Gold PPO" />
                        </div>
                        <div className="grid gap-2">
                            <Label>Policy Holder</Label>
                            <Input value={formData.policyHolderName || ""} onChange={e => setFormData({...formData, policyHolderName: e.target.value})} placeholder="Name on card" />
                        </div>
                    </div>

                    {/* Row 4: Financials */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Co-Pay Amount</Label>
                            <Input type="number" value={formData.coPayAmount || ""} onChange={e => setFormData({...formData, coPayAmount: e.target.value})} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Co-Insurance %</Label>
                            <Input type="number" value={formData.coInsurancePercent || ""} onChange={e => setFormData({...formData, coInsurancePercent: e.target.value})} />
                        </div>
                    </div>

                    {/* Row 5: Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Valid From</Label>
                            <Input type="date" value={formData.validFrom || ""} onChange={e => setFormData({...formData, validFrom: e.target.value})} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Valid Until</Label>
                            <Input type="date" value={formData.validUntil || ""} onChange={e => setFormData({...formData, validUntil: e.target.value})} />
                        </div>
                    </div>

                    {/* Row 6: Checkbox */}
                    <div className="flex items-center space-x-2 mt-2">
                        <Checkbox 
                            id="isPrimary" 
                            checked={formData.isPrimary || false} 
                            onCheckedChange={(checked) => setFormData({...formData, isPrimary: checked})} 
                        />
                        <Label htmlFor="isPrimary">Set as Primary Insurance</Label>
                    </div>

                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isSaving}>Save Coverage</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}