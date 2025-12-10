import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { 
  Banknote, 
  TrendingUp, 
  Search, 
  Loader2, 
  Plus, 
  DollarSign, 
  MoreHorizontal,
  Pencil,
  Trash2,
  Calculator,
  User
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function Payroll() {
  const [activeTab, setActiveTab] = useState("processing");
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [payrolls, setPayrolls] = useState([]);
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [doctors, setDoctors] = useState([]);

  // Filter States
  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [searchTerm, setSearchTerm] = useState("");

  // Dialog States
  const [isPayrollDialogOpen, setIsPayrollDialogOpen] = useState(false);
  const [isSalaryDialogOpen, setIsSalaryDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Edit Mode State
  const [currentPayrollId, setCurrentPayrollId] = useState(null); // If set, we are editing

  // --- Forms State ---
  
  const [payrollForm, setPayrollForm] = useState({
    doctorId: "",
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear(),
    grossSalary: "",
    deductions: "0",
  });

  const [salaryForm, setSalaryForm] = useState({
    doctorId: "",
    baseSalary: "",
    hikePercent: "0",
    effectiveFrom: new Date().toISOString().split('T')[0]
  });

  // --- API Actions ---

  const fetchData = async () => {
    setLoading(true);
    try {
      const [doctorsRes, payrollRes, salaryRes] = await Promise.all([
        api.get("/doctor"),
        api.get("/api/payrolls"),
        api.get("/api/salary-records")
      ]);

      setDoctors(Array.isArray(doctorsRes.data) ? doctorsRes.data : []);
      setPayrolls(Array.isArray(payrollRes.data) ? payrollRes.data : []);
      setSalaryRecords(Array.isArray(salaryRes.data) ? salaryRes.data : []);
      
    } catch (error) {
      console.error("Error loading data", error);
      toast.error("Failed to load payroll data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Handlers: Payroll Processing (Create & Edit) ---

  const resetPayrollForm = () => {
    setCurrentPayrollId(null);
    setPayrollForm({
      doctorId: "",
      month: selectedMonth, // default to current filter
      year: parseInt(selectedYear),
      grossSalary: "",
      deductions: "0",
    });
  };

  const openEditPayroll = (payroll) => {
    setCurrentPayrollId(payroll.id);
    setPayrollForm({
      doctorId: payroll.doctor?.id?.toString(),
      month: payroll.month,
      year: payroll.year,
      grossSalary: payroll.grossSalary,
      deductions: payroll.deductions,
    });
    setIsPayrollDialogOpen(true);
  };

  const handleSavePayroll = async () => {
    if(!payrollForm.doctorId || !payrollForm.grossSalary) {
      toast.error("Doctor and Gross Salary are required.");
      return;
    }

    setIsSaving(true);
    try {
      const gross = parseFloat(payrollForm.grossSalary);
      const ded = parseFloat(payrollForm.deductions || 0);
      const net = gross - ded;

      const payload = {
        doctor: { id: payrollForm.doctorId },
        month: payrollForm.month,
        year: parseInt(payrollForm.year),
        grossSalary: gross,
        deductions: ded,
        netSalary: net,
        processedAt: new Date().toISOString()
      };

      if (currentPayrollId) {
        // EDIT: PUT /api/payrolls/{id}
        await api.put(`/api/payrolls/${currentPayrollId}`, payload);
        toast.success("Payroll record updated.");
      } else {
        // CREATE: POST /api/payrolls
        await api.post("/api/payrolls", payload);
        toast.success("Payroll processed successfully.");
      }

      setIsPayrollDialogOpen(false);
      fetchData();
    } catch (error) {
        console.error(error);
        toast.error("Failed to save payroll record.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleDeletePayroll = async (id) => {
    if(!confirm("Are you sure you want to delete this payroll record?")) return;
    try {
      await api.delete(`/api/payrolls/${id}`);
      toast.success("Record deleted.");
      fetchData();
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error("Failed to delete record.");
    }
  };

  // --- Handlers: Salary Structure ---

  const handleUpdateSalary = async () => {
    if(!salaryForm.doctorId || !salaryForm.baseSalary) {
        toast.error("Doctor and Base Salary are required.");
        return;
    }
    setIsSaving(true);
    try {
        const payload = {
            doctor: { id: salaryForm.doctorId },
            baseSalary: parseFloat(salaryForm.baseSalary),
            hikePercent: parseFloat(salaryForm.hikePercent),
            effectiveFrom: salaryForm.effectiveFrom
        };
        await api.post("/api/salary-records", payload);
        toast.success("Salary structure updated.");
        setIsSalaryDialogOpen(false);
        fetchData();
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
        toast.error("Failed to update salary.");
    } finally {
        setIsSaving(false);
    }
  };

  // --- Helpers ---

  const getDoctorName = (doc) => doc ? `${doc.firstName} ${doc.lastName}` : "Unknown";

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Filter Logic
  const filteredPayrolls = payrolls.filter(p => {
    const matchDate = p.month === selectedMonth && p.year.toString() === selectedYear.toString();
    const matchSearch = getDoctorName(p.doctor).toLowerCase().includes(searchTerm.toLowerCase());
    return matchDate && matchSearch;
  });

  // Calculate Net Salary for Preview
  const previewNetSalary = (parseFloat(payrollForm.grossSalary || 0) - parseFloat(payrollForm.deductions || 0));

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-8 pt-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payroll & Compensation</h2>
          <p className="text-muted-foreground">Manage monthly disbursements and salary structures.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="processing">Monthly Payroll</TabsTrigger>
            <TabsTrigger value="structure">Salary Structure</TabsTrigger>
        </TabsList>

        {/* --- TAB 1: PAYROLL PROCESSING --- */}
        <TabsContent value="processing" className="space-y-4">
            
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Disbursed ({selectedMonth})</CardTitle>
                        <Banknote className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-700">
                            {formatCurrency(filteredPayrolls.reduce((acc, curr) => acc + (curr.netSalary || 0), 0))}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Net Salary</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                             {filteredPayrolls.length > 0 
                                ? formatCurrency(filteredPayrolls.reduce((acc, c) => acc + c.netSalary, 0) / filteredPayrolls.length)
                                : "₹0"
                             }
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Records Processed</CardTitle>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredPayrolls.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-muted/40 p-4 rounded-lg border">
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger className="w-[130px] bg-background">
                            <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                            {["January","February","March","April","May","June","July","August","September","October","November","December"].map(m => (
                                <SelectItem key={m} value={m}>{m}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-[100px] bg-background">
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                            {[2023, 2024, 2025, 2026].map(y => (
                                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="relative">
                         <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                         <Input 
                            placeholder="Filter by doctor..." 
                            className="pl-9 w-[200px] bg-background"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                         />
                    </div>
                </div>
                <Button onClick={() => { resetPayrollForm(); setIsPayrollDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Process Payroll
                </Button>
            </div>

            {/* Table */}
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Doctor</TableHead>
                            <TableHead>Period</TableHead>
                            <TableHead className="text-right">Gross Salary</TableHead>
                            <TableHead className="text-right text-red-600">Deductions</TableHead>
                            <TableHead className="text-right font-bold">Net Salary</TableHead>
                            <TableHead className="text-right">Processed</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={7} className="h-24 text-center"><Loader2 className="animate-spin inline mr-2"/> Loading records...</TableCell></TableRow>
                        ) : filteredPayrolls.length === 0 ? (
                            <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No records found for {selectedMonth} {selectedYear}.</TableCell></TableRow>
                        ) : (
                            filteredPayrolls.map((p) => (
                                <TableRow key={p.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{getDoctorName(p.doctor)}</span>
                                            <span className="text-xs text-muted-foreground">{p.doctor?.specialization}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell><Badge variant="outline">{p.month} {p.year}</Badge></TableCell>
                                    <TableCell className="text-right text-muted-foreground">{formatCurrency(p.grossSalary)}</TableCell>
                                    <TableCell className="text-right text-red-600">-{formatCurrency(p.deductions)}</TableCell>
                                    <TableCell className="text-right font-bold text-green-700">{formatCurrency(p.netSalary)}</TableCell>
                                    <TableCell className="text-right text-xs text-muted-foreground">
                                        {format(new Date(p.processedAt || new Date()), "MMM dd")}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => openEditPayroll(p)}>
                                                    <Pencil className="mr-2 h-4 w-4" /> Edit Record
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem 
                                                    className="text-red-600 focus:text-red-600"
                                                    onClick={() => handleDeletePayroll(p.id)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
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
        </TabsContent>

        {/* --- TAB 2: SALARY STRUCTURE --- */}
        <TabsContent value="structure" className="space-y-4">
            <div className="flex justify-between items-center bg-muted/20 p-4 rounded-lg border">
                <div>
                    <h3 className="text-lg font-medium">Salary Definitions</h3>
                    <p className="text-sm text-muted-foreground">Define base salaries and history of hikes.</p>
                </div>
                <Button onClick={() => setIsSalaryDialogOpen(true)}>
                    <TrendingUp className="mr-2 h-4 w-4" /> Update Structure
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Doctor</TableHead>
                            <TableHead>Base Salary</TableHead>
                            <TableHead>Hike %</TableHead>
                            <TableHead>Effective From</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {salaryRecords.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No salary structures defined.</TableCell></TableRow>
                        ) : (
                            salaryRecords.sort((a,b) => new Date(b.effectiveFrom) - new Date(a.effectiveFrom)).map((record) => (
                                <TableRow key={record.id}>
                                    <TableCell className="font-medium">{getDoctorName(record.doctor)}</TableCell>
                                    <TableCell className="font-bold">{formatCurrency(record.baseSalary)}</TableCell>
                                    <TableCell>
                                        {record.hikePercent > 0 ? (
                                            <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                                                +{record.hikePercent}%
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground text-sm">Initial</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{format(new Date(record.effectiveFrom), "MMM dd, yyyy")}</TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Active</Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </TabsContent>

      </Tabs>

      {/* --- DIALOG: PAYROLL PROCESS/EDIT --- */}
      <Dialog open={isPayrollDialogOpen} onOpenChange={setIsPayrollDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle>{currentPayrollId ? "Edit Payroll Record" : "Process New Payroll"}</DialogTitle>
                <DialogDescription>
                    {currentPayrollId ? "Update calculations for this existing record." : "Calculate and record monthly salary payment."}
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
                
                {/* Doctor & Date Selection */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                         <Label className="mb-2 block">Employee (Doctor)</Label>
                         <Select 
                            value={payrollForm.doctorId} 
                            disabled={!!currentPayrollId} // Disable doctor change on Edit to prevent confusion
                            onValueChange={(val) => {
                                // Auto-fill base salary
                                const docSalary = salaryRecords.find(s => s.doctor?.id.toString() === val);
                                setPayrollForm({
                                    ...payrollForm, 
                                    doctorId: val,
                                    grossSalary: docSalary ? docSalary.baseSalary : "" 
                                });
                            }}
                        >
                            <SelectTrigger><SelectValue placeholder="Select Doctor" /></SelectTrigger>
                            <SelectContent>
                                {doctors.map(d => (
                                    <SelectItem key={d.id} value={d.id.toString()}>
                                        {d.firstName} {d.lastName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label className="mb-2 block">Month</Label>
                        <Select 
                            value={payrollForm.month} 
                            onValueChange={(val) => setPayrollForm({...payrollForm, month: val})}
                        >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {["January","February","March","April","May","June","July","August","September","October","November","December"].map(m => (
                                    <SelectItem key={m} value={m}>{m}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                         <Label className="mb-2 block">Year</Label>
                         <Input 
                            type="number" 
                            value={payrollForm.year} 
                            onChange={(e) => setPayrollForm({...payrollForm, year: e.target.value})} 
                        />
                    </div>
                </div>

                <Separator />

                {/* Calculations */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-green-700 font-semibold">Earnings (Gross)</Label>
                        <div className="relative">
                            <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                className="pl-9"
                                type="number"
                                placeholder="0.00"
                                value={payrollForm.grossSalary} 
                                onChange={(e) => setPayrollForm({...payrollForm, grossSalary: e.target.value})} 
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-red-600 font-semibold">Deductions</Label>
                        <div className="relative">
                            <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                className="pl-9"
                                type="number"
                                placeholder="0.00"
                                value={payrollForm.deductions} 
                                onChange={(e) => setPayrollForm({...payrollForm, deductions: e.target.value})} 
                            />
                        </div>
                    </div>
                </div>

                {/* Net Pay Preview */}
                <div className="bg-slate-100 p-4 rounded-lg flex items-center justify-between border">
                    <div className="flex items-center gap-2">
                        <Calculator className="h-5 w-5 text-muted-foreground" />
                        <span className="font-semibold text-sm">Net Payable Salary</span>
                    </div>
                    <span className="font-bold text-xl text-primary">
                        {formatCurrency(previewNetSalary)}
                    </span>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsPayrollDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSavePayroll} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {currentPayrollId ? "Update Record" : "Process Payment"}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- DIALOG: SALARY UPDATE --- */}
      <Dialog open={isSalaryDialogOpen} onOpenChange={setIsSalaryDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Update Salary Structure</DialogTitle>
                <DialogDescription>Define new base salary or apply a hike.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <Label>Doctor</Label>
                    <Select 
                        value={salaryForm.doctorId} 
                        onValueChange={(val) => setSalaryForm({...salaryForm, doctorId: val})}
                    >
                        <SelectTrigger><SelectValue placeholder="Select Doctor" /></SelectTrigger>
                        <SelectContent>
                            {doctors.map(d => (
                                <SelectItem key={d.id} value={d.id.toString()}>
                                    {d.firstName} {d.lastName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label>New Base Salary</Label>
                        <Input 
                            type="number"
                            value={salaryForm.baseSalary} 
                            onChange={(e) => setSalaryForm({...salaryForm, baseSalary: e.target.value})} 
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Hike %</Label>
                        <Input 
                            type="number"
                            value={salaryForm.hikePercent} 
                            onChange={(e) => setSalaryForm({...salaryForm, hikePercent: e.target.value})} 
                        />
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label>Effective Date</Label>
                    <Input 
                        type="date" 
                        value={salaryForm.effectiveFrom} 
                        onChange={(e) => setSalaryForm({...salaryForm, effectiveFrom: e.target.value})} 
                    />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsSalaryDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdateSalary} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Structure"}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}