import { useAuth } from "@/context/AuthContext";
import {
  Users,
  Building2,
  AlertCircle,
  TrendingUp,
  Search,
  MoreHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import AdminNavbar from "@/components/layout/AdminNavbar";
import { useEffect, useState } from "react";
import LoadingPage from "./LoadingPage";

export default function AdminDashboard() {
  // eslint-disable-next-line no-unused-vars
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true); // <--- 3. Loading State

  // 4. Simulate Data Fetching Effect
  useEffect(() => {
    // In the future, this is where you would await fetch("http://.../appointments")
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Show loader for 2 seconds

    return () => clearTimeout(timer);
  }, []);

  // 5. Render Loading Screen if active
  if (isLoading) {
    return <LoadingPage />;
  }

  // Mock Data
  const recentDoctors = [
    {
      name: "Dr. Gregory House",
      email: "dr.house@docsync.com",
      dept: "Diagnostic",
      status: "Active",
      date: "2024-01-15",
    },
    {
      name: "Dr. Stephen Strange",
      email: "dr.strange@docsync.com",
      dept: "Neurology",
      status: "Active",
      date: "2024-02-01",
    },
    {
      name: "Dr. Meredith Grey",
      email: "dr.grey@docsync.com",
      dept: "General Surgery",
      status: "On Leave",
      date: "2023-11-20",
    },
  ];

  return (
    <div className="min-h-screen bg-muted/20">

      <main className="p-6 space-y-8">
        {/* Stats Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45</div>
              <p className="text-xs text-muted-foreground">+2 new this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Active units</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">99.9%</div>
              <p className="text-xs text-muted-foreground">Uptime this week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content: Recent Registrations */}
        <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recent Doctor Registrations</CardTitle>
              <CardDescription>
                Overview of the latest medical staff added to the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Hire Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentDoctors.map((doc) => (
                    <TableRow key={doc.email}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback>{doc.name[4]}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span>{doc.name}</span>
                                <span className="text-xs text-muted-foreground">{doc.email}</span>
                            </div>
                        </div>
                      </TableCell>
                      <TableCell>{doc.dept}</TableCell>
                      <TableCell>
                        <Badge variant={doc.status === "Active" ? "outline" : "secondary"}>
                            {doc.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{doc.date}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
      </main>
    </div>
  );
}