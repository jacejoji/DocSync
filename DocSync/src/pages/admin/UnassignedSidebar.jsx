import React from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const getInitials = (f, l) => `${f?.charAt(0) || ""}${l?.charAt(0) || ""}`;

export default function UnassignedSidebar({ employees }) {
  const onDragStart = (event, employeeId) => {
    event.dataTransfer.setData('application/reactflow', employeeId);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-[280px] bg-white border-r border-slate-200 flex flex-col h-full z-10 shadow-sm">
      <div className="p-4 border-b border-slate-200 bg-slate-50/50">
        <h3 className="font-semibold text-sm text-slate-800">Unassigned Staff ({employees.length})</h3>
        <p className="text-xs text-slate-500 mt-1">
            Drag to chart to assign. Drop on empty space for Root.
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-white">
        {employees.map((emp) => (
          <div 
            key={emp.id}
            onDragStart={(event) => onDragStart(event, emp.id)}
            draggable
            className="flex items-center gap-3 p-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 cursor-grab active:cursor-grabbing hover:border-primary/50 hover:bg-primary/5 transition-colors"
          >
            <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-slate-200 text-slate-700">
                    {getInitials(emp.firstName, emp.lastName)}
                </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
                <div className="text-sm font-medium text-slate-800 truncate">{emp.firstName} {emp.lastName}</div>
                <div className="flex gap-2">
                    <Badge variant="secondary" className="text-[10px] px-1 h-4 font-normal bg-slate-200 text-slate-700 hover:bg-slate-300">
                        {emp.departmentName || "General"}
                    </Badge>
                </div>
            </div>
          </div>
        ))}
        
        {employees.length === 0 && (
            <div className="text-center p-8 text-xs text-slate-400 border-2 border-dashed border-slate-100 rounded-lg m-2">
                All staff assigned
            </div>
        )}
      </div>
    </div>
  );
}