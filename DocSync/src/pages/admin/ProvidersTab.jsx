/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Building2, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function ProvidersTab({ providers, onRefresh }) {
  const [isProviderDialogOpen, setIsProviderDialogOpen] = useState(false);
  const [providerForm, setProviderForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProvider = async () => {
    setIsSaving(true);
    try {
        if(providerForm.id) {
             await api.put(`/insuranceprovider/${providerForm.id}`, providerForm);
        } else {
             await api.post("/insuranceprovider", providerForm);
        }
        toast.success("Provider saved.");
        setIsProviderDialogOpen(false);
        setProviderForm({});
        onRefresh();
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
        onRefresh();
    } catch (e) { toast.error("Could not delete provider."); }
  };

  return (
    <div className="space-y-4">
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