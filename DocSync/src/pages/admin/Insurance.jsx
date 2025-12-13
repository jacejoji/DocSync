/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "@/lib/axios";

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Child Components
import ClaimsTab from "./ClaimsTab";
import PoliciesTab from "./PoliciesTab";
import ProvidersTab from "./ProvidersTab";
import PatientCoverageTab from "./PatientCoverageTab";

export default function Insurance() {
  const [activeTab, setActiveTab] = useState("claims");
  const [loading, setLoading] = useState(true);
  
  // Data Stores
  const [claims, setClaims] = useState([]);
  const [doctorPolicies, setDoctorPolicies] = useState([]);
  const [providers, setProviders] = useState([]);
  const [doctors, setDoctors] = useState([]);
  
  // New Data Stores
  const [patients, setPatients] = useState([]);
  const [patientPolicies, setPatientPolicies] = useState([]);

  // --- API Fetching ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const [claimsRes, docPoliciesRes, providersRes, docRes, patientsRes, patPoliciesRes] = await Promise.all([
        api.get("/insurance-claims"),
        api.get("/doctor-insurance-policies"),
        api.get("/insuranceprovider"),
        api.get("/doctor"),
        api.get("/api/patients"), // Added patient fetch
        api.get("/api/patient-insurance") // Added patient policy fetch
      ]);

      setClaims(Array.isArray(claimsRes.data) ? claimsRes.data : []);
      setDoctorPolicies(Array.isArray(docPoliciesRes.data) ? docPoliciesRes.data : []);
      setProviders(Array.isArray(providersRes.data) ? providersRes.data : []);
      setDoctors(Array.isArray(docRes.data) ? docRes.data : []);
      setPatients(Array.isArray(patientsRes.data) ? patientsRes.data : []);
      setPatientPolicies(Array.isArray(patPoliciesRes.data) ? patPoliciesRes.data : []);
      
    } catch (error) {
      console.error("Error loading insurance data", error);
      toast.error("Failed to load records. Check connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-8 pt-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Insurance Management</h2>
          <p className="text-muted-foreground">Manage claims, patient coverage, and provider networks.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-[650px]">
            <TabsTrigger value="claims">Claims</TabsTrigger>
            <TabsTrigger value="patient_coverage">Patient Coverage</TabsTrigger>
            <TabsTrigger value="doc_policies">Staff Policies</TabsTrigger>
            <TabsTrigger value="providers">Providers</TabsTrigger>
        </TabsList>

        {/* Tab 1: Claims */}
        <TabsContent value="claims">
            <ClaimsTab 
                claims={claims} 
                loading={loading} 
                onRefresh={fetchData} 
            />
        </TabsContent>

        {/* Tab 2: Patient Coverage (NEW) */}
        <TabsContent value="patient_coverage">
            <PatientCoverageTab 
                policies={patientPolicies}
                patients={patients}
                providers={providers}
                onRefresh={fetchData}
            />
        </TabsContent>

        {/* Tab 3: Doctor Policies */}
        <TabsContent value="doc_policies">
            <PoliciesTab 
                policies={doctorPolicies} 
                doctors={doctors} 
                providers={providers} 
                onRefresh={fetchData} 
            />
        </TabsContent>

        {/* Tab 4: Providers */}
        <TabsContent value="providers">
            <ProvidersTab 
                providers={providers} 
                onRefresh={fetchData} 
            />
        </TabsContent>

      </Tabs>
    </div>
  );
}