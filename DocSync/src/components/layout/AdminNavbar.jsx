import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  ShieldCheck,
  Search,
  LogOut,
  User,
  Settings,
  Bell,
  Menu,
  Stethoscope,
  Users,
  Briefcase,
  Building2,
  FileText,
  Activity,
  HardHat,
  CreditCard
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { cn } from "@/lib/utils";

// Helper component for Navigation Menu Items
const ListItem = React.forwardRef(({ className, title, children, icon, href, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref}
          to={href}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="flex items-center gap-2 text-sm font-medium leading-none">
            <span className="text-primary">{icon}</span>
            {title}
          </div>
          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground mt-1.5">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

export default function AdminNavbar() {
  const { user, logout } = useAuth();
  
  // Mock notification count based on your Notification entity
  const unreadNotifications = 3; 

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 md:px-6">
        
        {/* 1. Mobile Menu Trigger (Sheet) */}
        <div className="mr-2 md:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left">
                    <div className="flex flex-col gap-4 mt-4">
                        <Link to="/admin/dashboard" className="text-lg font-bold">Dashboard</Link>
                        <div className="text-sm font-semibold text-muted-foreground">HR & Staff</div>
                        <Link to="/admin/workforce" className="ml-4 text-sm">Doctor Directory</Link>
                        <Link to="/admin/payroll" className="ml-4 text-sm">Payroll & Salary</Link>
                        <Link to="/admin/roster" className="ml-4 text-sm">Duty Rosters</Link>
                        
                        <div className="text-sm font-semibold text-muted-foreground mt-2">Clinical</div>
                        <Link to="/admin/patients" className="ml-4 text-sm">Patients</Link>
                        <Link to="/admin/appointments" className="ml-4 text-sm">Appointments</Link>
                        
                        <div className="text-sm font-semibold text-muted-foreground mt-2">Resources</div>
                        <Link to="/admin/inventory" className="ml-4 text-sm">Equipment</Link>
                    </div>
                </SheetContent>
            </Sheet>
        </div>

        {/* 2. Logo */}
        <Link to="/admin/dashboard" className="mr-6 flex items-center gap-2 font-bold text-xl text-primary hover:opacity-90">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <span className="hidden sm:inline-block">Doc<span className="text-blue-600 dark:text-blue-400">Sync</span> <span className="text-xs font-normal text-muted-foreground">Admin</span></span>
        </Link>

        {/* 3. Desktop Navigation (Mega Menu Structure) */}
        <div className="hidden md:flex">
          <NavigationMenu>
            <NavigationMenuList>
              
              {/* HR & Staff Module */}
              <NavigationMenuItem>
                <NavigationMenuTrigger>HR & Staff</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <Link
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                          to="/admin/workforce"
                        >
                          <Users className="h-6 w-6" />
                          <div className="mb-2 mt-4 text-lg font-medium">
                            Workforce
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Manage doctor profiles, organizational charts, and transfers.
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <ListItem href="/admin/payroll" title="Payroll" icon={<CreditCard className="h-4 w-4" />}>
                      Salary records, hikes, and processing.
                    </ListItem>
                    <ListItem href="/admin/leavesandattendance" title="Leaves & Attendance" icon={<Activity className="h-4 w-4" />}>
                      Track check-ins and leave requests.
                    </ListItem>
                    <ListItem href="/admin/dutyroster" title="Duty Roster" icon={<Briefcase className="h-4 w-4" />}>
                      Shift management and schedules.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Clinical Module */}
              <NavigationMenuItem>
                <NavigationMenuTrigger>Clinical</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    <ListItem href="/admin/patients" title="Patients" icon={<Users className="h-4 w-4" />}>
                      Directory, admission, and records.
                    </ListItem>
                    <ListItem href="/admin/appointments" title="Appointments" icon={<Stethoscope className="h-4 w-4" />}>
                      Scheduling and status tracking.
                    </ListItem>
                    <ListItem href="/admin/insurance" title="Insurance Claims" icon={<FileText className="h-4 w-4" />}>
                      Process claims and approvals.
                    </ListItem>
                    <ListItem href="/admin/grievance" title="Grievance" icon={<FileText className="h-4 w-4" />}>
                      Respond to Grievance tickets.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Resources & Master Module */}
              <NavigationMenuItem>
                <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                    <ListItem href="/admin/departments" title="Departments" icon={<Building2 className="h-4 w-4" />}>
                      Manage hospital wings.
                    </ListItem>
                    <ListItem href="/admin/equipment" title="Equipment" icon={<HardHat className="h-4 w-4" />}>
                      Inventory status and assignment.
                    </ListItem>
                    <ListItem href="/admin/compliance" title="Compliance" icon={<ShieldCheck className="h-4 w-4" />}>
                      Mandatory training and status.
                    </ListItem>
                    <ListItem href="/admin/medicalcamps" title="Medical Camps" icon={<Activity className="h-4 w-4" />}>
                      Outreach programs and assignments.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* 4. Right Side Actions */}
        <div className="ml-auto flex items-center gap-4">
          
          {/* Global Search */}
          <div className="relative hidden lg:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search doctors, patients..."
              className="w-64 pl-8 bg-background h-9"
            />
          </div>

          <ThemeToggle />

          {/* Notifications (Mapped to Notification Entity) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadNotifications > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* Simulated Data */}
                <div className="max-h-[300px] overflow-y-auto">
                    <DropdownMenuItem className="cursor-pointer flex flex-col items-start gap-1 p-3">
                        <span className="font-medium text-xs">Leave Request: Dr. Smith</span>
                        <span className="text-xs text-muted-foreground">Requested sick leave for Dec 12.</span>
                        <span className="text-[10px] text-muted-foreground self-end">2 mins ago</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer flex flex-col items-start gap-1 p-3">
                         <span className="font-medium text-xs">Inventory Alert</span>
                         <span className="text-xs text-muted-foreground">MRI Machine service due.</span>
                         <span className="text-[10px] text-muted-foreground self-end">1 hour ago</span>
                    </DropdownMenuItem>
                </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer hover:opacity-80 transition-opacity h-9 w-9 border">
                {/* Fallback to initials if no image */}
                <AvatarImage src="" /> 
                <AvatarFallback className="bg-primary/10 text-primary">
                    {user?.username ? user.username.substring(0, 2).toUpperCase() : 'AD'}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.username || "Administrator"}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.role || "System Admin"}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Audit Logs</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}