// src/components/chat/DocumentGraph.jsx
import React, { useEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react';
import { useStore } from '../../store/globalStore';
import { eventBus, EventTypes } from '../../services/events/EventBus';
import { performanceMonitor } from '../../services/performance/PerformanceMonitor';

const COLORS = {
  MESSAGE: '#3B82F6',     // Bleu pour les messages
  DOCUMENT: '#10B981',    // Vert pour les documents
  EDGE: 'rgba(59, 130, 246, 0.5)', // Bleu transparent pour les connexions
  TEXT: '#1F2937'         // Gris foncé pour le texte
};

const DocumentGraph = ({ width = 600, height = 600 }) => {
  const canvasRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const { messages } = useStore();

  const getGraphData = () => {
    const nodes = new Map();
    const edges = [];

    // Ajouter les messages comme nœuds
    messages.forEach((message, index) => {
      const angle = (index / messages.length) * Math.PI * 2;
      nodes.set(`message-${message.id}`, {
        id: message.id,
        type: 'message',
        x: Math.cos(angle) * 200 + width/2,
        y: Math.sin(angle) * 200 + height/2,
        label: message.content.slice(0, 20) + '...'
      });

      // Ajouter les documents comme nœuds et créer les connexions
      message.documents?.forEach(doc => {
        const docId = `doc-${doc.source}`;
        if (!nodes.has(docId)) {
          nodes.set(docId, {
            id: doc.source,
            type: 'document',
            x: width/2 + (Math.random() - 0.5) * 100,
            y: height/2 + (Math.random() - 0.5) * 100,
            label: doc.source.split('/').pop()
          });
        }
        edges.push({
          from: `message-${message.id}`,
          to: docId,
          weight: doc.relevance || 1
        });
      });
    });

    return { nodes: Array.from(nodes.values()), edges };
  };

  const drawGraph = () => {
    const perfMark = performanceMonitor.startMeasure('graph_render');
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { nodes, edges } = getGraphData();

    // Nettoyer le canvas
    ctx.clearRect(0, 0, width, height);

    // Appliquer les transformations
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom, zoom);

    // Dessiner les connexions
    edges.forEach(edge => {
      const fromNode = nodes.find(n => n.id === edge.from.split('-')[1]);
      const toNode = nodes.find(n => n.id === edge.to.split('-')[1]);

      if (fromNode && toNode) {
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.strokeStyle = COLORS.EDGE;
        ctx.lineWidth = edge.weight * 2;
        ctx.stroke();
      }
    });

    // Dessiner les nœuds
    nodes.forEach(node => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.type === 'message' ? 8 : 12, 0, Math.PI * 2);
      ctx.fillStyle = node.type === 'message' ? COLORS.MESSAGE : COLORS.DOCUMENT;
      ctx.fill();

      // Texte
      ctx.fillStyle = COLORS.TEXT;
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.label, node.x, node.y + 20);
    });

    ctx.restore();
    performanceMonitor.endMeasure(perfMark);
  };

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - rect.left - offset.x,
      y: e.clientY - rect.top - offset.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const rect = canvasRef.current.getBoundingClientRect();
    setOffset({
      x: e.clientX - rect.left - dragStart.x,
      y: e.clientY - rect.top - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (delta) => {
    setZoom(prev => {
      const newZoom = Math.max(0.5, Math.min(2, prev + delta));
      eventBus.emit(EventTypes.SYSTEM.INFO, {
        message: `Zoom: ${Math.round(newZoom * 100)}%`
      });
      return newZoom;
    });
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    } else {
      canvasRef.current.requestFullscreen();
      setIsFullscreen(true);
    }
  };

  useEffect(() => {
    drawGraph();
  }, [messages, zoom, offset]);

  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Contrôles */}
      <div className="absolute top-4 right-4 flex space-x-2 z-10">
        <button
          onClick={() => handleZoom(0.1)}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
          title="Zoom avant"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleZoom(-0.1)}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
          title="Zoom arrière"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
          title={isFullscreen ? "Quitter plein écran" : "Plein écran"}
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`w-full h-[600px] ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      />

      {/* Légende */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.MESSAGE }} />
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Messages</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.DOCUMENT }} />
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Documents</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentGraph;
