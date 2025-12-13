/* eslint-disable react-refresh/only-export-components */
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const getInitials = (f, l) => `${f?.charAt(0) || ""}${l?.charAt(0) || ""}`;

const stringToColor = (str) => {
  if (!str) return "#a3a3a3"; // Neutral default
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00ffffff).toString(16).toUpperCase();
  return "#" + "00000".substring(0, 6 - c.length) + c;
};

export default memo(({ data, selected }) => {
  const deptColor = stringToColor(data.departmentName);

  return (
    <div className={`relative group transition-all duration-300 ${selected ? 'scale-105' : ''}`}>
      {/* Input Handle */}
      <Handle 
        type="target" 
        position={Position.Top} 
        // border-neutral-50 (light canvas) / border-neutral-950 (dark canvas)
        className="!w-4 !h-4 !bg-neutral-400 !border-4 !border-neutral-50 dark:!border-neutral-950 transition-colors group-hover:!bg-primary" 
      />

      <div 
        className="flex flex-col w-[260px] bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:shadow-xl dark:hover:shadow-neutral-900/50 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all"
      >
        {/* Color Header */}
        <div className="h-1.5 w-full" style={{ backgroundColor: deptColor }} />

        <div className="p-4 flex items-start gap-4">
          <Avatar className="h-12 w-12 border-2 border-neutral-100 dark:border-neutral-800">
            <AvatarFallback className="bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-bold">
              {getInitials(data.firstName, data.lastName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col min-w-0">
            <span className="font-bold text-neutral-800 dark:text-neutral-100 truncate text-sm">
              {data.firstName} {data.lastName}
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium truncate mb-1.5">
              {data.title || "Staff"}
            </span>
            
            {data.departmentName && (
              <Badge 
                variant="outline" 
                className="w-fit text-[10px] px-1.5 py-0 h-5 font-normal border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-600 dark:text-neutral-300"
              >
                {data.departmentName}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Output Handle */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!w-4 !h-4 !bg-neutral-400 !border-4 !border-neutral-50 dark:!border-neutral-950 transition-colors group-hover:!bg-primary" 
      />
    </div>
  );
});