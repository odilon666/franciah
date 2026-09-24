import React, { useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  Node,
  Edge,
  Handle,
  Position,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Marking } from '../types/vending';

interface PetriNetProps {
  marking: Marking;
  enabledTransitions: string[];
  lastTransition: string | null;
  onTransitionClick: (transId: string) => void;
}

// Composant Custom Node pour les Places (Cercles)
// Style souhaité : ○ cercles blancs avec bordure turquoise
// Tokens : ● petits points turquoise
const PlaceNode: React.FC<{ data: any }> = ({ data }) => {
  const { id, name, tokens, category, isHighlighted } = data;

  const renderTokenDots = () => {
    if (tokens === 0) return <span className="text-[10px] text-slate-400 font-mono">0</span>;
    if (tokens <= 5) {
      return (
        <div className="flex flex-wrap items-center justify-center gap-1 max-w-[42px]">
          {Array.from({ length: tokens }).map((_, idx) => (
            <span
              key={idx}
              className="w-2 h-2 rounded-full inline-block bg-teal-500 shadow-xs"
            />
          ))}
        </div>
      );
    }
    return (
      <div className="flex items-center gap-0.5">
        <span className="w-2 h-2 rounded-full bg-teal-500 inline-block mr-0.5" />
        <span className="text-xs font-bold font-mono text-teal-700">×{tokens}</span>
      </div>
    );
  };

  const getBorderColor = () => {
    if (tokens > 0) {
      return 'border-teal-500 ring-2 ring-teal-400/30 bg-white';
    }
    return 'border-slate-300 bg-white';
  };

  return (
    <div className="flex flex-col items-center">
      {/* Handles de connexion */}
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-teal-600 !border-none" />
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-teal-600 !border-none" id="left" />

      {/* Cercle blanc avec bordure turquoise */}
      <div
        className={`w-16 h-16 rounded-full border-2 flex flex-col items-center justify-center relative transition-all duration-300 shadow-xs ${getBorderColor()} ${
          isHighlighted ? 'scale-110 shadow-md ring-4 ring-teal-300 border-teal-600' : ''
        }`}
      >
        <span className="text-[10px] font-mono font-bold text-slate-500 absolute top-1">{id}</span>
        <div className="mt-2.5 flex items-center justify-center">{renderTokenDots()}</div>
        {tokens > 0 && (
          <span className="absolute -bottom-1 -right-1 bg-teal-600 text-white text-[10px] font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
            {tokens}
          </span>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-teal-600 !border-none" />
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-teal-600 !border-none" id="right" />

      {/* Libellé lisible sous la place */}
      <div className="mt-1 text-center max-w-[95px]">
        <p className="text-[11px] font-semibold text-slate-800 leading-tight">{name}</p>
      </div>
    </div>
  );
};

// Composant Custom Node pour les Transitions (Rectangles)
// Style souhaité : ▭ rectangles orange
// Transition activée : orange plus visible (avec halo / pulse)
// Transition désactivée : gris
const TransitionNode: React.FC<{ data: any }> = ({ data }) => {
  const { id, name, isEnabled, isLast, onClick } = data;

  return (
    <div className="flex flex-col items-center">
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-orange-500 !border-none" />
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-orange-500 !border-none" id="left" />

      {/* Rectangle orange */}
      <button
        onClick={() => onClick(id)}
        disabled={!isEnabled}
        className={`w-28 py-2 px-2.5 rounded-lg border-2 transition-all duration-200 text-center flex flex-col items-center justify-center ${
          isEnabled
            ? 'bg-orange-500 border-orange-600 text-white hover:bg-orange-600 shadow-md shadow-orange-500/30 ring-2 ring-orange-400/40 cursor-pointer animate-pulse active:scale-95'
            : isLast
            ? 'bg-orange-50 border-orange-300 text-orange-900 font-medium'
            : 'bg-slate-100 border-slate-300 text-slate-500 cursor-not-allowed opacity-80'
        }`}
      >
        <span className="text-[11px] font-mono font-bold tracking-wider">{id}</span>
        <span className="text-[10px] font-semibold truncate max-w-full leading-tight mt-0.5">{name}</span>
      </button>

      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-orange-500 !border-none" />
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-orange-500 !border-none" id="right" />
    </div>
  );
};

const nodeTypes = {
  petriPlace: PlaceNode,
  petriTransition: TransitionNode,
};

export const PetriNet: React.FC<PetriNetProps> = ({
  marking,
  enabledTransitions,
  lastTransition,
  onTransitionClick,
}) => {
  // Définition spatiale des nœuds selon la topologie formelle du distributeur
  const nodes: Node[] = useMemo(() => {
    return [
      // 1. Cycle supérieur : Entrée & Montant
      {
        id: 'P1',
        type: 'petriPlace',
        position: { x: 50, y: 50 },
        data: {
          id: 'P1',
          name: 'Machine dispo',
          tokens: marking.P1,
          category: 'state',
          isHighlighted: marking.P1 > 0,
        },
      },
      {
        id: 'T1',
        type: 'petriTransition',
        position: { x: 210, y: 56 },
        data: {
          id: 'T1',
          name: 'Insérer argent',
          isEnabled: enabledTransitions.includes('T1'),
          isLast: lastTransition === 'T1',
          onClick: onTransitionClick,
        },
      },
      {
        id: 'P2',
        type: 'petriPlace',
        position: { x: 380, y: 50 },
        data: {
          id: 'P2',
          name: 'Argent inséré',
          tokens: marking.P2,
          category: 'state',
          isHighlighted: marking.P2 > 0,
        },
      },
      {
        id: 'T2',
        type: 'petriTransition',
        position: { x: 530, y: 56 },
        data: {
          id: 'T2',
          name: 'Vérifier montant',
          isEnabled: enabledTransitions.includes('T2'),
          isLast: lastTransition === 'T2',
          onClick: onTransitionClick,
        },
      },
      {
        id: 'P3',
        type: 'petriPlace',
        position: { x: 700, y: 50 },
        data: {
          id: 'P3',
          name: 'Montant suffisant',
          tokens: marking.P3,
          category: 'state',
          isHighlighted: marking.P3 > 0,
        },
      },

      // 2. Sélection & Stocks
      {
        id: 'T3',
        type: 'petriTransition',
        position: { x: 700, y: 170 },
        data: {
          id: 'T3',
          name: 'Sélectionner',
          isEnabled: enabledTransitions.includes('T3'),
          isLast: lastTransition === 'T3',
          onClick: onTransitionClick,
        },
      },
      {
        id: 'P4',
        type: 'petriPlace',
        position: { x: 700, y: 260 },
        data: {
          id: 'P4',
          name: 'Choix validé',
          tokens: marking.P4,
          category: 'state',
          isHighlighted: marking.P4 > 0,
        },
      },

      // Colonne des stocks de boissons (Ressources physiques P5, P6, P7)
      {
        id: 'P5',
        type: 'petriPlace',
        position: { x: 230, y: 200 },
        data: {
          id: 'P5',
          name: 'Stock Eau',
          tokens: marking.P5,
          category: 'resource',
          isHighlighted: marking.P5 > 0,
        },
      },
      {
        id: 'T4',
        type: 'petriTransition',
        position: { x: 380, y: 206 },
        data: {
          id: 'T4',
          name: 'Délivrer Eau',
          isEnabled: enabledTransitions.includes('T4'),
          isLast: lastTransition === 'T4',
          onClick: onTransitionClick,
        },
      },

      {
        id: 'P6',
        type: 'petriPlace',
        position: { x: 230, y: 300 },
        data: {
          id: 'P6',
          name: 'Stock Soda',
          tokens: marking.P6,
          category: 'resource',
          isHighlighted: marking.P6 > 0,
        },
      },
      {
        id: 'T5',
        type: 'petriTransition',
        position: { x: 380, y: 306 },
        data: {
          id: 'T5',
          name: 'Délivrer Soda',
          isEnabled: enabledTransitions.includes('T5'),
          isLast: lastTransition === 'T5',
          onClick: onTransitionClick,
        },
      },

      {
        id: 'P7',
        type: 'petriPlace',
        position: { x: 230, y: 400 },
        data: {
          id: 'P7',
          name: 'Stock Jus',
          tokens: marking.P7,
          category: 'resource',
          isHighlighted: marking.P7 > 0,
        },
      },
      {
        id: 'T6',
        type: 'petriTransition',
        position: { x: 380, y: 406 },
        data: {
          id: 'T6',
          name: 'Délivrer Jus',
          isEnabled: enabledTransitions.includes('T6'),
          isLast: lastTransition === 'T6',
          onClick: onTransitionClick,
        },
      },

      // 3. Distribution, Sortie physique & Réinitialisation
      {
        id: 'P8',
        type: 'petriPlace',
        position: { x: 550, y: 300 },
        data: {
          id: 'P8',
          name: 'Distribution en cours',
          tokens: marking.P8,
          category: 'execution',
          isHighlighted: marking.P8 > 0,
        },
      },
      {
        id: 'T7',
        type: 'petriTransition',
        position: { x: 550, y: 410 },
        data: {
          id: 'T7',
          name: 'Lancer distribution',
          isEnabled: enabledTransitions.includes('T7'),
          isLast: lastTransition === 'T7',
          onClick: onTransitionClick,
        },
      },
      {
        id: 'P9',
        type: 'petriPlace',
        position: { x: 550, y: 510 },
        data: {
          id: 'P9',
          name: 'Boisson délivrée',
          tokens: marking.P9,
          category: 'output',
          isHighlighted: marking.P9 > 0,
        },
      },
      {
        id: 'T8',
        type: 'petriTransition',
        position: { x: 380, y: 516 },
        data: {
          id: 'T8',
          name: 'Délivrer boisson',
          isEnabled: enabledTransitions.includes('T8'),
          isLast: lastTransition === 'T8',
          onClick: onTransitionClick,
        },
      },
      {
        id: 'P10',
        type: 'petriPlace',
        position: { x: 230, y: 510 },
        data: {
          id: 'P10',
          name: 'Fin transaction',
          tokens: marking.P10,
          category: 'output',
          isHighlighted: marking.P10 > 0,
        },
      },
      {
        id: 'T9',
        type: 'petriTransition',
        position: { x: 50, y: 350 },
        data: {
          id: 'T9',
          name: 'Terminer (Reset)',
          isEnabled: enabledTransitions.includes('T9'),
          isLast: lastTransition === 'T9',
          onClick: onTransitionClick,
        },
      },
    ];
  }, [marking, enabledTransitions, lastTransition, onTransitionClick]);

  // Définition des Arcs orientés (Flèches) avec couleurs claires et distinctes
  const edges: Edge[] = useMemo(() => {
    const activeColor = '#0d9488'; // Turquoise / Teal
    const inactiveColor = '#94a3b8'; // Slate clair

    return [
      // P1 -> T1 -> P2
      {
        id: 'e-p1-t1',
        source: 'P1',
        target: 'T1',
        animated: marking.P1 > 0,
        style: { stroke: marking.P1 > 0 ? activeColor : inactiveColor, strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: marking.P1 > 0 ? activeColor : inactiveColor },
      },
      {
        id: 'e-t1-p2',
        source: 'T1',
        target: 'P2',
        style: { stroke: inactiveColor, strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: inactiveColor },
      },

      // P2 -> T2 -> P3
      {
        id: 'e-p2-t2',
        source: 'P2',
        target: 'T2',
        animated: marking.P2 > 0,
        style: { stroke: marking.P2 > 0 ? activeColor : inactiveColor, strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: marking.P2 > 0 ? activeColor : inactiveColor },
      },
      {
        id: 'e-t2-p3',
        source: 'T2',
        target: 'P3',
        style: { stroke: inactiveColor, strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: inactiveColor },
      },

      // P3 -> T3 -> P4
      {
        id: 'e-p3-t3',
        source: 'P3',
        target: 'T3',
        animated: marking.P3 > 0,
        style: { stroke: marking.P3 > 0 ? activeColor : inactiveColor, strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: marking.P3 > 0 ? activeColor : inactiveColor },
      },
      {
        id: 'e-t3-p4',
        source: 'T3',
        target: 'P4',
        style: { stroke: inactiveColor, strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: inactiveColor },
      },

      // P4 -> T4, T5, T6
      {
        id: 'e-p4-t4',
        source: 'P4',
        target: 'T4',
        style: { stroke: marking.P4 > 0 ? '#0284c7' : inactiveColor, strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: marking.P4 > 0 ? '#0284c7' : inactiveColor },
      },
      {
        id: 'e-p4-t5',
        source: 'P4',
        target: 'T5',
        style: { stroke: marking.P4 > 0 ? '#f59e0b' : inactiveColor, strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: marking.P4 > 0 ? '#f59e0b' : inactiveColor },
      },
      {
        id: 'e-p4-t6',
        source: 'P4',
        target: 'T6',
        style: { stroke: marking.P4 > 0 ? '#f97316' : inactiveColor, strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: marking.P4 > 0 ? '#f97316' : inactiveColor },
      },

      // P5 -> T4, P6 -> T5, P7 -> T6 (Ressources consommées)
      {
        id: 'e-p5-t4',
        source: 'P5',
        target: 'T4',
        style: { stroke: '#0d9488', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#0d9488' },
      },
      {
        id: 'e-p6-t5',
        source: 'P6',
        target: 'T5',
        style: { stroke: '#f59e0b', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' },
      },
      {
        id: 'e-p7-t6',
        source: 'P7',
        target: 'T6',
        style: { stroke: '#f97316', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#f97316' },
      },

      // T4, T5, T6 -> P8
      {
        id: 'e-t4-p8',
        source: 'T4',
        target: 'P8',
        style: { stroke: '#0284c7', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#0284c7' },
      },
      {
        id: 'e-t5-p8',
        source: 'T5',
        target: 'P8',
        style: { stroke: '#f59e0b', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' },
      },
      {
        id: 'e-t6-p8',
        source: 'T6',
        target: 'P8',
        style: { stroke: '#f97316', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#f97316' },
      },

      // P8 -> T7 -> P9
      {
        id: 'e-p8-t7',
        source: 'P8',
        target: 'T7',
        animated: marking.P8 > 0,
        style: { stroke: marking.P8 > 0 ? '#f97316' : inactiveColor, strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: marking.P8 > 0 ? '#f97316' : inactiveColor },
      },
      {
        id: 'e-t7-p9',
        source: 'T7',
        target: 'P9',
        style: { stroke: inactiveColor, strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: inactiveColor },
      },

      // P9 -> T8 -> P10
      {
        id: 'e-p9-t8',
        source: 'P9',
        target: 'T8',
        animated: marking.P9 > 0,
        style: { stroke: marking.P9 > 0 ? '#10b981' : inactiveColor, strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: marking.P9 > 0 ? '#10b981' : inactiveColor },
      },
      {
        id: 'e-t8-p10',
        source: 'T8',
        target: 'P10',
        style: { stroke: inactiveColor, strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: inactiveColor },
      },

      // P10 -> T9 -> P1 (Boucle de réinitialisation)
      {
        id: 'e-p10-t9',
        source: 'P10',
        target: 'T9',
        animated: marking.P10 > 0,
        style: { stroke: marking.P10 > 0 ? '#10b981' : inactiveColor, strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: marking.P10 > 0 ? '#10b981' : inactiveColor },
      },
      {
        id: 'e-t9-p1',
        source: 'T9',
        target: 'P1',
        style: { stroke: '#0d9488', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#0d9488' },
      },
    ];
  }, [marking]);

  return (
    <div className="w-full h-full min-h-0 bg-slate-50 rounded-xl border border-slate-200 relative overflow-hidden shadow-xs flex flex-col">
      {/* Badge indicateur discret en haut à gauche */}
      <div className="absolute top-2.5 left-2.5 z-10 bg-white/95 border border-slate-200 rounded-lg px-2.5 py-1 backdrop-blur-sm shadow-xs flex items-center gap-2.5 text-[11px]">
        <span className="font-bold text-slate-800">Réseau de Petri</span>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full border-2 border-teal-500 bg-white inline-block" />
            10 Places
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-2 rounded border border-orange-600 bg-orange-500 inline-block" />
            9 Transitions
          </span>
        </div>
      </div>

      {/* Marquage initial M0 */}
      <div className="absolute top-2.5 right-2.5 z-10 bg-white/95 border border-slate-200 rounded-lg px-2 py-1 text-[10px] text-teal-800 font-mono font-bold shadow-xs">
        M0 = (1, 0, 0, 0, 5, 5, 5, 0, 0, 0)
      </div>

      {/* Canevas React Flow */}
      <div className="flex-1 w-full h-full min-h-0">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.35}
          maxZoom={1.5}
          attributionPosition="bottom-right"
        >
          {/* Fond gris très clair / blanc cassé avec petits points */}
          <Background color="#cbd5e1" gap={20} size={1} variant={BackgroundVariant.Dots} />
          <Controls
            className="!bg-white !border-slate-200 !shadow-md [&>button]:!bg-white [&>button]:!border-slate-200 [&>button]:!fill-slate-700 hover:[&>button]:!bg-slate-100"
            showInteractive={false}
          />
        </ReactFlow>
      </div>
    </div>
  );
};
