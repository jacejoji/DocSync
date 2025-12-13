/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from 'react';
import axios from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { 
  MessageSquare, 
  Plus, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronRight,
  Search,
  AlertTriangle
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

// IMPORT THE NEW COMPONENT
import { TicketDetailsDialog } from "@/pages/TicketDetailsDialog";

const Grievances = () => {
  const { user, loading: authLoading } = useAuth();
  
  const [tickets, setTickets] = useState([]);
  const [allResponses, setAllResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null); 
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [formData, setFormData] = useState({ subject: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  // Chat State
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // Helpers
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
        return format(new Date(dateStr), "MMM dd, p");
    } catch (e) {
        return dateStr;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved': return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved': return <CheckCircle2 className="w-3 h-3 mr-1" />;
      case 'rejected': return <XCircle className="w-3 h-3 mr-1" />;
      default: return <Clock className="w-3 h-3 mr-1" />;
    }
  };

  // --- Data Fetching ---
  useEffect(() => {
    if (authLoading) return;

    if (!user || !user.id) {
        setLoading(false);
        return;
    }

    const fetchGrievanceData = async () => {
        setLoading(true);
        try {
            const doctorId = user.id;
            const [ticketsRes, responsesRes] = await Promise.all([
                axios.get(`/grievanceticket/${doctorId}`),
                axios.get('/grievanceresponse')
            ]);

            const myTickets = ticketsRes.data || [];
            const sortedTickets = myTickets.sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt)
            );

            setTickets(sortedTickets);
            setAllResponses(responsesRes.data);
        } catch (error) {
            console.error("Error fetching data:", error);
            if (error.response?.status === 404) {
                setTickets([]); 
            } else {
                toast.error("Failed to load grievances.");
            }
        } finally {
            setLoading(false);
        }
    };

    fetchGrievanceData();
  }, [authLoading, user?.id]);


  // --- Handlers ---
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!user?.id) return;
    setSubmitting(true);

    const payload = {
      subject: formData.subject,
      description: formData.description,
      status: 'Open',
      createdAt: new Date().toISOString(),
      doctor: { id: user.id } 
    };

    try {
      await axios.post('/grievanceticket', payload);
      toast.success("Ticket raised successfully!");
      setIsCreateOpen(false);
      setFormData({ subject: '', description: '' });
      
      const doctorId = user.id;
      const res = await axios.get(`/grievanceticket/${doctorId}`);
      const sorted = (res.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setTickets(sorted);

    } catch (error) {
      console.error("Error creating ticket:", error);
      toast.error("Failed to raise ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !user?.userid) return;
    setSendingReply(true);

    const payload = {
      ticket: { id: selectedTicket.id },
      responder: { id: user.userid }, 
      message: replyText,
      respondedAt: new Date().toISOString()
    };

    try {
      await axios.post('/grievanceresponse', payload);
      setReplyText("");
      const responsesRes = await axios.get('/grievanceresponse');
      setAllResponses(responsesRes.data);
    } catch (error) {
      console.error("Error sending reply:", error);
      toast.error("Failed to send message.");
    } finally {
      setSendingReply(false);
    }
  };

  // --- Render Guards ---

  if (authLoading) {
    return (
      <div className="container mx-auto p-6 space-y-8 flex flex-col h-[calc(100vh-2rem)]">
        <Skeleton className="h-12 w-64 mb-6" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (user && !user.id) {
    return (
      <div className="container mx-auto p-6 flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <AlertTriangle className="h-16 w-16 text-amber-500" />
        <h2 className="text-2xl font-bold">Access Restricted</h2>
        <p className="text-muted-foreground max-w-md">
           You are logged in as <strong>{user.username}</strong> ({user.role}), 
           but this account is not linked to a Doctor profile.
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
           Retry Connection
        </Button>
      </div>
    );
  }

  // --- Main Render ---
  const filteredTickets = tickets.filter(t => 
    t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentTicketResponses = selectedTicket 
    ? allResponses
        .filter(r => r.ticket.id === selectedTicket.id)
        .sort((a,b) => new Date(a.respondedAt) - new Date(b.respondedAt))
    : [];

  return (
    <div className="container mx-auto p-6 space-y-8 h-[calc(100vh-2rem)] flex flex-col">
      {/* Header (Unchanged) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Grievance Portal</h1>
          <p className="text-muted-foreground">Raise concerns and track resolutions.</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="shrink-0">
              <Plus className="mr-2 h-4 w-4" /> Raise Ticket
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Raise a Grievance</DialogTitle>
              <DialogDescription>
                Describe your issue clearly. The admin team will review and respond.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTicket} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input 
                  id="subject" 
                  placeholder="e.g., Equipment Malfunction" 
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Provide detailed information about the issue..." 
                  className="min-h-[100px]"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Ticket"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* List Area (Unchanged) */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="border-b px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search tickets..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground ml-auto hidden md:block">
              Showing {filteredTickets.length} tickets
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 flex-1 overflow-auto bg-muted/5">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
              <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
              <p>No grievance tickets found.</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredTickets.map((ticket) => (
                <div 
                  key={ticket.id} 
                  className="p-4 hover:bg-background cursor-pointer transition-colors group flex items-center justify-between gap-4"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold truncate">{ticket.subject}</span>
                      <Badge variant="outline" className={`h-5 px-2 text-[10px] uppercase border-0 ${getStatusColor(ticket.status)}`}>
                        {getStatusIcon(ticket.status)} {ticket.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate pr-4">
                      {ticket.description}
                    </p>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span>Ref ID: #{ticket.id}</span>
                      <span>•</span>
                      <span>{formatDate(ticket.createdAt)}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* --- NEW COMPONENT USAGE --- */}
      <TicketDetailsDialog
        open={!!selectedTicket}
        onOpenChange={(val) => !val && setSelectedTicket(null)}
        ticket={selectedTicket}
        responses={currentTicketResponses}
        currentUserId={user?.userid}
        replyText={replyText}
        setReplyText={setReplyText}
        onSendReply={handleSendReply}
        isSending={sendingReply}
        // Doctor Specific: Input is read-only if ticket is resolved
        isReadOnly={selectedTicket?.status === 'RESOLVED'}
      />
    </div>
  );
};

export default Grievances;