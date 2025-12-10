import React from "react";
import { Outlet } from "react-router-dom";
import AdminNavbar from "@/components/layout/AdminNavbar";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-muted/40 flex flex-col">
      {/* The Navbar stays at the top */}
      <AdminNavbar />

      {/* The content changes here based on the URL */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}