import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { 
  Banknote, 
  TrendingUp, 
  History, 
  Download, 
  FileText, 
  Loader2,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";

// --- PDF Libraries ---
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";

export default function DoctorPayroll() {
  const { user, loading: authLoading } = useAuth();
  
  // Data States
  const [payrolls, setPayrolls] = useState([]);
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [currentSalary, setCurrentSalary] = useState(null);
  
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [resolvedUserId, setResolvedUserId] = useState(null);

  // --- 1. User Resolution (Self-Healing Logic) ---
  useEffect(() => {
    const resolveUser = async () => {
      // Check Context
      if (user && user.id) {
        setResolvedUserId(user.id);
        return;
      }
      
      // Check Manual Fetch
      if (!authLoading) {
        try {
          const res = await api.get("/auth/me");
          if (res.data && res.data.id) {
            setResolvedUserId(res.data.id);
          } else {
            setIsLoadingData(false);
          }
        // eslint-disable-next-line no-unused-vars
        } catch (error) {
          setIsLoadingData(false);
        }
      }
    };
    resolveUser();
  }, [user, authLoading]);

  // --- 2. Data Fetching ---
  useEffect(() => {
    if (resolvedUserId) {
      fetchData(resolvedUserId);
    }
  }, [resolvedUserId]);

  const fetchData = async (doctorId) => {
    setIsLoadingData(true);
    try {
      const [payrollRes, historyRes] = await Promise.all([
        api.get(`/api/payrolls/doctor/${doctorId}`),
        api.get(`/api/salary-records/doctor/${doctorId}`),
      ]);

      const historyData = Array.isArray(historyRes.data) ? historyRes.data : [];
      
      setPayrolls(Array.isArray(payrollRes.data) ? payrollRes.data : []);
      setSalaryHistory(historyData);
      
      // --- FIX: Correctly determine "Current" Salary ---
      // 1. Filter out future dates (hikes scheduled for later)
      // 2. Sort by Date Descending (Newest first)
      // 3. Pick the first one
      const today = new Date();
      const activeRecord = [...historyData]
        .filter(rec => new Date(rec.effectiveFrom) <= today)
        .sort((a,b) => new Date(b.effectiveFrom) - new Date(a.effectiveFrom))[0];

      setCurrentSalary(activeRecord || null);

    } catch (error) {
      console.error("Error fetching payroll data", error);
      toast.error("Failed to load payroll records.");
    } finally {
      setIsLoadingData(false);
    }
  };

  // --- Helpers ---
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateStr) => (!dateStr ? "-" : format(new Date(dateStr), "MMM dd, yyyy"));

  // --- 3. FIX: PDF Generation Logic ---
  const handleDownload = (payroll) => {
    try {
        const doc = new jsPDF();

        // Header
        doc.setFillColor(41, 128, 185); // Blue Header
        doc.rect(0, 0, 210, 20, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.text("SALARY SLIP", 105, 13, null, null, "center");

        // Info Section
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        
        const startY = 35;
        doc.text(`Employee ID: ${resolvedUserId}`, 14, startY);
        doc.text(`Name: ${user?.name || user?.username || "Doctor"}`, 14, startY + 6);
        
        doc.text(`Pay Period: ${payroll.month} ${payroll.year}`, 140, startY);
        doc.text(`Generated: ${format(new Date(), "dd-MM-yyyy")}`, 140, startY + 6);

        // Separator
        doc.setDrawColor(200, 200, 200);
        doc.line(14, startY + 12, 196, startY + 12);

        // Table
        autoTable(doc, {
            startY: startY + 20,
            head: [['Earnings / Deductions', 'Amount (INR)']],
            body: [
                ['Basic Salary (Gross)', formatCurrency(payroll.grossSalary)],
                ['Tax & Deductions', `-${formatCurrency(payroll.deductions)}`],
                [{ content: 'NET PAYABLE', styles: { fontStyle: 'bold', fillColor: [220, 252, 231] } }, 
                 { content: formatCurrency(payroll.netSalary), styles: { fontStyle: 'bold', fillColor: [220, 252, 231], textColor: [22, 163, 74] } }]
            ],
            theme: 'grid',
            headStyles: { fillColor: [51, 65, 85] }, // Slate-700
            styles: { fontSize: 10, cellPadding: 3 },
        });

        // Footer
        const finalY = doc.lastAutoTable.finalY + 30;
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("System Generated Payslip. DocSync Doctor Management.", 105, finalY, null, null, "center");

        doc.save(`Payslip_${payroll.month}_${payroll.year}.pdf`);
        toast.success("Payslip downloaded.");

    } catch (error) {
        console.error(error);
        toast.error("Failed to generate PDF.");
    }
  };

  // --- Render ---

  if (authLoading || (isLoadingData && !resolvedUserId)) {
      return (
          <div className="flex h-screen w-full items-center justify-center flex-col gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-muted-foreground text-sm">Loading payroll data...</span>
          </div>
      );
  }

  if (!isLoadingData && !resolvedUserId) {
      return (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
              <AlertTriangle className="h-12 w-12 text-red-500" />
              <h2 className="text-xl font-bold">Access Error</h2>
              <p className="text-muted-foreground">Unable to verify doctor profile. Please refresh.</p>
              <Button onClick={() => window.location.reload()}>Refresh Page</Button>
          </div>
      );
  }

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-8 pt-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Payroll</h2>
        <p className="text-muted-foreground">View salary slips and compensation history.</p>
      </div>

      {/* KPI Cards: Current Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Base Salary</CardTitle>
                <Banknote className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-green-700">
                    {formatCurrency(currentSalary?.baseSalary || 0)}
                </div>
                <p className="text-xs text-muted-foreground">Monthly gross base</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last Hike</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {currentSalary?.hikePercent ? `+${currentSalary.hikePercent}%` : "0%"}
                </div>
                <p className="text-xs text-muted-foreground">
                    Effective: {formatDate(currentSalary?.effectiveFrom)}
                </p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Payslips Available</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{payrolls.length}</div>
                <p className="text-xs text-muted-foreground">Processed records</p>
            </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="payslips" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="payslips" className="gap-2"><FileText className="h-4 w-4" /> Salary Slips</TabsTrigger>
            <TabsTrigger value="structure" className="gap-2"><History className="h-4 w-4" /> History</TabsTrigger>
        </TabsList>

        {/* TAB 1: PAYSLIPS */}
        <TabsContent value="payslips" className="space-y-4">
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Month / Year</TableHead>
                            <TableHead className="text-right">Gross Earnings</TableHead>
                            <TableHead className="text-right text-red-600">Deductions</TableHead>
                            <TableHead className="text-right font-bold">Net Pay</TableHead>
                            <TableHead className="text-right">Processed On</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {payrolls.length === 0 ? (
                            <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No payslips found.</TableCell></TableRow>
                        ) : (
                            payrolls.map((p) => (
                                <TableRow key={p.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">🗓️</span>
                                            {p.month} {p.year}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">{formatCurrency(p.grossSalary)}</TableCell>
                                    <TableCell className="text-right text-red-600">-{formatCurrency(p.deductions)}</TableCell>
                                    <TableCell className="text-right font-bold text-green-700">{formatCurrency(p.netSalary)}</TableCell>
                                    <TableCell className="text-right text-xs text-muted-foreground">
                                        {formatDate(p.processedAt)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={() => handleDownload(p)}>
                                            <Download className="h-4 w-4 mr-2" /> Slip
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </TabsContent>

        {/* TAB 2: SALARY HISTORY */}
        <TabsContent value="structure" className="space-y-4">
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Effective Date</TableHead>
                            <TableHead>Base Salary</TableHead>
                            <TableHead>Hike Percentage</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {salaryHistory.length === 0 ? (
                            <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No salary history found.</TableCell></TableRow>
                        ) : (
                            // Use safe spread copy to sort
                            [...salaryHistory]
                                .sort((a,b) => new Date(b.effectiveFrom) - new Date(a.effectiveFrom))
                                .map((record, index) => (
                                    <TableRow key={record.id}>
                                        <TableCell>{formatDate(record.effectiveFrom)}</TableCell>
                                        <TableCell className="font-medium">{formatCurrency(record.baseSalary)}</TableCell>
                                        <TableCell>
                                            {record.hikePercent > 0 ? (
                                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                                    +{record.hikePercent}% Hike
                                                </Badge>
                                            ) : (
                                                <span className="text-muted-foreground">Base</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {index === 0 && new Date(record.effectiveFrom) <= new Date() ? 
                                                <Badge>Active</Badge> : 
                                                new Date(record.effectiveFrom) > new Date() ? 
                                                <Badge variant="outline" className="text-blue-600 border-blue-200">Scheduled</Badge> :
                                                <Badge variant="outline">Past</Badge>
                                            }
                                        </TableCell>
                                    </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}