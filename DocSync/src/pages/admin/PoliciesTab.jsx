/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Plus, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function PoliciesTab({ policies, doctors, providers, onRefresh }) {
  const [isPolicyDialogOpen, setIsPolicyDialogOpen] = useState(false);
  const [policyForm, setPolicyForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0);
  const getDocName = (d) => d ? `${d.firstName} ${d.lastName}` : "Unknown";

  const handleSavePolicy = async () => {
    setIsSaving(true);
    try {
        const payload = {
            ...policyForm,
            doctor: { id: policyForm.doctorId },
            provider: { id: policyForm.providerId }
        };

        if(policyForm.id) {
            await api.put(`/doctor-insurance-policies/${policyForm.id}`, payload);
        } else {
            await api.post("/doctor-insurance-policies", payload);
        }
        
        toast.success("Policy saved successfully.");
        setIsPolicyDialogOpen(false);
        setPolicyForm({});
        onRefresh();
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
          onRefresh();
      } catch (e) { toast.error("Could not delete policy."); }
  };

  return (
    <div className="space-y-4">
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
                    {policies.map(p => (
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
                    {/* Remaining inputs... */}
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
    </div>
  );
}