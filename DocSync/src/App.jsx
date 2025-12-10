import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// 1. Pages
import LandingPage from "./pages/LandingPage";
import LoadingPage from "./pages/LoadingPage";
import ForbiddenPage from "./pages/ForbiddenPage";

// 2. Auth Pages
import AdminLogin from "./pages/AdminLogin";
import DoctorLogin from "./pages/DoctorLogin";
import DoctorRegister from "./pages/DoctorRegister";

// 3. Layouts & Admin Components
import AdminLayout from "@/components/layout/AdminLayout"; 
import DoctorLayout from "./components/layout/DoctorLayout";
import DoctorDashboard from "./pages/DoctorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Departments from "./pages/admin/Departments"; 
import Equipment from "./pages/admin/Equipment";     

// 5. Context & Providers
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PublicRoute from "@/components/auth/PublicRoute";
import ComplianceTraining from "./pages/admin/ComplianceTraining";
import MedicalCamps from "./pages/admin/MedicalCamps";
import DutyRosterPage from "./pages/admin/DutyRosterPage";
import DutyRoster from "./pages/admin/DutyRosterPage";
import LeavesAndAttendance from "./pages/admin/LeavesAndAttendance";
import Payroll from "./pages/admin/Payroll";
import Patients from "./pages/admin/Patients";
import Appointments from "./pages/admin/Appointments";
import Insurance from "./pages/admin/Insurance";
import Grievance from "./pages/admin/Grievance";
import Workforce from "./pages/admin/Workforce";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* --- Public Routes --- */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/loading" element={<LoadingPage />} />
            <Route path="/forbidden" element={<ForbiddenPage />} />

            {/* --- Auth Routes (Redirects if logged in) --- */}
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

            <Route
              path="/doctor"
              element={
                <ProtectedRoute allowedRoles={["DOCTOR"]}>
                  <DoctorLayout />
                </ProtectedRoute>
              }
            >
              {/* Default redirect: /doctor -> /doctor/dashboard */}
              <Route index element={<Navigate to="dashboard" replace />} />
              
              <Route path="dashboard" element={<DoctorDashboard />} />
              
              {/* Placeholders*/}
              <Route path="appointments" element={<div className="p-6">Appointments Page Coming Soon</div>} />
              <Route path="patients" element={<div className="p-6">My Patients Page Coming Soon</div>} />
              <Route path="roster" element={<div className="p-6">Duty Roster Page Coming Soon</div>} />
              <Route path="leaves" element={<div className="p-6">Leave Management Page Coming Soon</div>} />
              <Route path="payroll" element={<div className="p-6">Payroll Page Coming Soon</div>} />
            </Route>

            {/* --- ADMIN ROUTES (Nested Layout Architecture) --- */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              {/* Default redirect: /admin -> /admin/dashboard */}
              <Route index element={<Navigate to="dashboard" replace />} />

              {/* The <Outlet /> in AdminLayout will render these: */}
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="departments" element={<Departments />} />
              <Route path="equipment" element={<Equipment />} />
              <Route path="compliance" element={<ComplianceTraining />} />
              <Route path="medicalcamps" element={<MedicalCamps />} />
              <Route path="dutyroster" element={<DutyRoster/>} />
              <Route path="leavesandattendance" element={<LeavesAndAttendance/>} />
              <Route path="payroll" element={<Payroll/>} />
              <Route path="patients" element={<Patients/>} />
              <Route path="appointments" element={<Appointments/>} />
              <Route path="insurance" element={<Insurance/>} />
              <Route path="grievance" element={<Grievance/>} />
              <Route path="workforce" element={<Workforce/>} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}