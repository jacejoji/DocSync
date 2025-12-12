/* eslint-disable no-unused-vars */
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

// Import the new utility
import { generatePayslip } from "@/lib/payslipGenerator"; // <--- Adjust path as needed

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
      if (user && user.id) {
        setResolvedUserId(user.id);
        return;
      }
      
      if (!authLoading) {
        try {
          const res = await api.get("/auth/me");
          if (res.data && res.data.id) {
            setResolvedUserId(res.data.id);
          } else {
            setIsLoadingData(false);
          }
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
      
      // Determine Current Salary (Active record logic)
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

  // --- 3. Handler for Download ---
  const handleDownloadClick = (payroll) => {
    const employeeDetails = {
        id: resolvedUserId,
        name: user?.name || user?.username || "Doctor"
    };
    // Call the utility
    generatePayslip(payroll, employeeDetails);
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
                                        <Button variant="ghost" size="sm" onClick={() => handleDownloadClick(p)}>
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