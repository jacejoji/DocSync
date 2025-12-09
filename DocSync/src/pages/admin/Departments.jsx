import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  Building2, 
  Loader2,
  AlertCircle 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { departmentService } from "@/services/departmentService";

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState(null); // null = create mode, object = edit mode
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch Data on Mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const data = await departmentService.getAll();
      setDepartments(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load departments. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Search Filter
  const filteredDepartments = departments.filter((dept) =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 3. Form Handling
  const handleOpenDialog = (department = null) => {
    if (department) {
      // Edit Mode
      setCurrentDepartment(department);
      setFormData({ name: department.name, description: department.description });
    } else {
      // Create Mode
      setCurrentDepartment(null);
      setFormData({ name: "", description: "" });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (currentDepartment) {
        // Update Logic
        await departmentService.update(currentDepartment.id, formData);
      } else {
        // Create Logic
        await departmentService.create(formData);
      }
      // Refresh list and close
      await fetchDepartments();
      setIsDialogOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save department. " + (err.response?.data || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Delete Handling
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this department? This cannot be undone.")) {
      try {
        await departmentService.delete(id);
        setDepartments(departments.filter((d) => d.id !== id));
      } catch (err) {
        alert("Failed to delete. " + (err.response?.data || err.message));
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            Departments
          </h1>
          <p className="text-muted-foreground">
            Manage hospital wings and specialized units.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" /> Add Department
        </Button>
      </div>

      {/* Controls & Search */}
      <div className="flex items-center gap-2 bg-background/50 p-1 rounded-lg">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search departments..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading data...
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-red-500">
                  <div className="flex items-center justify-center gap-2">
                    <AlertCircle className="h-4 w-4" /> {error}
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredDepartments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No departments found.
                </TableCell>
              </TableRow>
            ) : (
              filteredDepartments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className="font-medium">#{dept.id}</TableCell>
                  <TableCell className="font-semibold text-foreground">
                    {dept.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-md truncate">
                    {dept.description || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(dept)}
                      >
                        <Pencil className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(dept.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {currentDepartment ? "Edit Department" : "New Department"}
            </DialogTitle>
            <DialogDescription>
              {currentDepartment
                ? "Update the details below."
                : "Create a new hospital department."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Department Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. Cardiology"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description of the department..."
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {currentDepartment ? "Save Changes" : "Create Department"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}