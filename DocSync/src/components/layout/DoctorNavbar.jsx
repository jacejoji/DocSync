import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Stethoscope,
  Search,
  Bell,
  LogOut,
  User,
  Settings,
  Menu
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
import ThemeToggle from "@/components/theme/ThemeToggle"; // Adjust path if needed

export default function DoctorNavbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur px-6 shadow-sm">
      {/* 1. Logo Section */}
      <Link to="/doctor/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary hover:opacity-90 transition-opacity">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Stethoscope className="h-5 w-5 text-primary" />
        </div>
        <span>DocSync</span>
      </Link>

      {/* 2. Navigation Links (Hidden on Mobile for now) */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground ml-6">
        <Link to="/doctor/dashboard" className="hover:text-primary transition-colors">Overview</Link>
        <Link to="/doctor/patients" className="hover:text-primary transition-colors">Patients</Link>
        <Link to="/doctor/schedule" className="hover:text-primary transition-colors">Schedule</Link>
      </nav>

      <div className="ml-auto flex items-center gap-4">
        {/* 3. Search Bar */}
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search patients..."
            className="w-64 pl-8 bg-background"
          />
        </div>

        {/* 4. Action Buttons */}
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Bell className="h-5 w-5" />
        </Button>
        
        <ThemeToggle />

        {/* 5. User Profile Dropdown */}
        <div className="flex items-center gap-2 border-l pl-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium leading-none">{user?.username?.split("@")[0]}</p>
            <p className="text-xs text-muted-foreground">Doctor</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer hover:opacity-80 transition-opacity h-9 w-9">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/10 text-primary">
                    {user?.username?.[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
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