import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner"; // <--- Import toast directly from sonner library
import {
  Stethoscope,
  UserPlus,
  Building2,
  FileBadge,
  ShieldCheck,
  Loader2,
} from "lucide-react";

import ThemeToggle from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DoctorRegister() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    specialization: "",
    hireDate: "",
    departmentId: "",
  });

  // 1. Fetch Departments
  useEffect(() => {
    fetch("http://localhost:8080/departments")
      .then((res) => res.json())
      .then((data) => setDepartments(data))
      .catch(() => {
        // Sonner usage: simple and clean
        toast.error("Network Error", {
          description: "Could not load departments. Is the backend running?",
        });
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDepartmentChange = (value) => {
    setFormData((prev) => ({ ...prev, departmentId: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      username: formData.email,
      password: formData.password,
      doctor: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        specialization: formData.specialization,
        hireDate: formData.hireDate,
        department: {
          id: parseInt(formData.departmentId),
        },
      },
    };

    try {
      const response = await fetch("http://localhost:8080/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("Account Created", {
          description: "Registration successful. Please log in.",
        });
        navigate("/doctor/login");
      } else {
        const text = await response.text();
        toast.error("Registration Failed", {
          description: text || "Please check your inputs and try again.",
        });
      }
    } catch (err) {
      toast.error("Network Error", {
        description: "Could not connect to the server.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="w-full border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Stethoscope className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-base">DocSync</span>
              <span className="text-[11px] text-muted-foreground">Doctor Portal</span>
            </div>
          </Link>

          <div className="flex items-center gap-3 text-xs">
            <Link to="/" className="hidden sm:inline text-muted-foreground hover:text-foreground">
              ← Home
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-5xl rounded-2xl border bg-background shadow-sm overflow-hidden grid md:grid-cols-2">
          
          {/* Left Column: Context */}
          <div className="hidden md:flex flex-col gap-6 bg-muted/60 px-8 py-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-primary">
                <UserPlus className="h-4 w-4" />
                <span>Join the Medical Team</span>
              </div>
              <h1 className="text-xl font-semibold tracking-tight">
                Empowering doctors with seamless digital tools.
              </h1>
              <p className="text-xs text-muted-foreground max-w-sm">
                Create your profile to start managing appointments, accessing patient history, and collaborating with your department.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 text-xs mt-4">
              <Feature icon={<ShieldCheck className="h-4 w-4" />} label="Secure & HIPPA Compliant" />
              <Feature icon={<Building2 className="h-4 w-4" />} label="Department Integration" />
              <Feature icon={<FileBadge className="h-4 w-4" />} label="Digital Certification" />
            </div>
          </div>

          {/* Right Column: Registration Form */}
          <div className="px-6 py-8 relative">
            <div className="w-full max-w-md mx-auto space-y-6">
              <div className="space-y-1 text-center md:text-left">
                <h2 className="text-xl font-semibold">Doctor Registration</h2>
                <p className="text-xs text-muted-foreground">
                  Enter your professional details to request access.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Account Info */}
                <div className="grid gap-3">
                    <div className="space-y-1">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="dr.name@hospital.com"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="password">Password</Label>
                        <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Create a strong password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Profile Details</span>
                    </div>
                </div>

                {/* Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="Gregory"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="House"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="+1 (555) 000-0000"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                {/* Professional Details */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <Label htmlFor="specialization">Specialization</Label>
                        <Input
                        id="specialization"
                        name="specialization"
                        placeholder="e.g. Cardiology"
                        required
                        value={formData.specialization}
                        onChange={handleChange}
                        />
                    </div>
                    
                    <div className="space-y-1">
                        <Label htmlFor="hireDate">Hire Date</Label>
                        <div className="relative">
                            <Input
                                id="hireDate"
                                name="hireDate"
                                type="date"
                                required
                                className="block w-full"
                                value={formData.hireDate}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {/* SHADCN SELECT for Department */}
                <div className="space-y-1">
                  <Label>Department</Label>
                  <Select onValueChange={handleDepartmentChange} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.length === 0 ? (
                        <SelectItem value="loading" disabled>Loading departments...</SelectItem>
                      ) : (
                        departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id.toString()}>
                            {dept.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>

                <div className="text-center text-xs text-muted-foreground mt-4">
                  Already have an account?{" "}
                  <Link to="/doctor/login" className="underline hover:text-primary">
                    Sign in
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Feature({ icon, label }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-background/70 px-3 py-2">
      <span className="text-primary">{icon}</span>
      <span className="text-[11px]">{label}</span>
    </div>
  );
}