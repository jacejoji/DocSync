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
import DutyRosterPage from "./pages/doctor/DutyRosterPage";
import DutyRoster from "./pages/admin/DutyRosterPage";
import LeavesAndAttendance from "./pages/admin/LeavesAndAttendance";
import Payroll from "./pages/admin/Payroll";
import DoctorPayroll from "./pages/doctor/Payroll";
import Patients from "./pages/admin/Patients";
import Appointments from "./pages/admin/Appointments";
import Insurance from "./pages/admin/Insurance";
import Grievance from "./pages/admin/Grievance";
import Workforce from "./pages/admin/Workforce";
import DoctorLeaves from "./pages/doctor/Leaves";
import DoctorDocuments from "./pages/doctor/Documents";
import MyPatients from "./pages/doctor/MyPatients";
import CampsAndEquipment from "./pages/doctor/CampsAndEquipment";
import Grievances from "./pages/doctor/Grievances";
import TimeSheet from "./pages/doctor/TimeSheet";
import Appointment from "./pages/doctor/Appointment";
import DoctorProfile from "./pages/doctor/DoctorProfile";

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
              <Route path="appointments" element={<Appointment/>} />
              <Route path="patients" element={<MyPatients/>} />
              <Route path="timesheet" element={<TimeSheet/>} />
              <Route path="grievances" element={<Grievances/>} />
              <Route path="campsandequipment" element={<CampsAndEquipment/>}/>
              <Route path="roster" element={<DutyRosterPage/>} />
              <Route path="leaves" element={<DoctorLeaves/>} />
              <Route path="payroll" element={<DoctorPayroll/>} />
              <Route path="documents" element={<DoctorDocuments/>}/>
              <Route path="profile" element={<DoctorProfile/>}/>
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