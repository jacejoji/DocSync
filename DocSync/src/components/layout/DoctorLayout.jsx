import React from "react";
import { Outlet } from "react-router-dom";
import DoctorNavbar from "@/components/layout/DoctorNavbar"; // Ensure path matches where you saved it

export default function DoctorLayout() {
  return (
    <div className="min-h-screen bg-muted/40 flex flex-col">
      {/* 1. Persistent Navigation */}
      <DoctorNavbar />

      {/* 2. Dynamic Content Area */}
      <main className="flex-1 container mx-auto">
        <Outlet />
      </main>
    </div>
  );
}