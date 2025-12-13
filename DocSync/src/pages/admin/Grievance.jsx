import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Search, 
  Loader2, 
  MessageSquare
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// IMPORT THE NEW COMPONENT
import { TicketDetailsDialog } from "@/pages/TicketDetailsDialog";

export default function Grievance() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [allResponses, setAllResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ticketRes, responseRes] = await Promise.all([
        api.get("/grievanceticket"),
        api.get("/grievanceresponse")
      ]);
      setTickets(Array.isArray(ticketRes.data) ? ticketRes.data : []);
      setAllResponses(Array.isArray(responseRes.data) ? responseRes.data : []);
    } catch (error) {
      console.error("Error loading grievances", error);
      toast.error("Failed to load grievance tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSendReply = async () => {
    if (!replyMessage.trim()) return;
    setIsSending(true);
    try {
      const payload = {
        ticket: { id: selectedTicket.id },
        message: replyMessage,
        respondedAt: new Date().toISOString(),
        responder: { id: user?.id || 1 } 
      };

      await api.post("/grievanceresponse", payload);
      toast.success("Reply sent.");
      setReplyMessage("");
      fetchData(); 
    } catch (error) {
      console.error(error);
      toast.error("Failed to send reply.");
    } finally {
      setIsSending(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if(!selectedTicket) return;
    setIsUpdatingStatus(true);
    try {
      const payload = { ...selectedTicket, status: newStatus };
      await api.put(`/grievanceticket/${selectedTicket.id}`, payload);
      toast.success(`Ticket marked as ${newStatus}`);
      setSelectedTicket(prev => ({ ...prev, status: newStatus }));
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getDoctorName = (doc) => doc ? `${doc.firstName} ${doc.lastName}` : "Unknown";

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case "OPEN": return <Badge variant="destructive">Open</Badge>;
      case "IN_PROGRESS": return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">In Progress</Badge>;
      case "RESOLVED": return <Badge className="bg-green-600 hover:bg-green-700">Resolved</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return format(new Date(dateStr), "MMM dd, p");
  };

  const filteredTickets = tickets.filter(t => {
    const matchSearch = t.subject?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        getDoctorName(t.doctor).toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "ALL" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const currentConversation = allResponses
    .filter(r => r.ticket?.id === selectedTicket?.id)
    .sort((a, b) => new Date(a.respondedAt) - new Date(b.respondedAt));

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-8 pt-6 animate-in fade-in duration-500">
      
      {/* Header & KPI Stats (Unchanged) */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Grievance Support</h2>
        <p className="text-muted-foreground">Manage and resolve tickets raised by staff.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
             <AlertCircle className="h-4 w-4 text-red-500" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{tickets.filter(t => t.status === "OPEN").length}</div>
             <p className="text-xs text-muted-foreground">Requires immediate attention</p>
           </CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">In Progress</CardTitle>
             <Clock className="h-4 w-4 text-amber-500" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{tickets.filter(t => t.status === "IN_PROGRESS").length}</div>
             <p className="text-xs text-muted-foreground">Being reviewed</p>
           </CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Resolved</CardTitle>
             <CheckCircle2 className="h-4 w-4 text-green-500" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{tickets.filter(t => t.status === "RESOLVED").length}</div>
             <p className="text-xs text-muted-foreground">Successfully closed</p>
           </CardContent>
         </Card>
      </div>

      {/* Filters (Unchanged) */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-72">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search subject or doctor..." 
                  className="pl-8 bg-background" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

      {/* Table (Unchanged) */}
      <div className="rounded-md border bg-card">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Ticket ID</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                      <TableRow><TableCell colSpan={6} className="h-24 text-center"><Loader2 className="animate-spin inline mr-2"/> Loading tickets...</TableCell></TableRow>
                ) : filteredTickets.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No tickets found.</TableCell></TableRow>
                ) : (
                    filteredTickets.map((ticket) => (
                        <TableRow key={ticket.id}>
                            <TableCell className="font-mono text-xs text-muted-foreground">#{ticket.id}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                            {ticket.doctor?.firstName?.[0]}{ticket.doctor?.lastName?.[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-sm">{getDoctorName(ticket.doctor)}</span>
                                        <span className="text-xs text-muted-foreground">{ticket.doctor?.specialization}</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="font-medium">{ticket.subject}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">{formatDate(ticket.createdAt)}</TableCell>
                            <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                            <TableCell className="text-right">
                                <Button size="sm" variant="outline" onClick={() => setSelectedTicket(ticket)}>
                                    <MessageSquare className="mr-2 h-3.5 w-3.5" /> View / Respond
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
      </div>

      {/* --- NEW COMPONENT USAGE --- */}
      <TicketDetailsDialog
        open={!!selectedTicket}
        onOpenChange={(val) => !val && setSelectedTicket(null)}
        ticket={selectedTicket}
        responses={currentConversation}
        currentUserId={user?.id}
        replyText={replyMessage}
        setReplyText={setReplyMessage}
        onSendReply={handleSendReply}
        isSending={isSending}
        // Admin Specific: Pass the Status Buttons here
        extraFooterContent={
          selectedTicket && (
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Change Status:</span>
                <div className="flex gap-2">
                    <Button 
                        size="sm" 
                        variant={selectedTicket.status === "IN_PROGRESS" ? "default" : "outline"}
                        onClick={() => handleStatusChange("IN_PROGRESS")}
                        disabled={isUpdatingStatus}
                    >
                        In Progress
                    </Button>
                    <Button 
                        size="sm" 
                        variant={selectedTicket.status === "RESOLVED" ? "default" : "outline"}
                        className={selectedTicket.status === "RESOLVED" ? "bg-green-600 hover:bg-green-700" : "hover:text-green-600 hover:bg-green-50"}
                        onClick={() => handleStatusChange("RESOLVED")}
                        disabled={isUpdatingStatus}
                    >
                        Resolve Ticket
                    </Button>
                </div>
            </div>
          )
        }
      />

    </div>
  );
}