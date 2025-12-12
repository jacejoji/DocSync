import React, { useState, useEffect, useMemo } from "react";
import { format, addDays, subDays, isValid, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns"; 
import { 
  Plus, 
  MoreHorizontal, 
  Calendar as CalendarIcon, 
  Loader2,
  Trash2,
  Edit,
  Clock,
  History,
  CalendarDays,
  Activity,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  LayoutGrid,
  List,
  Sun,
  Moon,
  Sunset
} from "lucide-react";
import { toast } from "sonner";
// Ensure you have this configured, or swap with fetch/axios directly
import api from "@/lib/axios"; 

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar"; 
import { cn } from "@/lib/utils";

// --- Constants ---
const SHIFT_COLORS = {
  Morning: "bg-amber-100 text-amber-700 border-amber-200",
  Evening: "bg-orange-100 text-orange-700 border-orange-200",
  Night: "bg-violet-100 text-violet-700 border-violet-200",
};

// --- Helper for Safe Date Formatting ---
const safeFormat = (dateInput, formatStr = "MMM dd, yyyy") => {
  if (!dateInput) return "N/A";
  const date = new Date(dateInput);
  if (!isValid(date)) return "Invalid Date";
  return format(date, formatStr);
};

export default function DutyRosterPage() {
  const [activeTab, setActiveTab] = useState("roster");
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'calendar'
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // --- Data States ---
  const [rosters, setRosters] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [overtime, setOvertime] = useState([]);
  const [shiftChanges, setShiftChanges] = useState([]);

  // --- Filter State (Roster Only) ---
  const [filterDate, setFilterDate] = useState(new Date()); 
  const [viewAllRosters, setViewAllRosters] = useState(false); 

  // --- Dialog & Form State ---
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentId, setCurrentId] = useState(null); 
  
  // --- Delete Alert State ---
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Unified Form Data
  const [formData, setFormData] = useState({
    doctorId: "",
    dutyDate: new Date(),
    shift: "Morning",
    dutyType: "OPD",
    dayOfWeek: "Monday",
    availableFrom: "09:00",
    availableTo: "17:00",
    overtimeDate: new Date(),
    hours: 0,
    changeDate: new Date(),
    oldShift: "",
    newShift: ""
  });

  // --- 1. API Actions ---
  const fetchDoctors = async () => {
    try {
      // Fallback to fetch if api instance fails or isn't set up yet
      const response = await (api ? api.get("/doctor") : fetch("http://localhost:8080/doctor").then(res => res.json()));
      const data = api ? response.data : response;
      setDoctors(Array.isArray(data) ? data : []);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error("Could not load doctor list.");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Prepare Roster Request (Depends on filters)
      const dateStr = format(filterDate, "yyyy-MM-dd");
      let rosterPromise;

      if (viewAllRosters || viewMode === 'calendar') {
        rosterPromise = api.get("/api/duty-rosters");
      } else {
        rosterPromise = api.get(`/api/duty-rosters/date?date=${dateStr}`);
      }

      // 2. Fetch ALL data in parallel. 
      // This ensures the Dashboard Cards (Overtime/Changes counts) are always accurate,
      // regardless of which tab is currently open.
      const [rosterRes, scheduleRes, overtimeRes, changesRes] = await Promise.all([
        rosterPromise,
        api.get("/api/schedules"),
        api.get("/overtimerecord"),
        api.get("/api/shift-changes")
      ]);

      // 3. Update all states
      setRosters(Array.isArray(rosterRes.data) ? rosterRes.data : []);
      setSchedules(Array.isArray(scheduleRes.data) ? scheduleRes.data : []);
      setOvertime(Array.isArray(overtimeRes.data) ? overtimeRes.data : []);
      setShiftChanges(Array.isArray(changesRes.data) ? changesRes.data : []);

    } catch (error) {
      console.error("Fetch error", error);
      // Optional: specific error handling if one promise fails
      toast.error("Failed to sync latest data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    fetchData();
    setSearchQuery(""); // Reset search on tab change
  }, [activeTab, filterDate, viewAllRosters, viewMode]);

  // --- 2. Filter Logic (Client Side) ---
  const getActiveData = () => {
    switch(activeTab) {
      case "roster": return rosters;
      case "schedule": return schedules;
      case "overtime": return overtime;
      case "changes": return shiftChanges;
      default: return [];
    }
  };

  const filteredData = useMemo(() => {
    const data = getActiveData();
    if (!searchQuery) return data;
    const lowerQuery = searchQuery.toLowerCase();
    
    return data.filter(item => {
      const docName = item.doctor ? `${item.doctor.firstName} ${item.doctor.lastName}` : "";
      return docName.toLowerCase().includes(lowerQuery);
    });
  }, [searchQuery, rosters, schedules, overtime, shiftChanges, activeTab]);

  // --- 3. Save Logic ---
  const handleSave = async () => {
    if (!formData.doctorId) {
      toast.error("Please select a doctor.");
      return;
    }

    setIsSaving(true);
    let promise;
    const docObj = { id: formData.doctorId };

    try {
      if (activeTab === "roster") {
        const payload = {
          doctor: docObj,
          dutyDate: format(formData.dutyDate, "yyyy-MM-dd"),
          shift: formData.shift,
          dutyType: formData.dutyType
        };
        promise = currentId 
          ? api.put(`/api/duty-rosters/${currentId}`, payload)
          : api.post("/api/duty-rosters", payload);
      } 
      else if (activeTab === "schedule") {
        const payload = {
          doctor: docObj,
          dayOfWeek: formData.dayOfWeek,
          availableFrom: formData.availableFrom.length === 5 ? formData.availableFrom + ":00" : formData.availableFrom,
          availableTo: formData.availableTo.length === 5 ? formData.availableTo + ":00" : formData.availableTo
        };
        promise = currentId
          ? api.put(`/api/schedules/${currentId}`, payload)
          : api.post("/api/schedules", payload);
      }
      else if (activeTab === "overtime") {
        const payload = {
          doctor: docObj,
          date: format(formData.overtimeDate, "yyyy-MM-dd"),
          hours: parseInt(formData.hours)
        };
        promise = currentId
          ? api.put(`/overtimerecord/${currentId}`, payload)
          : api.post("/overtimerecord", payload);
      }
      else if (activeTab === "changes") {
        const payload = {
          doctor: docObj,
          changeDate: format(formData.changeDate, "yyyy-MM-dd"),
          oldShift: formData.oldShift,
          newShift: formData.newShift
        };
        promise = currentId
          ? api.put(`/api/shift-changes/${currentId}`, payload)
          : api.post("/api/shift-changes", payload);
      }

      await promise;
      toast.success("Saved successfully.");
      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save record.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- 4. Delete Logic ---
  const confirmDelete = (id) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleExecuteDelete = async () => {
    try {
      if (activeTab === "roster") await api.delete(`/api/duty-rosters/${deleteId}`);
      if (activeTab === "schedule") await api.delete(`/api/schedules/${deleteId}`);
      if (activeTab === "overtime") await api.delete(`/overtimerecord/${deleteId}`);
      if (activeTab === "changes") await api.delete(`/api/shift-changes/${deleteId}`);
      
      toast.success("Deleted successfully.");
      fetchData();
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error("Delete failed.");
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  // --- 5. Helpers ---
  const resetForm = () => {
    setCurrentId(null);
    setFormData({
      doctorId: "",
      dutyDate: new Date(),
      shift: "Morning",
      dutyType: "OPD",
      dayOfWeek: "Monday",
      availableFrom: "09:00",
      availableTo: "17:00",
      overtimeDate: new Date(),
      hours: 0,
      changeDate: new Date(),
      oldShift: "",
      newShift: ""
    });
  };

  const openEdit = (item) => {
    setCurrentId(item.id);
    const docId = item.doctor?.id?.toString() || "";
    
    let newData = { ...formData, doctorId: docId };

    if (activeTab === "roster") {
      newData = { ...newData, dutyDate: new Date(item.dutyDate), shift: item.shift, dutyType: item.dutyType };
    } else if (activeTab === "schedule") {
      newData = { ...newData, dayOfWeek: item.dayOfWeek, availableFrom: item.availableFrom?.slice(0,5), availableTo: item.availableTo?.slice(0,5) };
    } else if (activeTab === "overtime") {
      newData = { ...newData, overtimeDate: new Date(item.date), hours: item.hours };
    } else if (activeTab === "changes") {
      newData = { ...newData, changeDate: new Date(item.changeDate), oldShift: item.oldShift, newShift: item.newShift };
    }
    setFormData(newData);
    setIsDialogOpen(true);
  };

  const handlePrevDay = () => setFilterDate(prev => subDays(prev, 1));
  const handleNextDay = () => setFilterDate(prev => addDays(prev, 1));

  // --- Calendar Generator ---
  const calendarDays = useMemo(() => {
    if (viewMode !== 'calendar') return [];
    const start = startOfMonth(filterDate);
    const end = endOfMonth(filterDate);
    return eachDayOfInterval({ start, end });
  }, [filterDate, viewMode]);

  // --- RENDER ---
  return (
    <div className="flex flex-col space-y-6 p-6 animate-in fade-in duration-500 max-w-7xl mx-auto bg-muted/20 min-h-screen">
      
      {/* 1. Dashboard Stats / Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Duty Management</h2>
          <p className="text-muted-foreground">Orchestrate rosters, schedules, and staff shifts.</p>
        </div>
        
        <div className="flex items-center gap-2">
           <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="shadow-md">
            <Plus className="mr-2 h-4 w-4" /> Add Record
          </Button>
        </div>
      </div>

      {/* 2. KPI Cards (Visual Hierarchy) */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Roster</CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{rosters.length}</div>
                <p className="text-xs text-muted-foreground">Shifts scheduled {(viewAllRosters || viewMode === 'calendar') ? "in total" : "for this date"}</p>
            </CardContent>
        </Card>
        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Overtime</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{overtime.length}</div>
                <p className="text-xs text-muted-foreground">Records logged</p>
            </CardContent>
        </Card>
        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Shift Changes</CardTitle>
                <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{shiftChanges.length}</div>
                <p className="text-xs text-muted-foreground">Recent modifications</p>
            </CardContent>
        </Card>
      </div>

      {/* 3. TABS Navigation & Toolbar */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-4 h-auto">
                <TabsTrigger value="roster" className="py-2"><CalendarDays className="mr-2 h-4 w-4"/> Roster</TabsTrigger>
                <TabsTrigger value="schedule" className="py-2"><Clock className="mr-2 h-4 w-4"/> Schedule</TabsTrigger>
                <TabsTrigger value="overtime" className="py-2"><Activity className="mr-2 h-4 w-4"/> Overtime</TabsTrigger>
                <TabsTrigger value="changes" className="py-2"><History className="mr-2 h-4 w-4"/> History</TabsTrigger>
            </TabsList>
            
            {/* Search Bar for all tabs */}
            <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search doctor..." 
                    className="pl-8" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>

        {/* --- TAB: ROSTER --- */}
        <TabsContent value="roster" className="space-y-4">
          <Card>
            <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between bg-muted/20">
                <div className="flex items-center gap-2">
                    {/* View Toggle */}
                     <div className="flex bg-background border rounded-lg p-0.5 mr-2">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className={cn("h-7 px-2", viewMode === 'list' && "bg-muted shadow-sm")} 
                            onClick={() => setViewMode('list')}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className={cn("h-7 px-2", viewMode === 'calendar' && "bg-muted shadow-sm")} 
                            onClick={() => setViewMode('calendar')}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                     </div>

                     {/* Date Controls */}
                     {viewMode === 'list' && (
                        <>
                             <Button variant="ghost" size="icon" onClick={handlePrevDay} disabled={viewAllRosters}><ChevronLeft className="h-4 w-4"/></Button>
                             <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant={"outline"} className={cn("w-[200px] justify-start text-left font-normal", viewAllRosters && "opacity-50 pointer-events-none")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {filterDate ? format(filterDate, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="single" selected={filterDate} onSelect={(date) => date && setFilterDate(date)} initialFocus />
                                </PopoverContent>
                            </Popover>
                            <Button variant="ghost" size="icon" onClick={handleNextDay} disabled={viewAllRosters}><ChevronRight className="h-4 w-4"/></Button>
                        </>
                     )}

                     {viewMode === 'calendar' && (
                         <div className="flex items-center gap-2">
                             <Button variant="outline" size="icon" onClick={() => setFilterDate(subDays(startOfMonth(filterDate), 1))}>
                                <ChevronLeft className="h-4 w-4" />
                             </Button>
                             <span className="font-semibold min-w-[120px] text-center">
                                {format(filterDate, 'MMMM yyyy')}
                             </span>
                             <Button variant="outline" size="icon" onClick={() => setFilterDate(addDays(endOfMonth(filterDate), 1))}>
                                <ChevronRight className="h-4 w-4" />
                             </Button>
                         </div>
                     )}
                </div>
                
                {viewMode === 'list' && (
                    <div className="flex items-center space-x-2">
                        <Label htmlFor="view-mode" className="text-sm text-muted-foreground">View All</Label>
                        <input 
                            type="checkbox" 
                            id="view-mode" 
                            className="toggle-checkbox h-4 w-4 accent-primary"
                            checked={viewAllRosters} 
                            onChange={() => setViewAllRosters(!viewAllRosters)}
                        />
                    </div>
                )}
            </CardHeader>
            <CardContent className="p-0">
                {viewMode === 'list' ? (
                    <GenericTable 
                        loading={loading} 
                        data={filteredData} 
                        columns={["Doctor", "Date", "Shift", "Duty Type"]}
                        renderRow={(roster) => (
                        <TableRow key={roster.id} className="group hover:bg-muted/50">
                            <TableCell><DoctorCell doctor={roster.doctor} /></TableCell>
                            <TableCell className="text-muted-foreground">{safeFormat(roster.dutyDate)}</TableCell>
                            <TableCell><ShiftBadge shift={roster.shift} /></TableCell>
                            <TableCell className="font-medium">{roster.dutyType}</TableCell>
                            <TableCell className="text-right">
                            <ActionMenu onEdit={() => openEdit(roster)} onDelete={() => confirmDelete(roster.id)} />
                            </TableCell>
                        </TableRow>
                        )}
                    />
                ) : (
                    // Calendar Grid View
                    <div className="p-4">
                        <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden border">
                             {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="bg-background/50 p-2 text-center text-xs font-semibold text-muted-foreground">
                                    {day}
                                </div>
                            ))}
                            {calendarDays.map((date, i) => {
                                const daysRosters = rosters.filter(r => isSameDay(new Date(r.dutyDate), date));
                                const isToday = isSameDay(date, new Date());
                                
                                return (
                                    <div key={i} className="bg-background min-h-[120px] p-2 hover:bg-muted/20 transition-colors group relative border-t border-r">
                                         <div className="flex justify-between items-start">
                                            <span className={cn("text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full", isToday ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
                                                {date.getDate()}
                                            </span>
                                            {daysRosters.length > 0 && <Badge variant="outline" className="text-[10px] h-4 px-1">{daysRosters.length}</Badge>}
                                         </div>
                                         <div className="mt-2 space-y-1">
                                            {daysRosters.slice(0,3).map(roster => (
                                                <div 
                                                    key={roster.id} 
                                                    onClick={() => openEdit(roster)}
                                                    className={cn("text-[10px] p-1 rounded border-l-2 truncate cursor-pointer hover:opacity-80 flex items-center gap-1", SHIFT_COLORS[roster.shift])}
                                                >
                                                    {roster.shift === "Morning" && <Sun className="w-2.5 h-2.5" />}
                                                    {roster.shift === "Evening" && <Sunset className="w-2.5 h-2.5" />}
                                                    {roster.shift === "Night" && <Moon className="w-2.5 h-2.5" />}
                                                    {roster.doctor?.lastName}
                                                </div>
                                            ))}
                                            {daysRosters.length > 3 && (
                                                <div className="text-[10px] text-muted-foreground pl-1">
                                                    + {daysRosters.length - 3} more
                                                </div>
                                            )}
                                         </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TAB: SCHEDULE --- */}
        <TabsContent value="schedule" className="space-y-4">
           <Card>
             <CardContent className="p-0">
                <GenericTable 
                    loading={loading} 
                    data={filteredData} 
                    columns={["Doctor", "Day of Week", "Available From", "Available To"]}
                    renderRow={(sch) => (
                    <TableRow key={sch.id} className="group hover:bg-muted/50">
                        <TableCell><DoctorCell doctor={sch.doctor} /></TableCell>
                        <TableCell><Badge variant="outline" className="font-mono bg-background">{sch.dayOfWeek}</Badge></TableCell>
                        <TableCell className="text-muted-foreground">{sch.availableFrom}</TableCell>
                        <TableCell className="text-muted-foreground">{sch.availableTo}</TableCell>
                        <TableCell className="text-right">
                        <ActionMenu onEdit={() => openEdit(sch)} onDelete={() => confirmDelete(sch.id)} />
                        </TableCell>
                    </TableRow>
                    )}
                />
            </CardContent>
           </Card>
        </TabsContent>

        {/* --- TAB: OVERTIME --- */}
        <TabsContent value="overtime" className="space-y-4">
           <Card>
             <CardContent className="p-0">
                <GenericTable 
                    loading={loading} 
                    data={filteredData} 
                    columns={["Doctor", "Date", "Hours Logged"]}
                    renderRow={(ot) => (
                    <TableRow key={ot.id} className="group hover:bg-muted/50">
                        <TableCell><DoctorCell doctor={ot.doctor} /></TableCell>
                        <TableCell>{safeFormat(ot.date)}</TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                +{ot.hours} hrs
                            </span>
                        </TableCell>
                        <TableCell className="text-right">
                            <ActionMenu onEdit={() => openEdit(ot)} onDelete={() => confirmDelete(ot.id)} />
                        </TableCell>
                    </TableRow>
                    )}
                />
            </CardContent>
           </Card>
        </TabsContent>

        {/* --- TAB: SHIFT CHANGES --- */}
        <TabsContent value="changes" className="space-y-4">
           <Card>
             <CardContent className="p-0">
                <GenericTable 
                    loading={loading} 
                    data={filteredData} 
                    columns={["Doctor", "Date Changed", "Old Shift", "New Shift"]}
                    renderRow={(chg) => (
                    <TableRow key={chg.id} className="group hover:bg-muted/50">
                        <TableCell><DoctorCell doctor={chg.doctor} /></TableCell>
                        <TableCell>{safeFormat(chg.changeDate)}</TableCell>
                        <TableCell><Badge variant="outline" className="line-through text-muted-foreground opacity-70">{chg.oldShift || "None"}</Badge></TableCell>
                        <TableCell><Badge className="bg-emerald-600 hover:bg-emerald-700">{chg.newShift}</Badge></TableCell>
                        <TableCell className="text-right">
                            <ActionMenu onEdit={() => openEdit(chg)} onDelete={() => confirmDelete(chg.id)} />
                        </TableCell>
                    </TableRow>
                    )}
                />
            </CardContent>
           </Card>
        </TabsContent>
      </Tabs>

      {/* --- SHARED DIALOG --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
                {currentId ? "Edit Record" : "Create New Record"}
            </DialogTitle>
            <DialogDescription>
               {activeTab === "roster" && "Assign a daily duty."}
               {activeTab === "schedule" && "Set recurring weekly availability."}
               {activeTab === "overtime" && "Log extra hours worked."}
               {activeTab === "changes" && "Log a shift modification."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
             <div className="grid gap-2">
              <Label>Doctor <span className="text-red-500">*</span></Label>
              <Select value={formData.doctorId} onValueChange={(val) => setFormData({...formData, doctorId: val})}>
                <SelectTrigger><SelectValue placeholder="Select doctor..." /></SelectTrigger>
                <SelectContent>
                  {doctors.map((d) => (
                    <SelectItem key={d.id} value={d.id.toString()}>{d.firstName} {d.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dynamic Fields */}
            {activeTab === "roster" && (
              <>
                 <div className="grid gap-2">
                   <Label>Duty Date</Label>
                   <DatePicker date={formData.dutyDate} setDate={(d) => setFormData({...formData, dutyDate: d})} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label>Shift</Label>
                        <Select value={formData.shift} onValueChange={(val) => setFormData({...formData, shift: val})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Morning">Morning</SelectItem>
                                <SelectItem value="Evening">Evening</SelectItem>
                                <SelectItem value="Night">Night</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label>Duty Type</Label>
                        <Input value={formData.dutyType} onChange={(e) => setFormData({...formData, dutyType: e.target.value})} />
                    </div>
                 </div>
              </>
            )}

            {activeTab === "schedule" && (
                <>
                  <div className="grid gap-2">
                    <Label>Day of Week</Label>
                    <Select value={formData.dayOfWeek} onValueChange={(val) => setFormData({...formData, dayOfWeek: val})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(day => (
                                <SelectItem key={day} value={day}>{day}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>From</Label>
                        <Input type="time" value={formData.availableFrom} onChange={(e) => setFormData({...formData, availableFrom: e.target.value})} />
                      </div>
                      <div className="grid gap-2">
                        <Label>To</Label>
                        <Input type="time" value={formData.availableTo} onChange={(e) => setFormData({...formData, availableTo: e.target.value})} />
                      </div>
                  </div>
                </>
            )}

            {activeTab === "overtime" && (
                <>
                  <div className="grid gap-2">
                    <Label>Date</Label>
                    <DatePicker date={formData.overtimeDate} setDate={(d) => setFormData({...formData, overtimeDate: d})} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Hours</Label>
                    <Input type="number" min="0" value={formData.hours} onChange={(e) => setFormData({...formData, hours: e.target.value})} />
                  </div>
                </>
            )}

            {activeTab === "changes" && (
                <>
                   <div className="grid gap-2">
                    <Label>Change Date</Label>
                    <DatePicker date={formData.changeDate} setDate={(d) => setFormData({...formData, changeDate: d})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Old Shift</Label>
                        <Input value={formData.oldShift} onChange={(e) => setFormData({...formData, oldShift: e.target.value})} placeholder="e.g. Morning"/>
                      </div>
                      <div className="grid gap-2">
                        <Label>New Shift</Label>
                        <Input value={formData.newShift} onChange={(e) => setFormData({...formData, newShift: e.target.value})} placeholder="e.g. Night"/>
                      </div>
                  </div>
                </>
            )}

          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- ALERT DIALOG FOR DELETE --- */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleExecuteDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}

// --- Sub-Components ---

function GenericTable({ loading, data, columns, renderRow }) {
    return (
        <Table>
            <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                    {columns.map((c, i) => <TableHead key={i} className="text-xs font-semibold uppercase text-muted-foreground">{c}</TableHead>)}
                    <TableHead className="text-right text-xs font-semibold uppercase text-muted-foreground">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                      <TableRow><TableCell colSpan={columns.length + 1} className="h-32 text-center"><div className="flex justify-center flex-col items-center text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin mb-2"/>Loading data...</div></TableCell></TableRow>
                ) : data.length === 0 ? (
                      <TableRow><TableCell colSpan={columns.length + 1} className="h-32 text-center text-muted-foreground">No records found matching your criteria.</TableCell></TableRow>
                ) : (
                    data.map(renderRow)
                )}
            </TableBody>
        </Table>
    )
}

function DoctorCell({ doctor }) {
    if (!doctor) return <span>Unknown</span>;
    const initials = (doctor.firstName?.[0] || "") + (doctor.lastName?.[0] || "");
    return (
        <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 border">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
                <span className="font-medium text-sm leading-none">{doctor.firstName} {doctor.lastName}</span>
                <span className="text-xs text-muted-foreground mt-1">{doctor.specialization || "General"}</span>
            </div>
        </div>
    )
}

function ShiftBadge({ shift }) {
    let styles = "bg-gray-100 text-gray-700 border-gray-200";
    if (shift === "Morning") styles = SHIFT_COLORS.Morning;
    if (shift === "Evening") styles = SHIFT_COLORS.Evening;
    if (shift === "Night") styles = SHIFT_COLORS.Night;
    
    return <Badge className={cn("font-medium pointer-events-none border shadow-sm", styles)} variant="outline">{shift}</Badge>
}

function ActionMenu({ onEdit, onDelete }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"><MoreHorizontal className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={onEdit} className="cursor-pointer"><Edit className="mr-2 h-4 w-4 text-muted-foreground" /> Edit</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function DatePicker({ date, setDate }) {
    return (
        <Popover>
            <PopoverTrigger asChild>
            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus />
            </PopoverContent>
        </Popover>
    )
}