import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  FileText, 
  ShieldAlert, 
  ShieldCheck, 
  Calendar,
  Loader2,
  Trash2,
  Edit
} from "lucide-react";
import { toast } from "sonner"; // Using Sonner as requested

// Import your configured Axios instance
// Ensure this points to where you saved the axios code you shared
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export default function ComplianceTraining() {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentId, setCurrentId] = useState(null); // null = create mode

  // Form State (Matches your Java Bean structure)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    mandatory: false
  });

  // --- 1. API Actions ---

  const fetchTrainings = async () => {
    setLoading(true);
    try {
      const response = await api.get("/compliancetraining");
      // Ensure we handle cases where response.data might be null
      setTrainings(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching trainings:", error);
      toast.error("Failed to load training data.");
    } finally {
      setLoading(false);
    }
  };

  // Initial Load
  useEffect(() => {
    fetchTrainings();
  }, []);

  const handleSave = async () => {
    if(!formData.title.trim()) {
      toast.error("Module title is required.");
      return;
    }

    setIsSaving(true);
    try {
      if (currentId) {
        // UPDATE: PUT /compliancetraining/{id}
        await api.put(`/compliancetraining/${currentId}`, formData);
        toast.success("Training module updated successfully.");
      } else {
        // CREATE: POST /compliancetraining
        await api.post("/compliancetraining", formData);
        toast.success("New training module created.");
      }
      
      setIsDialogOpen(false);
      resetForm();
      fetchTrainings();
    } catch (error) {
      console.error("Error saving training:", error);
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    // Ideally use a custom Dialog for confirmation, but window.confirm works for simplicity
    if (window.confirm("Are you sure you want to permanently delete this module?")) {
      try {
        await api.delete(`/compliancetraining/${id}`);
        toast.success("Training module deleted.");
        fetchTrainings(); // Refresh list
      } catch (error) {
        console.error("Error deleting training:", error);
        toast.error("Could not delete module.");
      }
    }
  };

  // --- 2. Helper Functions ---

  const resetForm = () => {
    setCurrentId(null);
    setFormData({
      title: "",
      description: "",
      mandatory: false
    });
  };

  const openEdit = (training) => {
    setCurrentId(training.id);
    setFormData({
      title: training.title,
      description: training.description || "",
      mandatory: training.mandatory || false
    });
    setIsDialogOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  // Client-side filtering
  const filteredTrainings = trainings.filter(t => 
    t.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-8 pt-6 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Compliance Modules</h2>
          <p className="text-muted-foreground">Manage training definitions and mandatory requirements.</p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Create Module
        </Button>
      </div>

      {/* KPI Stats Area */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainings.length}</div>
            <p className="text-xs text-muted-foreground">Active definitions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mandatory</CardTitle>
            <ShieldAlert className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trainings.filter(t => t.mandatory).length}
            </div>
            <p className="text-xs text-muted-foreground">Required for all staff</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Optional / Skill</CardTitle>
            <ShieldCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trainings.filter(t => !t.mandatory).length}
            </div>
            <p className="text-xs text-muted-foreground">Skill enhancement</p>
          </CardContent>
        </Card>
      </div>

      {/* Table Section */}
      <div className="space-y-4">
        {/* Filter Bar */}
        <div className="flex items-center justify-between">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by title..." 
              className="pl-8 bg-background" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="w-[30%]">Description</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading data...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredTrainings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No compliance modules found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTrainings.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-base">
                      {item.title}
                    </TableCell>
                    <TableCell>
                      {item.mandatory ? (
                        <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200 hover:border-red-300">Mandatory</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200 hover:border-blue-300">Optional</Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-md text-muted-foreground truncate" title={item.description}>
                      {item.description || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(item.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openEdit(item)} className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Module
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
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{currentId ? "Edit Module" : "Create New Module"}</DialogTitle>
            <DialogDescription>
              {currentId 
                ? "Modify the details of this existing training module." 
                : "Define a new compliance or training module for the system."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            
            {/* Title Input */}
            <div className="grid gap-2">
              <Label htmlFor="title" className="font-semibold">Module Title <span className="text-red-500">*</span></Label>
              <Input 
                id="title" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. Fire Safety Protocols 2024" 
              />
            </div>

            {/* Description Textarea */}
            <div className="grid gap-2">
              <Label htmlFor="desc" className="font-semibold">Description</Label>
              <Textarea 
                id="desc" 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Enter details about the training material..."
                className="h-24 resize-none"
              />
            </div>

            {/* Mandatory Switch */}
            <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-muted/20">
                <div className="space-y-0.5">
                    <Label className="text-base">Mandatory Requirement</Label>
                    <div className="text-[0.8rem] text-muted-foreground">
                        Is this training required for legal compliance?
                    </div>
                </div>
                <Switch 
                    checked={formData.mandatory}
                    onCheckedChange={(checked) => setFormData({...formData, mandatory: checked})}
                />
            </div>

          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
               {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
               {currentId ? "Save Changes" : "Create Module"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}