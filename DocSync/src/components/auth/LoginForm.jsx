import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner"; // Using Sonner for alerts

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

export default function LoginForm({ roleLabel = "User" }) {
  const navigate = useNavigate();
  const { setUser } = useAuth(); // <--- 2. Get setUser from context
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include", 
      });

      if (response.ok) {
        const user = await response.json();
        
        // --- THE FIX: Update Global State Immediately ---
        setUser(user); 
        // ------------------------------------------------

        toast.success(`Welcome back, ${user.username}!`);

        if (user.role === "DOCTOR") {
            navigate("/doctor/dashboard");
        } else if (user.role === "ADMIN") {
            navigate("/admin/dashboard");
        } else {
            navigate("/");
        }

      } else {
        toast.error("Login Failed", {
            description: "Invalid credentials. Please try again."
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("System Error", {
        description: "Could not connect to server."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-1">
        <Label htmlFor="username">Email</Label>
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center">
            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
          </span>
          <Input
            id="username" // Matches state key
            type="email"
            placeholder="name@docsync.com"
            className="pl-9"
            required
            value={formData.username}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center">
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
          </span>
          <Input
            id="password" // Matches state key
            type="password"
            className="pl-9"
            required
            value={formData.password}
            onChange={handleChange}
          />
        </div>
      </div>

      <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </Button>

      {/* Logic to show Register link only for Doctors, not Admins (optional) */}
      {roleLabel === "Doctor" && (
        <div className="text-center text-xs text-muted-foreground mt-4">
            New to DocSync?{" "}
            <Link to="/doctor/register" className="underline hover:text-primary">
                Create an account
            </Link>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground text-center mt-2">
        You are accessing the <span className="font-medium">{roleLabel}</span>{" "}
        area.
      </p>
    </form>
  );
}