import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  MapPin, 
  Tent, // Lucide icon for Camping/Camps
  Calendar, 
  Loader2,
  Trash2,
  Edit,
  History,
  Timer
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios"; // Your configured Axios instance

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

export default function MedicalCamps() {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    campName: "",
    location: "",
    date: "",
    description: ""
  });

  // --- 1. API Actions ---

  const fetchCamps = async () => {
    setLoading(true);
    try {
      // Connects to: @GetMapping("/api/medical-camps")
      const response = await api.get("/api/medical-camps");
      setCamps(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching camps:", error);
      toast.error("Failed to load medical camps.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCamps();
  }, []);

  const handleSave = async () => {
    // Basic Validation
    if(!formData.campName.trim() || !formData.date || !formData.location.trim()) {
      toast.error("Please fill in all required fields (Name, Location, Date).");
      return;
    }

    setIsSaving(true);
    try {
      if (currentId) {
        // UPDATE: @PutMapping("/api/medical-camps/{id}")
        await api.put(`/api/medical-camps/${currentId}`, formData);
        toast.success("Medical camp updated successfully.");
      } else {
        // CREATE: @PostMapping("/api/medical-camps")
        await api.post("/api/medical-camps", formData);
        toast.success("Medical camp scheduled successfully.");
      }
      
      setIsDialogOpen(false);
      resetForm();
      fetchCamps();
    } catch (error) {
      console.error("Error saving camp:", error);
      toast.error("Failed to save camp details.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to cancel this medical camp?")) {
      try {
        // DELETE: @DeleteMapping("/api/medical-camps/{id}")
        await api.delete(`/api/medical-camps/${id}`);
        toast.success("Medical camp removed.");
        fetchCamps();
      } catch (error) {
        console.error("Error deleting camp:", error);
        toast.error("Could not remove record.");
      }
    }
  };

  // --- 2. Helper Functions ---

  const resetForm = () => {
    setCurrentId(null);
    setFormData({
      campName: "",
      location: "",
      date: "",
      description: ""
    });
  };

  const openEdit = (camp) => {
    setCurrentId(camp.id);
    setFormData({
      campName: camp.campName,
      location: camp.location,
      date: camp.date, // Format is already YYYY-MM-DD from LocalDate
      description: camp.description || ""
    });
    setIsDialogOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  // Check if date is in the future
  const isUpcoming = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const campDate = new Date(dateString);
    return campDate >= today;
  };

  // Filter Logic
  const filteredCamps = camps.filter(c => 
    c.campName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats Calculation
  const upcomingCount = camps.filter(c => isUpcoming(c.date)).length;
  const pastCount = camps.length - upcomingCount;

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-8 pt-6 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Medical Camps</h2>
          <p className="text-muted-foreground">Schedule and manage community outreach programs.</p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Schedule Camp
        </Button>
      </div>

      {/* KPI Stats Area */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
            <Tent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{camps.length}</div>
            <p className="text-xs text-muted-foreground">All time records</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Timer className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{upcomingCount}</div>
            <p className="text-xs text-muted-foreground">Scheduled for future</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <History className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pastCount}</div>
            <p className="text-xs text-muted-foreground">Past events</p>
          </CardContent>
        </Card>
      </div>

      {/* Table Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search camp name or location..." 
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
                <TableHead className="w-[30%]">Camp Details</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading camps...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredCamps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No medical camps found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCamps.map((camp) => {
                  const isFuture = isUpcoming(camp.date);
                  return (
                    <TableRow key={camp.id}>
                      <TableCell>
                        <div className="flex flex-col">
                            <span className="font-medium text-base">{camp.campName}</span>
                            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {camp.description || "No description provided"}
                            </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                            {camp.location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(camp.date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {isFuture ? (
                           <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Upcoming</Badge>
                        ) : (
                           <Badge variant="secondary" className="bg-gray-100 text-gray-600">Concluded</Badge>
                        )}
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
                            <DropdownMenuItem onClick={() => openEdit(camp)} className="cursor-pointer">
                              <Edit className="mr-2 h-4 w-4" /> Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                              onClick={() => handleDelete(camp.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Cancel Camp
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{currentId ? "Edit Medical Camp" : "Schedule Medical Camp"}</DialogTitle>
            <DialogDescription>
              {currentId 
                ? "Update the details for this outreach program." 
                : "Enter details for the new medical camp including location and date."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            
            {/* Name Input */}
            <div className="grid gap-2">
              <Label htmlFor="campName">Camp Name <span className="text-red-500">*</span></Label>
              <Input 
                id="campName" 
                value={formData.campName}
                onChange={(e) => setFormData({...formData, campName: e.target.value})}
                placeholder="e.g. Rural Eye Care Initiative" 
              />
            </div>

            {/* Location & Date Row */}
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
                    <div className="relative">
                        <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            id="location" 
                            className="pl-9"
                            value={formData.location}
                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                            placeholder="City or Village" 
                        />
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="date">Date <span className="text-red-500">*</span></Label>
                    <Input 
                        id="date" 
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                    />
                </div>
            </div>

            {/* Description Textarea */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Details about services provided, expected doctors, etc..."
                className="h-24 resize-none"
              />
            </div>

          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
               {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
               {currentId ? "Save Changes" : "Schedule Camp"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}