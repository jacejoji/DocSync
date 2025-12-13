/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from '@/lib/axios'; // Custom Axios instance
import { toast } from 'sonner'; // Sonner Toast
import { format } from 'date-fns';
import { 
  User, Mail, Phone, Briefcase, Calendar, 
  Building2, Save, X, Pencil, Stethoscope, 
  MapPin, GraduationCap 
} from 'lucide-react';

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

const DoctorProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [departments, setDepartments] = useState([]); 

  // Initial State matches your Spring Boot Entity structure
  const [formData, setFormData] = useState({
    id: null,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialization: '',
    department: null, 
    hireDate: '',
    status: ''
  });

  // Mock ID - In a real app, extract this from your Auth/Context
  const currentDoctorId = 1; 

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Parallel data fetching for better performance
        const [doctorRes, deptRes] = await Promise.all([
          axios.get(`/doctor/${currentDoctorId}`),
          axios.get('/departments')
        ]);

        setFormData(doctorRes.data);
        setDepartments(deptRes.data);
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Failed to load profile", {
          description: "Could not fetch doctor details or departments."
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentDoctorId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDepartmentChange = (value) => {
    const selectedDept = departments.find(d => d.id.toString() === value);
    setFormData(prev => ({ ...prev, department: selectedDept }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Using Sonner's promise toast for better UX
    toast.promise(
      axios.put(`/doctor/${formData.id}`, formData),
      {
        loading: 'Updating profile...',
        success: (response) => {
          setFormData(response.data);
          setIsEditing(false);
          setIsSaving(false);
          return `Profile updated successfully`;
        },
        error: (err) => {
          setIsSaving(false);
          return "Failed to update profile. Please try again.";
        }
      }
    );
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Optional: Re-fetch data here to reset changes if you want strictly fresh data
    // For now, we keep the state as is, or you could store a 'backup' state to revert to.
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 flex justify-center">
      <div className="w-full max-w-5xl space-y-6">
        
        {/* Header Card */}
        <Card className="overflow-hidden border-none shadow-md">
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
             {/* Decorative pattern or overlay could go here */}
          </div>
          <div className="px-8 pb-8">
            <div className="relative flex justify-between items-end -mt-12 mb-4">
              <div className="flex items-end gap-5">
                <Avatar className="h-32 w-32 border-4 border-white shadow-lg bg-white">
                  <AvatarImage 
                    src={`https://ui-avatars.com/api/?name=${formData.firstName}+${formData.lastName}&background=random&size=256`} 
                    alt="Doctor" 
                    className="object-cover"
                  />
                  <AvatarFallback className="text-2xl">
                    {formData.firstName?.[0]}{formData.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="mb-2 space-y-1">
                  <h1 className="text-3xl font-bold text-slate-900">
                    Dr. {formData.firstName} {formData.lastName}
                  </h1>
                  <div className="flex items-center gap-2 text-slate-500 font-medium">
                    <Stethoscope className="h-4 w-4" />
                    <span>{formData.specialization || "General Practitioner"}</span>
                    <span className="mx-1">•</span>
                    <Badge variant={formData.status === 'ACTIVE' ? 'default' : 'secondary'} className="px-2 py-0.5 text-xs">
                      {formData.status || 'Unknown'}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="mb-2 hidden sm:block">
                 {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} className="bg-slate-900 hover:bg-slate-800">
                    <Pencil className="mr-2 h-4 w-4" /> Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                      <X className="mr-2 h-4 w-4" /> Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                      <Save className="mr-2 h-4 w-4" /> Save Changes
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Mobile Edit Button */}
            <div className="sm:hidden mt-4">
               {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} className="w-full">
                    <Pencil className="mr-2 h-4 w-4" /> Edit Profile
                  </Button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                  </div>
                )}
            </div>
          </div>
        </Card>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left Column: Contact Info */}
          <Card className="md:col-span-1 shadow-sm h-fit">
            <CardHeader>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Contact Details
              </h3>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wide">Email Address</Label>
                <div className="flex items-center gap-3 text-sm font-medium">
                  <div className="p-2 bg-blue-50 rounded-full text-blue-600">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="flex-1 truncate">
                    {formData.email}
                  </div>
                </div>
              </div>
              
              <Separator />

              <div className="grid gap-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wide">Phone Number</Label>
                {isEditing ? (
                  <Input 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                ) : (
                  <div className="flex items-center gap-3 text-sm font-medium">
                    <div className="p-2 bg-green-50 rounded-full text-green-600">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>{formData.phone || "N/A"}</div>
                  </div>
                )}
              </div>

               <Separator />

               <div className="grid gap-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wide">Office Location</Label>
                <div className="flex items-center gap-3 text-sm font-medium">
                  <div className="p-2 bg-orange-50 rounded-full text-orange-600">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    {formData.department?.name ? `${formData.department.name} Wing` : 'Main Building'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Column: Professional Info & Form */}
          <Card className="md:col-span-2 shadow-sm">
             <CardHeader>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                Professional Information
              </h3>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    name="firstName" 
                    value={formData.firstName} 
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-slate-50 border-transparent shadow-none px-0" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    name="lastName" 
                    value={formData.lastName} 
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-slate-50 border-transparent shadow-none px-0" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  {isEditing ? (
                     <Input 
                      id="specialization" 
                      name="specialization" 
                      value={formData.specialization} 
                      onChange={handleInputChange}
                    />
                  ) : (
                    <div className="flex items-center gap-2 py-2">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span>{formData.specialization}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  {isEditing ? (
                    <Select 
                      onValueChange={handleDepartmentChange} 
                      value={formData.department?.id?.toString()}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id.toString()}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center gap-2 py-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{formData.department?.name || 'Unassigned'}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Date of Hire</Label>
                  <div className="flex items-center gap-2 py-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {formData.hireDate ? format(new Date(formData.hireDate), 'PPP') : 'N/A'}
                    </span>
                  </div>
                </div>

                 <div className="space-y-2">
                  <Label>Employment Status</Label>
                  <div className="py-2">
                     <Badge variant="outline" className="uppercase text-xs font-semibold">
                       {formData.status}
                     </Badge>
                  </div>
                </div>

              </div>
              
              {formData.department?.description && (
                <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <h4 className="text-sm font-semibold text-slate-700 mb-1">Department Overview</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {formData.department.description}
                  </p>
                </div>
              )}

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};

// Simple Skeleton Component for Loading State
const ProfileSkeleton = () => (
  <div className="min-h-screen bg-slate-50/50 p-6 flex justify-center">
    <div className="w-full max-w-5xl space-y-6">
      <Card className="h-64 relative">
         <Skeleton className="h-32 w-full rounded-t-lg" />
         <div className="px-8 flex items-end -mt-12 gap-5">
            <Skeleton className="h-32 w-32 rounded-full border-4 border-white" />
            <div className="space-y-2 mb-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
         </div>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-64 col-span-1 rounded-xl" />
        <Skeleton className="h-96 col-span-2 rounded-xl" />
      </div>
    </div>
  </div>
);

export default DoctorProfile;