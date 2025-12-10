import React, { useEffect, useCallback } from "react";
import ReactFlow, { 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState, 
  MarkerType 
} from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// --- LAYOUT CONFIGURATION ---
const nodeWidth = 240; // Wider for "Card" layout
const nodeHeight = 100; // Taller for Avatar + Text

const getLayoutedElements = (nodes, edges) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({ rankdir: "TB" }); // Top-to-Bottom

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = "top";
    node.sourcePosition = "bottom";
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
  });

  return { nodes, edges };
};

// Helper for Initials
const getInitials = (f, l) => `${f?.charAt(0) || ""}${l?.charAt(0) || ""}`;

export default function OrgChart() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const fetchOrgChart = useCallback(async () => {
    try {
      const response = await api.get("/api/org-chart/data");
      const { employees, relationships } = response.data;

      // 1. Map Employees to Nodes (Custom UI via JSX)
      const flowNodes = employees.map((emp) => ({
        id: emp.id.toString(),
        data: { 
          label: (
            <div className="flex items-center gap-3 h-full w-full p-3 border rounded-lg bg-card text-card-foreground shadow-sm hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900">
               {/* Avatar Section */}
               <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-700 shadow-sm">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {getInitials(emp.firstName, emp.lastName)}
                  </AvatarFallback>
               </Avatar>

               {/* Info Section */}
               <div className="flex flex-col items-start min-w-0">
                  <div className="font-bold text-sm truncate w-full text-left">
                    {emp.firstName} {emp.lastName}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate w-full text-left">
                    {emp.title || "Staff"}
                  </div>
                  {emp.departmentName && (
                    <Badge variant="secondary" className="mt-1 text-[10px] h-4 px-1.5 rounded-sm">
                      {emp.departmentName}
                    </Badge>
                  )}
               </div>
            </div>
          ) 
        },
        position: { x: 0, y: 0 }, // Position calculated by Dagre
        style: { 
            width: nodeWidth, 
            height: nodeHeight, 
            border: 'none', 
            background: 'transparent',
            padding: 0 
        }
      }));

      // 2. Map Relationships to Edges
      const flowEdges = relationships.map((rel, index) => ({
        id: `e${index}`,
        source: rel.manager?.id.toString(),
        target: rel.doctor?.id.toString(),
        type: 'smoothstep', // Cleaner lines
        markerEnd: { 
            type: MarkerType.ArrowClosed, 
            color: '#94a3b8' // Slate-400
        },
        animated: false,
        style: { stroke: '#94a3b8', strokeWidth: 1.5 } 
      }));

      // 3. Apply Layout
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        flowNodes,
        flowEdges
      );

      setNodes(layoutedNodes);
      setEdges(layoutedEdges);

    } catch (error) {
      console.error("Org chart error", error);
      toast.error("Failed to load organizational structure.");
    }
  }, [setNodes, setEdges]);

  useEffect(() => {
    fetchOrgChart();
  }, [fetchOrgChart]);

  return (
    <div className="h-[600px] border rounded-lg bg-slate-50 dark:bg-slate-950 dark:border-slate-800 relative overflow-hidden">
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            attributionPosition="bottom-left"
            // Hides the React Flow watermark (ensure you comply with license for commercial use)
            proOptions={{ hideAttribution: true }} 
            minZoom={0.5}
            maxZoom={1.5}
        >
            <Controls className="bg-white dark:bg-slate-900 border dark:border-slate-700 fill-foreground" />
            <Background color="#94a3b8" gap={20} size={1} className="opacity-20" />
        </ReactFlow>
        
        {/* Legend Overlay */}
        <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 p-3 rounded-md shadow-md text-xs border dark:border-slate-700 backdrop-blur-sm">
            <p className="font-semibold mb-2 text-foreground">Legend</p>
            <div className="flex items-center gap-2 mb-1.5">
                <div className="w-3 h-3 border rounded shadow-sm bg-primary/20 border-primary"></div> 
                <span className="text-muted-foreground">Employee Node</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-6 h-0.5 bg-slate-400 dark:bg-slate-500 rounded-full"></div> 
                <span className="text-muted-foreground">Reporting Line</span>
            </div>
        </div>
    </div>
  );
}