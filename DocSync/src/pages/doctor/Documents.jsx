/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { 
  FileText, 
  Upload, 
  Trash2, 
  Eye, 
  Download, 
  Image as ImageIcon, 
  File, 
  Loader2,
  AlertTriangle,
  Plus
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function DoctorDocuments() {
  const { user, loading: authLoading } = useAuth();
  
  // Data States
  const [documents, setDocuments] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [resolvedUserId, setResolvedUserId] = useState(null);

  // Upload States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // --- 1. User Resolution (Self-Healing Logic) ---
  useEffect(() => {
    const resolveUser = async () => {
      if (user && user.id) {
        setResolvedUserId(user.id);
        return;
      }
      
      if (!authLoading) {
        try {
          const res = await api.get("/auth/me");
          if (res.data && res.data.id) {
            setResolvedUserId(res.data.id);
          } else {
            setIsLoadingData(false);
          }
        } catch (error) {
          setIsLoadingData(false);
        }
      }
    };
    resolveUser();
  }, [user, authLoading]);

  // --- 2. Data Fetching ---
  useEffect(() => {
    if (resolvedUserId) {
      fetchDocuments(resolvedUserId);
    }
  }, [resolvedUserId]);

  const fetchDocuments = async (doctorId) => {
    setIsLoadingData(true);
    try {
      const response = await api.get(`/doctor-documents/doctor/${doctorId}`);
      setDocuments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching documents", error);
      toast.error("Failed to load documents.");
    } finally {
      setIsLoadingData(false);
    }
  };

  // --- 3. Handlers ---

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
        setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
        toast.error("Please select a file first.");
        return;
    }
    if (!resolvedUserId) {
        toast.error("User ID not found. Please reload.");
        return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("doctorId", resolvedUserId);
    formData.append("file", selectedFile);

    try {
        await api.post("/doctor-documents/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        toast.success("Document uploaded successfully.");
        setIsDialogOpen(false);
        setSelectedFile(null);
        fetchDocuments(resolvedUserId);
    } catch (error) {
        console.error("Upload failed", error);
        toast.error("Failed to upload document.");
    } finally {
        setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this file?")) return;
    try {
        await api.delete(`/doctor-documents/${id}`);
        toast.success("File deleted.");
        fetchDocuments(resolvedUserId);
    } catch (error) {
        toast.error("Could not delete file.");
    }
  };

  const handleView = async (doc) => {
    try {
        // Fetch as blob to handle auth headers automatically
        const response = await api.get(`/doctor-documents/download/${doc.id}`, {
            responseType: 'blob'
        });
        
        // Create a secure local URL
        const url = window.URL.createObjectURL(new Blob([response.data], { type: doc.documentType }));
        window.open(url, '_blank');
        
        // Clean up URL object after a delay to allow browser to open it
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (error) {
        console.error("Download error", error);
        toast.error("Could not open file.");
    }
  };

  // --- Helpers ---
  const formatDate = (dateStr) => (!dateStr ? "-" : format(new Date(dateStr), "MMM dd, yyyy"));
  
  const getFileIcon = (type) => {
      if (type?.includes("pdf")) return <FileText className="h-8 w-8 text-red-500" />;
      if (type?.includes("image")) return <ImageIcon className="h-8 w-8 text-blue-500" />;
      return <File className="h-8 w-8 text-gray-500" />;
  };

  // --- Render ---

  if (authLoading || (isLoadingData && !resolvedUserId)) {
      return (
          <div className="flex h-screen w-full items-center justify-center flex-col gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-muted-foreground text-sm">Loading documents...</span>
          </div>
      );
  }

  if (!isLoadingData && !resolvedUserId) {
      return (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
              <AlertTriangle className="h-12 w-12 text-red-500" />
              <h2 className="text-xl font-bold">Access Error</h2>
              <p className="text-muted-foreground">Unable to verify doctor profile. Please refresh.</p>
              <Button onClick={() => window.location.reload()}>Refresh Page</Button>
          </div>
      );
  }

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-8 pt-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Documents</h2>
          <p className="text-muted-foreground">Manage your certificates, ID proofs, and records.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" /> Upload Document
        </Button>
      </div>

      {/* Document Grid */}
      <ScrollArea className="h-full">
        {documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg bg-muted/20">
                <File className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-muted-foreground font-medium">No documents uploaded yet.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc) => (
                    <Card key={doc.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 flex items-start gap-4">
                            <div className="bg-slate-50 p-3 rounded-lg border">
                                {getFileIcon(doc.documentType)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm truncate" title={doc.documentName}>
                                    {doc.documentName}
                                </h4>
                                <div className="text-xs text-muted-foreground mt-1 space-y-1">
                                    <p>Uploaded: {formatDate(doc.uploadedAt)}</p>
                                    <Badge variant="secondary" className="font-normal text-[10px] h-5">
                                        {doc.documentType?.split('/')[1]?.toUpperCase() || "FILE"}
                                    </Badge>
                                </div>
                                
                                <div className="flex gap-2 mt-4">
                                    <Button variant="outline" size="sm" className="h-8 w-full" onClick={() => handleView(doc)}>
                                        <Eye className="h-3 w-3 mr-2" /> View
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                        onClick={() => handleDelete(doc.id)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )}
      </ScrollArea>

      {/* --- DIALOG: UPLOAD --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogDescription>Select a file (PDF, JPG, PNG) to upload.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <Label htmlFor="file" className="text-sm font-medium">Select File</Label>
                    <div className="flex items-center justify-center w-full">
                        <label 
                            htmlFor="file-upload" 
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 border-slate-300"
                        >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-2 text-slate-500" />
                                <p className="text-sm text-slate-500">
                                    {selectedFile ? selectedFile.name : "Click to select"}
                                </p>
                            </div>
                            <input 
                                id="file-upload" 
                                type="file" 
                                className="hidden" 
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                            />
                        </label>
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleUpload} disabled={isUploading || !selectedFile}>
                    {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Upload
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}