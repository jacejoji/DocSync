/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { format } from "date-fns";
import { 
  ShieldCheck, FileText, CheckCircle2, XCircle, AlertCircle 
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ClaimsTab({ claims, loading, onRefresh }) {
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0);
  const getDocName = (d) => d ? `${d.firstName} ${d.lastName}` : "Unknown";

  const handleApproveClaim = async (claim) => {
    if(!confirm(`Approve claim ${claim.claimReferenceNumber}?`)) return;
    try {
        const updatedClaim = { ...claim, status: "APPROVED", processedDate: new Date().toISOString() };
        await api.put(`/insurance-claims/${claim.id}`, updatedClaim);
        toast.success("Claim approved successfully.");
        onRefresh();
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
        onRefresh();
    } catch (error) {
        toast.error("Failed to reject claim.");
    }
  };

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
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

      {/* Table */}
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

      {/* Reject Dialog */}
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
    </div>
  );
}