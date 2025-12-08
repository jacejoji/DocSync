import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoadingPage from "./pages/LoadingPage";
import AdminLogin from "./pages/AdminLogin";
import DoctorLogin from "./pages/DoctorLogin";

import { ThemeProvider } from "./components/theme/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import DoctorRegister from "./pages/DoctorRegister";
import { AuthProvider } from "@/context/AuthContext"; // <--- Import Provider
import ProtectedRoute from "@/components/auth/ProtectedRoute"; // <--- Import Guard
import ForbiddenPage from "./pages/ForbiddenPage";
import DoctorDashboard from "./pages/DoctorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import PublicRoute from "./components/auth/PublicRoute";
export default function App() {
  return (
    <ThemeProvider >
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* --- Public Routes --- */}
            <Route path="/" element={<LandingPage />} />
            {/* --- Public Routes (Wrapped to redirect if already logged in) --- */}
            <Route 
              path="/admin/login" 
              element={
                <PublicRoute>
                  <AdminLogin />
                </PublicRoute>
              } 
            />
            <Route 
              path="/doctor/login" 
              element={
                <PublicRoute>
                  <DoctorLogin />
                </PublicRoute>
              } 
            />
            <Route 
              path="/doctor/register" 
              element={
                <PublicRoute>
                  <DoctorRegister />
                </PublicRoute>
              } 
            />
            <Route path="/loading" element={<LoadingPage />} />
            <Route path="/forbidden" element={<ForbiddenPage />} />

            {/* --- Protected Routes --- */}
            
            {/* 2. Protect Doctor Dashboard */}
            <Route 
              path="/doctor/dashboard" 
              element={
                <ProtectedRoute allowedRoles={["DOCTOR"]}>
                  <DoctorDashboard />
                </ProtectedRoute>
              } 
            />

            {/* 3. Protect Admin Dashboard */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
