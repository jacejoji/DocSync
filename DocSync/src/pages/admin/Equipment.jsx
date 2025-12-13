/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  HardHat, 
  Loader2, 
  Filter,
  Calendar,
  UserPlus,      
  Stethoscope,   
  Clock,
  Check,          // New Icon
  ChevronsUpDown  // New Icon
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// --- NEW IMPORTS FOR SEARCHABLE SELECT ---
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
import { cn } from "@/lib/utils"; // Standard util in shadcn projects

import { equipmentService } from "@/services/equipmentService";
import axios from "@/lib/axios"; 
import { toast } from "sonner"; 

export default function Equipment() {
  const [equipmentList, setEquipmentList] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [assignments, setAssignments] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Equipment Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEquipment, setCurrentEquipment] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    serialNumber: "",
    status: "Operational",
    purchaseDate: ""
  });

  // Assign Modal State
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [openDoctorSelect, setOpenDoctorSelect] = useState(false); // State for the searchable dropdown
  const [assignData, setAssignData] = useState({
    doctorId: "",
    equipmentId: "",
    assignedDate: new Date().toISOString().split('T')[0]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch All Data
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setLoading(true);
    try {
      const [equipRes, docRes, assignRes] = await Promise.all([
        equipmentService.getAll(),
        axios.get("/doctor"),
        axios.get("/equipment/assignments")
      ]);

      setEquipmentList(equipRes);
      setDoctors(docRes.data);
      setAssignments(assignRes.data);
    } catch (err) {
      console.error("Failed to load data", err);
      toast.error("Failed to load inventory data.");
    } finally {
      setLoading(false);
    }
  };

  const getActiveAssignment = (equipmentId) => {
    return assignments.find((a) => a.equipment.id === equipmentId);
  };

  // 2. Filter Logic
  const filteredList = equipmentList.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // 3. Equipment Form Handling
  const handleOpenDialog = (item = null) => {
    if (item) {
      setCurrentEquipment(item);
      setFormData({
        name: item.name,
        serialNumber: item.serialNumber,
        status: item.status,
        purchaseDate: item.purchaseDate || ""
      });
    } else {
      setCurrentEquipment(null);
      setFormData({
        name: "",
        serialNumber: "",
        status: "Operational",
        purchaseDate: new Date().toISOString().split('T')[0]
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (currentEquipment) {
        await equipmentService.update(currentEquipment.id, formData);
        toast.success("Equipment updated");
      } else {
        await equipmentService.create(formData);
        toast.success("Equipment added");
      }
      await refreshData();
      setIsDialogOpen(false);
    } catch (err) {
      toast.error("Error saving equipment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Assignment Handling
  const handleOpenAssignDialog = (item) => {
    setCurrentEquipment(item);
    setAssignData({
      doctorId: "",
      equipmentId: item.id,
      assignedDate: new Date().toISOString().split('T')[0]
    });
    setOpenDoctorSelect(false); // Reset dropdown state
    setIsAssignDialogOpen(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignData.doctorId) {
        toast.error("Please select a doctor.");
        return;
    }
    setIsSubmitting(true);

    try {
      const payload = {
        doctor: { id: assignData.doctorId },
        equipment: { id: assignData.equipmentId },
        assignedDate: assignData.assignedDate
      };

      await axios.post("/equipment/assign", payload);
      toast.success("Equipment assigned successfully!");
      setIsAssignDialogOpen(false);
      await refreshData(); 
    } catch (err) {
      toast.error("Assignment failed: " + (err.response?.data || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this equipment permanently?")) {
      try {
        await equipmentService.delete(id);
        setEquipmentList((prev) => prev.filter((item) => item.id !== id));
        toast.success("Equipment deleted");
      } catch (err) {
        toast.error("Error deleting equipment.");
      }
    }
  };

  const getStatusBadge = (status, isAssigned) => {
    if (isAssigned) {
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">In Use</Badge>;
    }
    switch (status) {
      case "Operational": return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Operational</Badge>;
      case "Maintenance": return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200">Maintenance</Badge>;
      case "Retired": return <Badge variant="destructive">Retired</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <HardHat className="h-6 w-6 text-primary" />
            Equipment Inventory
          </h1>
          <p className="text-muted-foreground">Track medical devices and assets.</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Add Equipment
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-background/50 p-1 rounded-lg">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or serial number..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-[200px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Filter by Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="Operational">Operational</SelectItem>
              <SelectItem value="Maintenance">Maintenance</SelectItem>
              <SelectItem value="Retired">Retired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Serial Number</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Assignment Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading inventory...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No equipment found matching criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredList.map((item) => {
                const activeAssignment = getActiveAssignment(item.id);

                return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="font-mono text-xs">{item.serialNumber}</TableCell>
                  
                  {/* Assigned To */}
                  <TableCell>
                    {activeAssignment ? (
                        <div className="flex items-center gap-2 text-blue-600 font-medium">
                            <Stethoscope className="h-4 w-4" />
                            {activeAssignment.doctor.firstName} {activeAssignment.doctor.lastName}
                        </div>
                    ) : (
                        <span className="text-muted-foreground text-sm italic">Unassigned</span>
                    )}
                  </TableCell>

                  {/* Assignment Date */}
                  <TableCell>
                    {activeAssignment ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {activeAssignment.assignedDate}
                        </div>
                    ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </TableCell>

                  <TableCell>{getStatusBadge(item.status, !!activeAssignment)}</TableCell>
                  
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" size="icon" title="Assign to Doctor"
                        disabled={!!activeAssignment}
                        onClick={() => handleOpenAssignDialog(item)}
                      >
                        <UserPlus className="h-4 w-4 text-purple-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)}>
                        <Pencil className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )})
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{currentEquipment ? "Edit Equipment" : "Add Equipment"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Name" required />
            <Input value={formData.serialNumber} onChange={(e) => setFormData({...formData, serialNumber: e.target.value})} placeholder="Serial" required />
            <div className="grid grid-cols-2 gap-4">
                <Select value={formData.status} onValueChange={(val) => setFormData({...formData, status: val})}>
                    <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Operational">Operational</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Retired">Retired</SelectItem>
                    </SelectContent>
                </Select>
                <Input type="date" value={formData.purchaseDate} onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ASSIGNMENT DIALOG with Searchable Combobox */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="overflow-visible"> 
          <DialogHeader>
            <DialogTitle>Assign Equipment to Doctor</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAssignSubmit} className="grid gap-4 py-4">
            
            <div className="grid gap-2">
                <Label>Equipment</Label>
                <Input value={currentEquipment?.name || ""} disabled className="bg-muted" />
            </div>

            {/* SEARCHABLE DOCTOR SELECT (COMBOBOX) */}
            <div className="grid gap-2">
                <Label>Select Doctor</Label>
                <Popover open={openDoctorSelect} onOpenChange={setOpenDoctorSelect}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openDoctorSelect}
                      className="justify-between w-full"
                    >
                      {assignData.doctorId
                        ? doctors.find((doc) => doc.id.toString() === assignData.doctorId)?.firstName + " " + doctors.find((doc) => doc.id.toString() === assignData.doctorId)?.lastName
                        : "Select doctor..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-full" align="start">
                    <Command>
                      <CommandInput placeholder="Search doctor by name..." />
                      <CommandList>
                        <CommandEmpty>No doctor found.</CommandEmpty>
                        <CommandGroup>
                          {doctors.map((doc) => (
                            <CommandItem
                              key={doc.id}
                              value={doc.firstName + " " + doc.lastName} // Search filter matches this
                              onSelect={() => {
                                setAssignData({...assignData, doctorId: doc.id.toString()})
                                setOpenDoctorSelect(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  assignData.doctorId === doc.id.toString() ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {doc.firstName} {doc.lastName} <span className="text-muted-foreground text-xs ml-2">({doc.specialization})</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
            </div>

            <div className="grid gap-2">
                <Label>Assignment Date</Label>
                <Input 
                    type="date" 
                    value={assignData.assignedDate}
                    onChange={(e) => setAssignData({...assignData, assignedDate: e.target.value})}
                    required
                />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Assignment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}