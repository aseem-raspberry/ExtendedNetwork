"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { ReactFlow, ReactFlowProvider, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useGotaavalaaForce } from '@/hooks/useGotaavalaaForce';
import { nodeTypes as customNodeTypes } from './NodeTypes';
import { NodeInspector } from './NodeInspector';
import { SidebarFilters } from './SidebarFilters';

function GraphCanvasInner({ initialData }) {
  const [activeFilters, setActiveFilters] = useState(['Person', 'Institution', 'Organization', 'Place']);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  // Initialize with force layout
  const { nodes, edges, setNodes, onNodesChange, setEdges, onEdgesChange } = useGotaavalaaForce(initialData.nodes, initialData.edges);

  const toggleFilter = (type) => {
    setActiveFilters(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  // Memoize nodeTypes so React Flow doesn't complain about recreating it
  const nodeTypes = useMemo(() => customNodeTypes, []);

  // Compute visible nodes locally (could also adjust the physics if we wanted, 
  // but simpler to just hide them using standard filtered arrays)
  const visibleNodes = useMemo(() => {
    return nodes.filter(n => {
      // our neo4j API sets labels as array, so n.labels[0] is typically the main type
      const typeStr = n.labels ? n.labels[0] : n.type;
      return activeFilters.includes(typeStr);
    }).map(n => ({
      ...n,
      type: n.labels ? n.labels[0] : n.type,
      data: { 
        ...n.properties, 
        onExpand: handleExpandNode // Inject expand callback into node data
      }
    }));
  }, [nodes, activeFilters]);

  // Compute visible edges depending on whether BOTH source and target are visible
  const visibleEdges = useMemo(() => {
    const visibleIds = new Set(visibleNodes.map(n => n.id));
    return edges.filter(e => visibleIds.has(e.source) && visibleIds.has(e.target));
  }, [edges, visibleNodes]);

  const handleNodeClick = (_, node) => {
     setSelectedNodeId(node.id);
  };

  const handleExpandNode = useCallback(async (nodeId) => {
     try {
       const res = await fetch(`/api/graph/nodes?nodeId=${nodeId}`);
       const json = await res.json();
       if (json.nodes) {
          // add to context
          setNodes(prev => {
             const existing = new Set(prev.map(p => p.id));
             const newNodes = json.nodes.filter(n => !existing.has(n.id));
             // Place exactly near clicked node to improve physics stability
             const clicked = prev.find(p => p.id === nodeId);
             const offsetNodes = newNodes.map(n => ({
                ...n,
                position: { 
                   x: (clicked?.position.x || 0) + (Math.random() * 40 - 20),
                   y: (clicked?.position.y || 0) + (Math.random() * 40 - 20)
                }
             }));
             return [...prev, ...offsetNodes];
          });
       }
       if (json.edges) {
          setEdges(prev => {
             const existing = new Set(prev.map(e => e.id));
             const newEdges = json.edges.filter(e => !existing.has(e.id));
             return [...prev, ...newEdges];
          });
       }
     } catch(e) { console.error("Expand error", e) }
  }, [setNodes, setEdges]);

  const handleAddConnection = async (sourceId, targetType, relationshipType, targetData) => {
    try {
      const res = await fetch('/api/graph/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'addConnection', sourceId, targetType, relationshipType, targetData })
      });
      const data = await res.json();
      if (data.success) {
        // Expand the source node to catch the newly created connection
        handleExpandNode(sourceId);
      }
    } catch(e) {
      console.error(e);
    }
  };

  const selectedNode = visibleNodes.find(n => n.id === selectedNodeId) || null;

  return (
    <div className="flex-1 relative w-full h-full bg-[#0a0f18]">
      <SidebarFilters activeFilters={activeFilters} toggleFilter={toggleFilter} />
      
      <ReactFlow
        nodes={visibleNodes}
        edges={visibleEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onPaneClick={() => setSelectedNodeId(null)}
        fitView
        className="brightness-110"
      >
        <Background color="#1f2937" size={2} gap={24} />
      </ReactFlow>

      {selectedNode && (
        <NodeInspector 
          node={selectedNode} 
          onClose={() => setSelectedNodeId(null)} 
          onAddConnection={handleAddConnection} 
        />
      )}
    </div>
  );
}

export function GraphCanvas(props) {
  return (
    <ReactFlowProvider>
      <GraphCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
