import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { 
  MessageSquare, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  Send, 
  Loader2, 
  User, 
  MoreHorizontal 
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext"; // Assuming you have this context for the responder ID

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Grievance() {
  const { user } = useAuth(); // To get current Admin ID for the response
  const [tickets, setTickets] = useState([]);
  const [allResponses, setAllResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Selection & Chat State
  const [selectedTicket, setSelectedTicket] = useState(null); // The ticket currently open in dialog
  const [replyMessage, setReplyMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // --- API Fetching ---

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

  // --- Actions ---

  // 1. Send a Reply
  const handleSendReply = async () => {
    if (!replyMessage.trim()) return;

    setIsSending(true);
    try {
      const payload = {
        ticket: { id: selectedTicket.id },
        message: replyMessage,
        respondedAt: new Date().toISOString(),
        // Assuming your backend needs a User object for responder. 
        // If 'user.id' isn't available, you might need to adjust or rely on backend to set current user.
        responder: { id: user?.id || 1 } 
      };

      await api.post("/grievanceresponse", payload);
      toast.success("Reply sent.");
      setReplyMessage("");
      fetchData(); // Refresh to show new message
    } catch (error) {
      console.error(error);
      toast.error("Failed to send reply.");
    } finally {
      setIsSending(false);
    }
  };

  // 2. Update Ticket Status
  const handleStatusChange = async (newStatus) => {
    if(!selectedTicket) return;
    setIsUpdatingStatus(true);
    try {
      const payload = {
        ...selectedTicket,
        status: newStatus
      };
      // PUT /grievanceticket/{id}
      await api.put(`/grievanceticket/${selectedTicket.id}`, payload);
      
      toast.success(`Ticket marked as ${newStatus}`);
      setSelectedTicket(prev => ({ ...prev, status: newStatus })); // Update local state
      fetchData(); // Refresh list
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // --- Helpers ---

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
    return format(new Date(dateStr), "MMM dd, p"); // e.g. Dec 10, 2:30 PM
  };

  // Filter Logic
  const filteredTickets = tickets.filter(t => {
    const matchSearch = t.subject?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        getDoctorName(t.doctor).toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "ALL" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Get conversation for selected ticket
  // Note: We filter the global 'allResponses' array by the selected ticket ID
  const currentConversation = allResponses
    .filter(r => r.ticket?.id === selectedTicket?.id)
    .sort((a, b) => new Date(a.respondedAt) - new Date(b.respondedAt));

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-8 pt-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Grievance Support</h2>
        <p className="text-muted-foreground">Manage and resolve tickets raised by staff.</p>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
                {tickets.filter(t => t.status === "OPEN").length}
            </div>
            <p className="text-xs text-muted-foreground">Requires immediate attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
                {tickets.filter(t => t.status === "IN_PROGRESS").length}
            </div>
            <p className="text-xs text-muted-foreground">Being reviewed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
                {tickets.filter(t => t.status === "RESOLVED").length}
            </div>
            <p className="text-xs text-muted-foreground">Successfully closed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
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

      {/* Table */}
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

      {/* --- DIALOG: TICKET DETAILS & CHAT --- */}
      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0 gap-0">
            
            {selectedTicket && (
                <>
                    {/* Dialog Header: Ticket Info */}
                    <div className="p-6 border-b">
                        <DialogHeader>
                            <div className="flex items-center justify-between mb-2">
                                <Badge variant="outline">Ticket #{selectedTicket.id}</Badge>
                                {getStatusBadge(selectedTicket.status)}
                            </div>
                            <DialogTitle className="text-xl">{selectedTicket.subject}</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4 bg-muted/40 p-3 rounded-md text-sm border">
                            <p className="font-semibold mb-1 text-primary">Original Description:</p>
                            <p className="text-muted-foreground leading-relaxed">{selectedTicket.description}</p>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <ScrollArea className="flex-1 p-6">
                        <div className="space-y-4">
                            {currentConversation.length === 0 ? (
                                <div className="text-center text-muted-foreground text-sm py-8">
                                    No responses yet. Be the first to reply.
                                </div>
                            ) : (
                                currentConversation.map((resp) => (
                                    <div key={resp.id} className="flex gap-3 items-start">
                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
                                            {resp.responder?.username ? resp.responder.username[0].toUpperCase() : "A"}
                                        </div>
                                        <div className="bg-slate-100 p-3 rounded-lg rounded-tl-none w-full">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-semibold text-xs text-slate-900">
                                                    {resp.responder?.username || "Admin"}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {formatDate(resp.respondedAt)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{resp.message}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>

                    {/* Footer: Input Area & Status */}
                    <div className="p-4 border-t bg-background">
                         <div className="flex items-center justify-between mb-4">
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
                         <div className="flex gap-2">
                            <Textarea 
                                placeholder="Type your response..." 
                                className="min-h-[40px] max-h-[100px]" 
                                value={replyMessage}
                                onChange={(e) => setReplyMessage(e.target.value)}
                            />
                            <Button size="icon" className="h-auto w-12" onClick={handleSendReply} disabled={isSending || !replyMessage.trim()}>
                                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                         </div>
                    </div>
                </>
            )}

        </DialogContent>
      </Dialog>

    </div>
  );
}