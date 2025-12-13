/* eslint-disable no-unused-vars */
import React, { useRef, useEffect } from "react";
import { format } from "date-fns";
import { 
  Send, 
  Loader2, 
  User as UserIcon, 
  CheckCircle2, 
  ShieldAlert,
  MessageSquareDashed,
  CornerDownLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

// --- Helpers ---

const getStatusBadge = (status) => {
  switch (status?.toUpperCase()) {
    case "OPEN": 
      return (
        <Badge variant="destructive" className="h-6 px-3 shadow-sm">
           Open
        </Badge>
      );
    case "IN_PROGRESS": 
      return (
        <Badge variant="outline" className="h-6 px-3 bg-amber-50 text-amber-600 border-amber-200 shadow-sm">
           In Progress
        </Badge>
      );
    case "RESOLVED": 
      return (
        <Badge className="h-6 px-3 bg-green-600 hover:bg-green-700 shadow-sm">
           Resolved
        </Badge>
      );
    default: 
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    return format(new Date(dateStr), "MMM d, h:mm a");
  } catch (e) {
    return dateStr;
  }
};

// --- Component ---

export function TicketDetailsDialog({
  open,
  onOpenChange,
  ticket,
  responses = [],
  currentUserId,
  
  // Chat State
  replyText,
  setReplyText,
  onSendReply,
  isSending,
  
  // Custom Render Props
  extraFooterContent = null, 
  isReadOnly = false 
}) {
  const scrollRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (open && scrollRef.current) {
      setTimeout(() => {
        scrollRef.current.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [open, responses]);

  if (!ticket) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] h-[85vh] flex flex-col p-0 gap-0 overflow-hidden shadow-2xl border-0">
        
        {/* --- Header --- */}
        <div className="px-6 py-5 border-b bg-background z-10">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded-md">
                        #{ticket.id}
                    </span>
                    <span className="text-muted-foreground/40">•</span>
                    <span className="text-muted-foreground">
                        {formatDate(ticket.createdAt)}
                    </span>
                </div>
                <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                    {ticket.subject}
                </DialogTitle>
              </div>
              <div className="shrink-0">
                {getStatusBadge(ticket.status)}
              </div>
            </div>
          </DialogHeader>

          {/* Description Section */}
          <div className="mt-5 relative">
             <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 rounded-full"></div>
             <div className="pl-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Description
                </p>
                <p className="text-sm text-foreground/80 leading-relaxed line-clamp-2 hover:line-clamp-none transition-all duration-300 cursor-default">
                    {ticket.description}
                </p>
             </div>
          </div>
        </div>

        {/* --- Chat Area --- */}
        <ScrollArea className="flex-1 bg-slate-50/50 dark:bg-slate-950/50 p-6">
          <div className="flex flex-col space-y-6">
            
            {/* Empty State */}
            {responses.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground opacity-60">
                <div className="bg-muted p-4 rounded-full mb-3">
                    <MessageSquareDashed className="h-8 w-8" />
                </div>
                <p className="text-sm font-medium">No messages yet</p>
                <p className="text-xs">Start the conversation below.</p>
              </div>
            )}

            {/* Message List */}
            {responses.map((resp) => {
              const responderId = resp.responder?.id || resp.responder?.userid;
              // Ensure we compare strings to avoid type mismatches (number vs string)
              const isMe = String(responderId) === String(currentUserId);
              const username = resp.responder?.username || "Support Team";
              const initial = username?.[0]?.toUpperCase() || "S";

              return (
                <div 
                  key={resp.id} 
                  className={`flex w-full gap-3 ${isMe ? "justify-end" : "justify-start"}`}
                >
                  {/* Avatar (Left for Them) */}
                  {!isMe && (
                     <Avatar className="h-8 w-8 border shadow-sm mt-1">
                       <AvatarFallback className="bg-white text-slate-700 font-medium text-xs">
                         {initial}
                       </AvatarFallback>
                     </Avatar>
                  )}

                  <div className={`flex flex-col max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
                    
                    {/* Metadata */}
                    <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-[11px] font-medium text-muted-foreground">
                            {isMe ? "You" : username}
                        </span>
                        <span className="text-[10px] text-muted-foreground/60">
                            {formatDate(resp.respondedAt)}
                        </span>
                    </div>

                    {/* Bubble */}
                    <div className={`px-4 py-3 shadow-sm text-sm leading-relaxed break-words whitespace-pre-wrap ${
                        isMe 
                          ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm" 
                          : "bg-white dark:bg-card border text-card-foreground rounded-2xl rounded-tl-sm"
                    }`}>
                        {resp.message}
                    </div>

                  </div>

                  {/* Avatar (Right for Me) */}
                  {isMe && (
                     <Avatar className="h-8 w-8 border-2 border-primary/20 shadow-sm mt-1">
                       <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                         <UserIcon className="h-4 w-4" />
                       </AvatarFallback>
                     </Avatar>
                  )}
                </div>
              );
            })}
            <div ref={scrollRef} className="h-1" />
          </div>
        </ScrollArea>

        {/* --- Footer --- */}
        <div className="p-4 bg-background border-t z-10">
          
          {/* External Controls (e.g. Admin Status Buttons) */}
          {extraFooterContent && (
             <div className="mb-4 animate-in slide-in-from-bottom-2 fade-in duration-300">
                {extraFooterContent}
             </div>
          )}

          {isReadOnly ? (
             <div className="rounded-lg border border-green-200 bg-green-50 p-4 flex flex-col items-center justify-center text-center gap-1 animate-in fade-in duration-500">
                <div className="flex items-center gap-2 text-green-700 font-semibold text-sm">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Ticket Resolved</span>
                </div>
                <p className="text-xs text-green-600/80">
                    This conversation has been closed. You can no longer reply.
                </p>
             </div>
          ) : (
            <div className="relative flex items-end gap-2 bg-muted/30 p-2 rounded-xl border focus-within:ring-1 focus-within:ring-primary/30 focus-within:border-primary/50 transition-all">
              <Textarea 
                placeholder="Type your reply here..." 
                className="min-h-[50px] max-h-[140px] w-full resize-none border-0 shadow-none bg-transparent focus-visible:ring-0 p-3 text-sm"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                   if (e.key === 'Enter' && !e.shiftKey) {
                     e.preventDefault();
                     onSendReply();
                   }
                }}
              />
              <div className="pb-1 pr-1">
                  <Button 
                    size="icon" 
                    className={`h-9 w-9 transition-all duration-200 ${
                        !replyText.trim() ? "opacity-50 grayscale" : "shadow-md hover:scale-105"
                    }`}
                    onClick={onSendReply} 
                    disabled={isSending || !replyText.trim()}
                  >
                    {isSending ? (
                        <Loader2 className="h-4 w-4 animate-spin" /> 
                    ) : (
                        <Send className="h-4 w-4 ml-0.5" />
                    )}
                  </Button>
              </div>
            </div>
          )}
          
          {!isReadOnly && (
            <div className="mt-2 text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1">
                <CornerDownLeft className="h-3 w-3 opacity-50"/> 
                <span>Press <strong>Enter</strong> to send</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}