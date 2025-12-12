/* eslint-disable react-refresh/only-export-components */
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const getInitials = (f, l) => `${f?.charAt(0) || ""}${l?.charAt(0) || ""}`;

const stringToColor = (str) => {
  if (!str) return "#94a3b8";
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
        className="!w-4 !h-4 !bg-slate-400 !border-4 !border-white transition-colors group-hover:!bg-primary" 
      />

      <div 
        className="flex flex-col w-[260px] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all"
      >
        <div className="h-1.5 w-full" style={{ backgroundColor: deptColor }} />

        <div className="p-4 flex items-start gap-4">
          <Avatar className="h-12 w-12 border-2 border-slate-100">
            <AvatarFallback className="bg-slate-50 text-slate-600 font-bold">
              {getInitials(data.firstName, data.lastName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col min-w-0">
            <span className="font-bold text-slate-800 truncate text-sm">
              {data.firstName} {data.lastName}
            </span>
            <span className="text-xs text-slate-500 font-medium truncate mb-1.5">
              {data.title || "Staff"}
            </span>
            
            {data.departmentName && (
              <Badge 
                variant="outline" 
                className="w-fit text-[10px] px-1.5 py-0 h-5 font-normal border-slate-200 bg-slate-50/50 text-slate-600"
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
        className="!w-4 !h-4 !bg-slate-400 !border-4 !border-white transition-colors group-hover:!bg-primary" 
      />
    </div>
  );
});