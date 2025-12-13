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
    <div className="w-[280px] bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col h-full z-10 shadow-sm transition-colors">
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
        <h3 className="font-semibold text-sm text-neutral-800 dark:text-neutral-100">
            Unassigned Staff ({employees.length})
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Drag to chart to assign. Drop on empty space for Root.
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-white dark:bg-neutral-900">
        {employees.map((emp) => (
          <div 
            key={emp.id}
            onDragStart={(event) => onDragStart(event, emp.id)}
            draggable
            className="flex items-center gap-3 p-2 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950/50 cursor-grab active:cursor-grabbing hover:border-primary/50 dark:hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
          >
            <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold">
                    {getInitials(emp.firstName, emp.lastName)}
                </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
                <div className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
                    {emp.firstName} {emp.lastName}
                </div>
                <div className="flex gap-2">
                    <Badge variant="secondary" className="text-[10px] px-1 h-4 font-normal bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700 border border-transparent dark:border-neutral-700">
                        {emp.departmentName || "General"}
                    </Badge>
                </div>
            </div>
          </div>
        ))}
        
        {employees.length === 0 && (
            <div className="text-center p-8 text-xs text-neutral-400 dark:text-neutral-600 border-2 border-dashed border-neutral-100 dark:border-neutral-800 rounded-lg m-2">
                All staff assigned
            </div>
        )}
      </div>
    </div>
  );
}