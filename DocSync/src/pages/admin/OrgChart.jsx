/* eslint-disable no-unused-vars */
import React, { useEffect, useCallback, useMemo, useState } from "react";
import ReactFlow, { 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState, 
  ReactFlowProvider,
  useReactFlow,
  MarkerType,
  Panel
} from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Loader2, RefreshCcw } from "lucide-react";

// --- Import Custom Components ---
import EmployeeNode from "@/pages/admin/EmployeeNode";
import DeletableEdge from "@/pages/admin/DeletableEdge"; 
import UnassignedSidebar from "@/pages/admin/UnassignedSidebar";

// --- Configuration ---
const nodeWidth = 280; 
const nodeHeight = 140;

const getLayoutedElements = (nodes, edges) => {
  if (nodes.length === 0) return { nodes, edges };

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({ rankdir: "TB", ranksep: 100, nodesep: 60 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    if (!nodeWithPosition) return node;

    return {
      ...node,
      targetPosition: "top",
      sourcePosition: "bottom",
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

function OrgChartContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [unassignedList, setUnassignedList] = useState([]); 
  const [loading, setLoading] = useState(false);
  
  const { screenToFlowPosition } = useReactFlow(); 

  const nodeTypes = useMemo(() => ({ employee: EmployeeNode }), []);
  const edgeTypes = useMemo(() => ({ deletable: DeletableEdge }), []);

  // --- DELETE ACTION ---
  const handleDeleteEdge = useCallback(async (edgeId, targetNodeId) => {
    setEdges((eds) => eds.filter((e) => e.id !== edgeId));

    try {
        await api.post("/api/org-chart/remove", { doctorId: parseInt(targetNodeId) });
        toast.success("Relationship removed");
        fetchOrgChart(); 
    } catch (e) {
        toast.error("Failed to remove relationship");
        fetchOrgChart(); 
    }
  }, [setEdges]); 

  // --- FETCH DATA ---
  const fetchOrgChart = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/org-chart/data");
      const { employees, relationships } = response.data;

      const chartIds = new Set();
      
      relationships.forEach(r => {
        if (r.doctor) chartIds.add(r.doctor.id);
        if (r.manager) chartIds.add(r.manager.id);
      });

      const chartEmployees = [];
      const sidebarEmployees = [];

      employees.forEach(emp => {
         if (chartIds.has(emp.id)) {
            chartEmployees.push(emp);
         } else {
            sidebarEmployees.push(emp);
         }
      });

      chartEmployees.sort((a, b) => (a.departmentName || "").localeCompare(b.departmentName || ""));

      setUnassignedList(sidebarEmployees);

      const flowNodes = chartEmployees.map((emp) => ({
        id: emp.id.toString(),
        type: 'employee',
        data: { ...emp }, 
        position: { x: 0, y: 0 }
      }));

      // Edges: Using #a3a3a3 (Neutral-400) for a neutral gray line
      const flowEdges = relationships
        .filter(rel => rel.manager !== null && rel.doctor !== null)
        .map((rel) => ({
            id: `e-${rel.manager.id}-${rel.doctor.id}`,
            source: rel.manager.id.toString(),
            target: rel.doctor.id.toString(),
            type: 'deletable', 
            data: { 
                targetId: rel.doctor.id, 
                onDelete: handleDeleteEdge 
            },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#a3a3a3' },
            style: { stroke: '#a3a3a3', strokeWidth: 2 }
      }));

      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(flowNodes, flowEdges);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);

    } catch (error) {
      console.error("Org Chart Error:", error);
      toast.error("Failed to load organization structure");
    } finally {
        setLoading(false);
    }
  }, [setNodes, setEdges, handleDeleteEdge]);

  // --- DRAG & DROP ---
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(async (event) => {
    event.preventDefault();
    const employeeId = event.dataTransfer.getData('application/reactflow');
    
    if (!employeeId) return;

    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    
    const managerNode = nodes.find(n => 
        position.x >= n.position.x && 
        position.x <= n.position.x + nodeWidth &&
        position.y >= n.position.y && 
        position.y <= n.position.y + nodeHeight
    );

    try {
        if (managerNode) {
            await api.post("/api/org-chart/assign", {
                managerId: parseInt(managerNode.id),
                doctorId: parseInt(employeeId)
            });
            toast.success(`Assigned to ${managerNode.data.firstName}`);
        } else {
            await api.post("/api/org-chart/assign", {
                managerId: null, 
                doctorId: parseInt(employeeId)
            });
            toast.success("Set as a Root Node");
        }
        
        fetchOrgChart(); 
    } catch(e) {
        toast.error("Assignment failed");
    }
  }, [nodes, screenToFlowPosition, fetchOrgChart]);

  // --- CONNECT ---
  const onConnect = useCallback(async (params) => {
    try {
        await api.post("/api/org-chart/assign", {
            managerId: parseInt(params.source),
            doctorId: parseInt(params.target)
        });
        toast.success("Relationship updated");
        fetchOrgChart(); 
    } catch (e) { 
        toast.error("Failed to link employees"); 
    }
  }, [fetchOrgChart]);

  useEffect(() => { fetchOrgChart(); }, [fetchOrgChart]);

  return (
    // Main Container: Neutral Backgrounds
    <div className="flex h-[750px] border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm bg-neutral-50 dark:bg-neutral-950 relative">
        
        {loading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-neutral-950/50 backdrop-blur-sm pointer-events-none">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )}

        {/* LEFT: Sidebar */}
        <UnassignedSidebar employees={unassignedList} />

        {/* RIGHT: Canvas */}
        <div className="flex-1 relative h-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDragOver={onDragOver}
                onDrop={onDrop}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                minZoom={0.1}
                maxZoom={1.5}
                fitView
                proOptions={{ hideAttribution: true }} 
                // Force dark class on the wrapper
                className="bg-neutral-50 dark:bg-neutral-950"
            >
                <Controls 
                    // Neutral Styling for Controls (pure white/gray)
                    className="!bg-white dark:!bg-neutral-900 !border-neutral-200 dark:!border-neutral-800 !text-neutral-700 dark:!text-neutral-200 [&>button]:!border-b-neutral-100 dark:[&>button]:!border-b-neutral-800 [&>button:hover]:!bg-neutral-50 dark:[&>button:hover]:!bg-neutral-800" 
                />
                
                <Background 
                    color="#737373" // Neutral-500
                    gap={24} 
                    size={1} 
                    className="opacity-20 dark:opacity-10" 
                />
                
                <Panel position="top-right" className="bg-white/90 dark:bg-neutral-900/90 p-2 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800 backdrop-blur">
                    <button 
                        onClick={fetchOrgChart}
                        className="flex items-center gap-2 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-primary transition-colors"
                    >
                        <RefreshCcw className="w-3.5 h-3.5" />
                        Reset Layout
                    </button>
                </Panel>
            </ReactFlow>
        </div>
    </div>
  );
}

export default function OrgChart() {
    return (
        <ReactFlowProvider>
            <OrgChartContent />
        </ReactFlowProvider>
    );
}