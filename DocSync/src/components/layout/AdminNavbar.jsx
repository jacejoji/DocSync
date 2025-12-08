import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  ShieldCheck,
  Search,
  LogOut,
  User,
  Settings,
  LayoutDashboard,
  Users,
  Building2
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
import ThemeToggle from "@/components/theme/ThemeToggle";

export default function AdminNavbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur px-6 shadow-sm">
      {/* 1. Admin Logo */}
      <Link to="/admin/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary hover:opacity-90 transition-opacity">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <ShieldCheck className="h-5 w-5 text-primary" />
        </div>
        <span>DocSync <span className="text-xs font-normal text-muted-foreground ml-1">Admin</span></span>
      </Link>

      {/* 2. Admin Links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground ml-6">
        <Link to="/admin/dashboard" className="flex items-center gap-2 hover:text-primary transition-colors">
            <LayoutDashboard className="h-4 w-4" /> Dashboard
        </Link>
        <Link to="/admin/departments" className="flex items-center gap-2 hover:text-primary transition-colors">
            <Building2 className="h-4 w-4" /> Departments
        </Link>
        <Link to="/admin/doctors" className="flex items-center gap-2 hover:text-primary transition-colors">
            <Users className="h-4 w-4" /> Staff
        </Link>
      </nav>

      <div className="ml-auto flex items-center gap-4">
        {/* 3. Global Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search system..."
            className="w-64 pl-8 bg-background"
          />
        </div>
        
        <ThemeToggle />

        {/* 4. Admin Profile */}
        <div className="flex items-center gap-2 border-l pl-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium leading-none">Administrator</p>
            <p className="text-xs text-muted-foreground">System Access</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer hover:opacity-80 transition-opacity h-9 w-9">
                <AvatarImage src="" />
                <AvatarFallback className="bg-destructive/10 text-destructive">
                    AD
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Admin Controls</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>System Settings</span>
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