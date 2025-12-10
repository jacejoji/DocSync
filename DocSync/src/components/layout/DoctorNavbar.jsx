import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Stethoscope,
  Search,
  Bell,
  LogOut,
  User,
  Settings,
  Menu,
  CalendarCheck,
  ClipboardList,
  Users,
  Clock,
  Briefcase,
  FileText,
  BadgeDollarSign
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

// Helper component for uniform links
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

export default function DoctorNavbar() {
  const { user, logout } = useAuth();

  // Mock notifications based on Notification entity
  const unreadNotifications = 2; 

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur px-6 shadow-sm">
      
      {/* 1. Mobile Menu (Sheet) */}
      <div className="md:hidden mr-2">
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <div className="flex flex-col gap-4 mt-4">
                    <Link to="/doctor/dashboard" className="text-lg font-bold">Dashboard</Link>
                    
                    <div className="text-sm font-semibold text-muted-foreground">Clinical</div>
                    <Link to="/doctor/appointments" className="ml-4 text-sm">My Appointments</Link>
                    <Link to="/doctor/patients" className="ml-4 text-sm">Patient Records</Link>

                    <div className="text-sm font-semibold text-muted-foreground mt-2">Work & Schedule</div>
                    <Link to="/doctor/roster" className="ml-4 text-sm">Duty Roster</Link>
                    <Link to="/doctor/leaves" className="ml-4 text-sm">Leave Requests</Link>
                    <Link to="/doctor/payroll" className="ml-4 text-sm">My Payroll</Link>
                </div>
            </SheetContent>
        </Sheet>
      </div>

      {/* 2. Logo Section */}
      <Link to="/doctor/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary hover:opacity-90 transition-opacity mr-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Stethoscope className="h-5 w-5 text-primary" />
        </div>
        <span className="hidden sm:inline-block">Doc<span className="text-blue-600 dark:text-blue-400">Sync</span></span>
      </Link>

      {/* 3. Desktop Navigation (Grouped by Function) */}
      <div className="hidden md:flex">
        <NavigationMenu>
            <NavigationMenuList>
                
                {/* Clinical Module */}
                <NavigationMenuItem>
                    <NavigationMenuTrigger>Clinical Care</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                            <li className="row-span-3">
                                <NavigationMenuLink asChild>
                                    <Link
                                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                                        to="/doctor/appointments"
                                    >
                                        <CalendarCheck className="h-6 w-6" />
                                        <div className="mb-2 mt-4 text-lg font-medium">
                                            Appointments
                                        </div>
                                        <p className="text-sm leading-tight text-muted-foreground">
                                            View upcoming visits, manage schedule, and check-in patients.
                                        </p>
                                    </Link>
                                </NavigationMenuLink>
                            </li>
                            <ListItem href="/doctor/patients" title="My Patients" icon={<Users className="h-4 w-4" />}>
                                Access patient history, diagnosis, and treatments.
                            </ListItem>
                            <ListItem href="/doctor/tasks" title="Tasks" icon={<ClipboardList className="h-4 w-4" />}>
                                View assigned medical tasks and follow-ups.
                            </ListItem>
                            <ListItem href="/doctor/camps" title="Medical Camps" icon={<Briefcase className="h-4 w-4" />}>
                                Upcoming camp assignments.
                            </ListItem>
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>

                {/* HR & Personal Module */}
                <NavigationMenuItem>
                    <NavigationMenuTrigger>My Work</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                            <ListItem href="/doctor/roster" title="Duty Roster" icon={<Clock className="h-4 w-4" />}>
                                Check shift timings and weekly schedule.
                            </ListItem>
                            <ListItem href="/doctor/leaves" title="Leaves" icon={<FileText className="h-4 w-4" />}>
                                Apply for leave and view status.
                            </ListItem>
                            <ListItem href="/doctor/payroll" title="Payroll" icon={<BadgeDollarSign className="h-4 w-4" />}>
                                View salary slips and tax details.
                            </ListItem>
                            <ListItem href="/doctor/documents" title="Documents" icon={<FileText className="h-4 w-4" />}>
                                Upload certificates and view contracts.
                            </ListItem>
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>

            </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div className="ml-auto flex items-center gap-4">
        {/* 4. Search Bar */}
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search patients..."
            className="w-64 pl-8 bg-background h-9"
          />
        </div>

        <ThemeToggle />

        {/* 5. Notifications */}
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-muted-foreground">
                    <Bell className="h-5 w-5" />
                    {unreadNotifications > 0 && (
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer flex flex-col items-start gap-1 p-3">
                    <span className="font-medium text-xs">New Appointment</span>
                    <span className="text-xs text-muted-foreground">Patient John Doe booked for 10:00 AM.</span>
                </DropdownMenuItem>
                 <DropdownMenuItem className="cursor-pointer flex flex-col items-start gap-1 p-3">
                    <span className="font-medium text-xs">Shift Change Approved</span>
                    <span className="text-xs text-muted-foreground">Your request for Friday off was approved.</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
        
        {/* 6. User Profile Dropdown */}
        <div className="flex items-center gap-2 border-l pl-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium leading-none">
                {user?.username ? user.username.split("@")[0] : "Doctor"}
            </p>
            <p className="text-xs text-muted-foreground">Cardiology</p> {/* Static for now, can be dynamic */}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer hover:opacity-80 transition-opacity h-9 w-9 border">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/10 text-primary">
                    {user?.username ? user.username[0].toUpperCase() : "DR"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
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