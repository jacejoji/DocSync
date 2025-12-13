import React, { useEffect, useState } from 'react';
import axios from '@/lib/axios'; // Your custom axios instance
import { format } from 'date-fns';
import { toast } from 'sonner';
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Stethoscope, 
  PackageCheck, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

const CampsAndEquipment = () => {
  const [camps, setCamps] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loadingCamps, setLoadingCamps] = useState(true);
  const [loadingEquip, setLoadingEquip] = useState(true);
  const [returningId, setReturningId] = useState(null);

  // Fetch Upcoming Camps
  const fetchCamps = async () => {
    setLoadingCamps(true);
    try {
      const response = await axios.get('/api/medical-camps/upcoming');
      setCamps(response.data);
    } catch (error) {
      console.error("Error fetching camps:", error);
      toast.error("Failed to load upcoming medical camps.");
    } finally {
      setLoadingCamps(false);
    }
  };

  // Fetch Active Equipment Assignments
  const fetchAssignments = async () => {
    setLoadingEquip(true);
    try {
      // Based on your controller: returns list of assignments where returnedDate is null
      const response = await axios.get('/equipment/assignments');
      setAssignments(response.data);
    } catch (error) {
      console.error("Error fetching equipment:", error);
      toast.error("Failed to load equipment assignments.");
    } finally {
      setLoadingEquip(false);
    }
  };

  useEffect(() => {
    fetchCamps();
    fetchAssignments();
  }, []);

  // Handle Return Equipment
  const handleReturnEquipment = async (assignment) => {
    setReturningId(assignment.id);
    
    // Prepare payload: Set returnedDate to today
    const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD for LocalDate
    
    const payload = {
      ...assignment,
      returnedDate: today
    };

    try {
      // Using the PUT endpoint defined in your controller
      await axios.put(`/equipment/assign/${assignment.id}`, payload);
      
      toast.success(`Returned ${assignment.equipment.name} successfully!`);
      
      // Refresh list to remove the returned item (since the API only returns active ones)
      fetchAssignments(); 
    } catch (error) {
      console.error("Error returning equipment:", error);
      toast.error("Failed to return equipment. Please try again.");
    } finally {
      setReturningId(null);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Doctor Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your schedule and medical assets.
        </p>
      </div>

      <Tabs defaultValue="camps" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="camps" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Upcoming Camps
          </TabsTrigger>
          <TabsTrigger value="equipment" className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4" />
            My Equipment
          </TabsTrigger>
        </TabsList>

        {/* --- Upcoming Camps Tab --- */}
        <TabsContent value="camps" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Medical Camps Schedule</CardTitle>
              <CardDescription>
                View details for all upcoming scheduled medical camps.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingCamps ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
                  ))}
                </div>
              ) : camps.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                  <CalendarIcon className="h-10 w-10 mb-2 opacity-20" />
                  <p>No upcoming camps scheduled.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {camps.map((camp) => (
                    <Card key={camp.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg font-semibold text-primary">
                            {camp.campName}
                          </CardTitle>
                          <Badge variant="outline" className="ml-2 shrink-0">
                            Upcoming
                          </Badge>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <MapPin className="mr-1 h-3 w-3" />
                          {camp.location}
                        </div>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <div className="flex items-center gap-2 mb-3 bg-secondary/50 p-2 rounded-md w-fit">
                          <CalendarIcon className="h-4 w-4 text-secondary-foreground" />
                          <span className="text-sm font-medium">
                            {camp.date ? format(new Date(camp.date), 'MMMM dd, yyyy') : 'Date TBD'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {camp.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Equipment Tab --- */}
        <TabsContent value="equipment" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Equipment</CardTitle>
              <CardDescription>
                Manage equipment currently checked out to you. Return items once you are finished.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingEquip ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : assignments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-dashed border-2 rounded-lg">
                  <PackageCheck className="h-12 w-12 mb-3 opacity-20" />
                  <p className="font-medium">No active equipment assignments.</p>
                  <p className="text-sm">You have no pending returns.</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Equipment Name</TableHead>
                        <TableHead>Serial Number</TableHead>
                        <TableHead>Assigned Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignments.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell className="font-medium">
                            {assignment.equipment?.name || "Unknown Equipment"}
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                              {assignment.equipment?.serialNumber}
                            </span>
                          </TableCell>
                          <TableCell>
                            {assignment.assignedDate 
                              ? format(new Date(assignment.assignedDate), 'MMM dd, yyyy') 
                              : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="capitalize">
                              {assignment.equipment?.status || "Active"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              size="sm" 
                              variant="outline"
                              disabled={returningId === assignment.id}
                              onClick={() => handleReturnEquipment(assignment)}
                              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200"
                            >
                              {returningId === assignment.id ? (
                                <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                              ) : (
                                <PackageCheck className="mr-2 h-3 w-3" />
                              )}
                              {returningId === assignment.id ? "Returning..." : "Return"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-muted/50 text-xs text-muted-foreground px-6 py-3">
              <AlertCircle className="h-3 w-3 mr-2" />
              Returning equipment will update its status and remove it from your active list immediately.
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CampsAndEquipment;