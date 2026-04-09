"use client";
import { useEffect, useRef } from 'react';
import { useNodesState, useEdgesState } from '@xyflow/react';
import * as d3 from 'd3-force';

export function useGotaavalaaForce(initialNodes = [], initialEdges = []) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const simulationRef = useRef(null);

  useEffect(() => {
    if (initialNodes.length === 0) return;
    
    // Setup initial nodes if empty
    setNodes((prev) => {
      const existingIds = new Set(prev.map(n => n.id));
      const newNodes = initialNodes.filter(n => !existingIds.has(n.id)).map(n => ({
        ...n,
        position: { x: Math.random() * 50 - 25, y: Math.random() * 50 - 25 }, // give them a tiny offset near center
      }));
      return [...prev, ...newNodes];
    });

    setEdges((prev) => {
      const existingIds = new Set(prev.map(e => e.id));
      const newEdges = initialEdges.filter(e => !existingIds.has(e.id));
      return [...prev, ...newEdges];
    });
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Restart simulation whenever nodes/edges arrays change length
  useEffect(() => {
    if (nodes.length === 0) return;

    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    const simNodes = nodes.map(n => ({
      id: n.id,
      x: n.position.x || 0,
      y: n.position.y || 0,
    }));

    // Links need specific structure and d3 replaces source/target string with node objects
    const simLinks = edges.map(e => ({
      ...e,
      source: e.source,
      target: e.target
    }));

    const simulation = d3.forceSimulation(simNodes)
      .force('charge', d3.forceManyBody().strength(-1000))
      .force('link', d3.forceLink(simLinks).id(d => d.id).distance(250))
      .force('collide', d3.forceCollide().radius(70))
      // .force('center', d3.forceCenter(0, 0)) // centering sometimes makes dragging nodes fight the center
      .alphaDecay(0.05) // cool down faster
      .on('tick', () => {
        setNodes(nds => nds.map(nd => {
          const sNode = simNodes.find(s => s.id === nd.id);
          if (sNode) {
            return {
              ...nd,
              position: { x: sNode.x, y: sNode.y }
            };
          }
          return nd;
        }));
      });

    simulationRef.current = simulation;

    return () => {
      if (simulationRef.current) {
         simulationRef.current.stop();
      }
    };
  }, [nodes.length, edges.length, setNodes]); // Watch lengths so adding new nodes restarts sim

  return { nodes, edges, setNodes, onNodesChange, setEdges, onEdgesChange };
}
