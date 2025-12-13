import React, { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { format } from 'date-fns';
import { 
  Search, Filter, Phone, Mail, MapPin, 
  Calendar, Clock, FileText, ChevronRight, 
  Stethoscope, AlertCircle
} from 'lucide-react';

import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent,
} from "@/components/ui/dialog";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

const MyPatients = () => {
  // --- State ---
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientHistory, setPatientHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // --- Fetch ---
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get('/api/patients');
        setPatients(response.data);
      } catch (error) {
        console.error("Failed to fetch patients:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const handleViewPatient = async (patient) => {
    setSelectedPatient(patient);
    setIsDialogOpen(true);
    setLoadingHistory(true);
    setPatientHistory([]); 

    try {
      const response = await axios.get(`/appointments/patient/${patient.id}/history`);
      // Sort history by date descending (newest first)
      const sortedHistory = response.data.sort((a, b) => 
        new Date(b.appointmentTime) - new Date(a.appointmentTime)
      );
      setPatientHistory(sortedHistory);
    } catch (error) {
      console.error("Failed to fetch patient history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  // --- Helpers ---
  const filteredPatients = patients.filter((patient) => {
    const query = searchQuery.toLowerCase();
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
    const email = patient.email ? patient.email.toLowerCase() : "";
    const matchesSearch = fullName.includes(query) || email.includes(query);
    const matchesGender = genderFilter === "all" || patient.gender?.toLowerCase() === genderFilter.toLowerCase();
    return matchesSearch && matchesGender;
  });

  const getInitials = (f, l) => `${f?.charAt(0) || ''}${l?.charAt(0) || ''}`.toUpperCase();

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === 'completed') return 'bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-200';
    if (s === 'cancelled') return 'destructive';
    return 'secondary';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Patients</h1>
          <p className="text-muted-foreground mt-1">
            Manage patient records and view clinical history.
          </p>
        </div>
        {/* Removed "Add New Patient" button */}
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                className="pl-9 bg-muted/30"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Filters */}
            <div className="flex gap-2 w-full md:w-auto">
              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger className="w-[160px] bg-muted/30">
                  <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="pl-6 w-[300px]">Patient Name</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Skeleton Loading State
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-6"><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-20" /></div></div></TableCell>
                    <TableCell><div className="space-y-2"><Skeleton className="h-3 w-40" /><Skeleton className="h-3 w-24" /></div></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="text-right pr-6"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredPatients.length === 0 ? (
                // Empty State
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                        <Search className="h-6 w-6 text-muted-foreground/50" />
                      </div>
                      <p className="font-medium">No patients found</p>
                      <p className="text-sm">Try adjusting your search or filters.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                // Data Rows
                filteredPatients.map((patient) => (
                  <TableRow key={patient.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-border/50">
                          <AvatarFallback className="bg-primary/5 text-primary font-medium">
                            {getInitials(patient.firstName, patient.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {patient.firstName} {patient.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {patient.gender}, {patient.dateOfBirth ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : '?'} yrs
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                          <Mail className="h-3.5 w-3.5" /> {patient.email}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                          <Phone className="h-3.5 w-3.5" /> {patient.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                       <Badge variant="outline" className="font-normal text-muted-foreground bg-background">
                          Blood: <span className="font-bold text-foreground ml-1">{patient.bloodGroup || 'N/A'}</span>
                       </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                       {patient.createdAt ? format(new Date(patient.createdAt), 'MMM dd, yyyy') : '-'}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleViewPatient(patient)}
                      >
                        Details <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* --- PATIENT PROFILE DIALOG --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl h-[85vh] p-0 gap-0 overflow-hidden flex flex-col">
          
          {selectedPatient && (
            <>
              {/* 1. Dialog Header (Sticky) */}
              <div className="p-6 border-b bg-muted/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                      {getInitials(selectedPatient.firstName, selectedPatient.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="capitalize px-2 py-0.5">{selectedPatient.gender}</Badge>
                      <span className="text-muted-foreground text-sm">•</span>
                      <span className="text-sm text-muted-foreground">
                        DOB: {selectedPatient.dateOfBirth ? format(new Date(selectedPatient.dateOfBirth), 'dd MMM yyyy') : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Removed New Appointment & Call Buttons */}
              </div>

              {/* 2. Dialog Content (Scrollable) */}
              <div className="flex-1 bg-background">
                <Tabs defaultValue="history" className="h-full flex flex-col">
                  <div className="px-6 border-b">
                    <TabsList className="bg-transparent h-12 p-0 space-x-6">
                      <TabsTrigger value="history" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-0">
                        Medical History
                      </TabsTrigger>
                      <TabsTrigger value="overview" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-0">
                        Contact & Vitals
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="flex-1 overflow-hidden bg-muted/5">
                    
                    {/* --- TAB: HISTORY (TIMELINE) --- */}
                    <TabsContent value="history" className="h-full m-0 p-0">
                      <ScrollArea className="h-full p-6">
                        {loadingHistory ? (
                          <div className="space-y-4">
                             {[1,2,3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
                          </div>
                        ) : patientHistory.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-60">
                            <Calendar className="h-16 w-16 mb-4 stroke-1" />
                            <p className="text-lg">No appointment history</p>
                          </div>
                        ) : (
                          <div className="relative space-y-6 pl-4 before:absolute before:left-[19px] before:top-2 before:bottom-4 before:w-[2px] before:bg-border">
                            {patientHistory.map((appt) => (
                              <div key={appt.id} className="relative pl-8 group">
                                {/* Timeline Dot */}
                                <div className="absolute left-0 top-1.5 h-[10px] w-[10px] rounded-full bg-primary ring-4 ring-background group-hover:ring-primary/20 transition-all z-10" />
                                
                                <Card className="border shadow-sm hover:shadow-md transition-shadow">
                                  <CardContent className="p-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                                      <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                          <Calendar className="h-5 w-5" />
                                        </div>
                                        <div>
                                          <p className="font-semibold">
                                            {appt.appointmentTime ? format(new Date(appt.appointmentTime), 'EEEE, MMMM do, yyyy') : 'Date N/A'}
                                          </p>
                                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                            <Clock className="h-3 w-3" />
                                            {appt.appointmentTime ? format(new Date(appt.appointmentTime), 'h:mm a') : 'Time N/A'}
                                          </div>
                                        </div>
                                      </div>
                                      <Badge variant="outline" className={`${getStatusColor(appt.status)} capitalize`}>
                                        {appt.status || 'Scheduled'}
                                      </Badge>
                                    </div>
                                    
                                    {/* Doctor Notes Section */}
                                    <div className="bg-muted/30 p-3 rounded-md text-sm text-foreground/80 leading-relaxed border border-border/50">
                                      <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        <Stethoscope className="h-3 w-3" /> Doctor's Notes
                                      </div>
                                      {appt.notes || <span className="italic text-muted-foreground">No notes recorded for this visit.</span>}
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </TabsContent>

                    {/* --- TAB: OVERVIEW --- */}
                    <TabsContent value="overview" className="h-full m-0">
                      <ScrollArea className="h-full p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                          
                          {/* Personal Info */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary" /> Personal Details
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                              <div className="grid grid-cols-3 border-b pb-3">
                                <span className="text-muted-foreground col-span-1">Blood Group</span>
                                <span className="font-medium col-span-2">{selectedPatient.bloodGroup || 'Not set'}</span>
                              </div>
                              <div className="grid grid-cols-3 border-b pb-3">
                                <span className="text-muted-foreground col-span-1">Date of Birth</span>
                                <span className="font-medium col-span-2">
                                  {selectedPatient.dateOfBirth ? format(new Date(selectedPatient.dateOfBirth), 'MMMM dd, yyyy') : '-'}
                                </span>
                              </div>
                              <div className="grid grid-cols-3">
                                <span className="text-muted-foreground col-span-1">Gender</span>
                                <span className="font-medium capitalize col-span-2">{selectedPatient.gender}</span>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Contact Info */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base flex items-center gap-2">
                                <Phone className="h-4 w-4 text-primary" /> Contact Information
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                              <div className="flex items-start gap-3">
                                <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div>
                                  <p className="font-medium">Email Address</p>
                                  <p className="text-muted-foreground">{selectedPatient.email}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div>
                                  <p className="font-medium">Phone Number</p>
                                  <p className="text-muted-foreground">{selectedPatient.phone}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div>
                                  <p className="font-medium">Home Address</p>
                                  <p className="text-muted-foreground leading-snug">
                                    {selectedPatient.address || 'No address provided'}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                           {/* Emergency Contact */}
                           <Card className="md:col-span-2 border-l-4 border-l-red-500/50">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-red-500" /> Emergency Contact
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm grid md:grid-cols-2 gap-4">
                              <div>
                                <span className="text-muted-foreground block text-xs uppercase tracking-wider">Name</span>
                                <span className="font-medium text-lg">{selectedPatient.emergencyContactName || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block text-xs uppercase tracking-wider">Phone</span>
                                <span className="font-medium text-lg">{selectedPatient.emergencyContactPhone || 'N/A'}</span>
                              </div>
                            </CardContent>
                          </Card>

                        </div>
                      </ScrollArea>
                    </TabsContent>

                  </div>
                </Tabs>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyPatients;