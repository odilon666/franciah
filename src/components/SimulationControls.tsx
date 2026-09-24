import React from 'react';
import {
  SlidersHorizontal,
  CheckCircle,
  Play,
  RotateCcw,
  Sparkles,
  ChevronRight,
  PackageCheck,
  Check,
  CheckSquare,
} from 'lucide-react';
import { VendingState } from '../types/vending';

interface SimulationControlsProps {
  state: VendingState;
  onFire: (transitionId: string) => void;
  onReset: () => void;
  isLoading?: boolean;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  state,
  onFire,
  onReset,
  isLoading = false,
}) => {
  const isEnabled = (transId: string) => state.enabled_transitions.includes(transId);

  // Évaluation de l'étape recommandée pour guider la démonstration universitaire (Section 23)
  const getDemoStepTip = () => {
    const { marking, inserted_amount, selected_drink } = state;
    if (marking.P1 >= 1) {
      return {
        step: 1,
        title: 'Étape 1 : Insertion d’argent',
        advice: 'Insérez 1000 Ar puis 500 Ar pour démarrer la transaction (Transition T1).',
      };
    }
    if (marking.P2 >= 1) {
      if (!selected_drink) {
        return {
          step: 2,
          title: 'Étape 2 : Choix de la boisson',
          advice: 'Sélectionnez une boisson (ex. Soda - 1500 Ar) ci-dessus.',
        };
      }
      return {
        step: 3,
        title: 'Étape 3 : Vérification du montant',
        advice: `Cliquez sur "T2 - Vérifier le montant" (${inserted_amount} Ar insérés).`,
      };
    }
    if (marking.P3 >= 1) {
      return {
        step: 4,
        title: 'Étape 4 : Validation de la sélection',
        advice: 'Cliquez sur "T3 - Sélectionner une boisson" pour router vers le stock.',
      };
    }
    if (marking.P4 >= 1) {
      return {
        step: 5,
        title: 'Étape 5 : Consommation de la ressource',
        advice: `Cliquez sur la boisson choisie (T4 Eau, T5 Soda ou T6 Jus) pour décrémenter le stock.`,
      };
    }
    if (marking.P8 >= 1) {
      return {
        step: 6,
        title: 'Étape 6 : Distribution',
        advice: 'Cliquez sur "T7 - Lancer la distribution" pour acheminer le produit.',
      };
    }
    if (marking.P9 >= 1) {
      return {
        step: 7,
        title: 'Étape 7 : Délivrance & Monnaie',
        advice: 'Cliquez sur "T8 - Délivrer la boisson" pour calculer la monnaie.',
      };
    }
    if (marking.P10 >= 1) {
      return {
        step: 8,
        title: 'Étape 8 : Fin de transaction',
        advice: 'Cliquez sur "T9 - Terminer la transaction" pour restituer la monnaie et libérer la machine.',
      };
    }
    return {
      step: 0,
      title: 'Simulation',
      advice: 'Cliquez sur les transitions franchissables pour animer le réseau.',
    };
  };

  const demoTip = getDemoStepTip();

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Commandes de Simulation</h3>
            <p className="text-[11px] text-slate-400">Contrôle manuel des transitions du Réseau de Petri</p>
          </div>
        </div>

        <button
          onClick={onReset}
          disabled={isLoading}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-600/50 transition-all duration-150 flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
        >
          <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
          Réinitialiser (M0)
        </button>
      </div>

      {/* Bannière du guide de démonstration universitaire */}
      <div className="mb-4 p-2.5 rounded-lg bg-purple-950/30 border border-purple-800/40 text-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-hidden">
          <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
          <div className="truncate">
            <span className="font-semibold text-purple-200 mr-2">{demoTip.title} :</span>
            <span className="text-slate-300">{demoTip.advice}</span>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-700/50 flex-shrink-0">
          Étape {demoTip.step}/8
        </span>
      </div>

      {/* Grille des boutons de transitions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* T2 - Vérifier le montant */}
        <button
          onClick={() => onFire('T2')}
          disabled={!isEnabled('T2') || isLoading}
          className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all duration-150 ${
            isEnabled('T2')
              ? 'bg-purple-900/30 border-purple-500/80 text-purple-100 hover:bg-purple-800/40 shadow-sm shadow-purple-500/10 ring-1 ring-purple-500/40 cursor-pointer active:scale-95'
              : 'bg-slate-950/40 border-slate-800 text-slate-500 cursor-not-allowed opacity-60'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono font-bold text-xs px-1.5 py-0.5 rounded bg-slate-800 text-purple-300">
              T2
            </span>
            {isEnabled('T2') && <Check className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />}
          </div>
          <span className="text-xs font-semibold block text-slate-200">Vérifier le montant</span>
          <span className="text-[10px] text-slate-400 mt-1 block">P2 → T2 → P3</span>
        </button>

        {/* T3 - Sélectionner une boisson */}
        <button
          onClick={() => onFire('T3')}
          disabled={!isEnabled('T3') || isLoading}
          className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all duration-150 ${
            isEnabled('T3')
              ? 'bg-purple-900/30 border-purple-500/80 text-purple-100 hover:bg-purple-800/40 shadow-sm shadow-purple-500/10 ring-1 ring-purple-500/40 cursor-pointer active:scale-95'
              : 'bg-slate-950/40 border-slate-800 text-slate-500 cursor-not-allowed opacity-60'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono font-bold text-xs px-1.5 py-0.5 rounded bg-slate-800 text-purple-300">
              T3
            </span>
            {isEnabled('T3') && <Check className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />}
          </div>
          <span className="text-xs font-semibold block text-slate-200">Sélectionner boisson</span>
          <span className="text-[10px] text-slate-400 mt-1 block">P3 → T3 → P4</span>
        </button>

        {/* T7 - Lancer la distribution */}
        <button
          onClick={() => onFire('T7')}
          disabled={!isEnabled('T7') || isLoading}
          className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all duration-150 ${
            isEnabled('T7')
              ? 'bg-purple-900/30 border-purple-500/80 text-purple-100 hover:bg-purple-800/40 shadow-sm shadow-purple-500/10 ring-1 ring-purple-500/40 cursor-pointer active:scale-95'
              : 'bg-slate-950/40 border-slate-800 text-slate-500 cursor-not-allowed opacity-60'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono font-bold text-xs px-1.5 py-0.5 rounded bg-slate-800 text-purple-300">
              T7
            </span>
            {isEnabled('T7') && <Play className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />}
          </div>
          <span className="text-xs font-semibold block text-slate-200">Lancer distribution</span>
          <span className="text-[10px] text-slate-400 mt-1 block">P8 → T7 → P9</span>
        </button>

        {/* T8 - Délivrer la boisson */}
        <button
          onClick={() => onFire('T8')}
          disabled={!isEnabled('T8') || isLoading}
          className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all duration-150 ${
            isEnabled('T8')
              ? 'bg-purple-900/30 border-purple-500/80 text-purple-100 hover:bg-purple-800/40 shadow-sm shadow-purple-500/10 ring-1 ring-purple-500/40 cursor-pointer active:scale-95'
              : 'bg-slate-950/40 border-slate-800 text-slate-500 cursor-not-allowed opacity-60'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono font-bold text-xs px-1.5 py-0.5 rounded bg-slate-800 text-purple-300">
              T8
            </span>
            {isEnabled('T8') && <PackageCheck className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />}
          </div>
          <span className="text-xs font-semibold block text-slate-200">Délivrer boisson</span>
          <span className="text-[10px] text-slate-400 mt-1 block">P9 → T8 → P10</span>
        </button>
      </div>

      {/* Ligne inférieure : T4/T5/T6 spécifiques & T9 Terminer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-2.5">
        <button
          onClick={() => onFire('T4')}
          disabled={!isEnabled('T4') || isLoading}
          className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
            isEnabled('T4')
              ? 'bg-cyan-950/30 border-cyan-500/60 text-cyan-200 hover:bg-cyan-900/40 cursor-pointer'
              : 'bg-slate-950/40 border-slate-800 text-slate-600 cursor-not-allowed'
          }`}
        >
          <div>
            <div className="font-mono font-bold text-xs text-cyan-400">T4 : Eau</div>
            <div className="text-[10px] text-slate-400">P4 + P5 → P8</div>
          </div>
          {isEnabled('T4') && <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />}
        </button>

        <button
          onClick={() => onFire('T5')}
          disabled={!isEnabled('T5') || isLoading}
          className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
            isEnabled('T5')
              ? 'bg-amber-950/30 border-amber-500/60 text-amber-200 hover:bg-amber-900/40 cursor-pointer'
              : 'bg-slate-950/40 border-slate-800 text-slate-600 cursor-not-allowed'
          }`}
        >
          <div>
            <div className="font-mono font-bold text-xs text-amber-400">T5 : Soda</div>
            <div className="text-[10px] text-slate-400">P4 + P6 → P8</div>
          </div>
          {isEnabled('T5') && <ChevronRight className="w-3.5 h-3.5 text-amber-400" />}
        </button>

        <button
          onClick={() => onFire('T6')}
          disabled={!isEnabled('T6') || isLoading}
          className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
            isEnabled('T6')
              ? 'bg-orange-950/30 border-orange-500/60 text-orange-200 hover:bg-orange-900/40 cursor-pointer'
              : 'bg-slate-950/40 border-slate-800 text-slate-600 cursor-not-allowed'
          }`}
        >
          <div>
            <div className="font-mono font-bold text-xs text-orange-400">T6 : Jus</div>
            <div className="text-[10px] text-slate-400">P4 + P7 → P8</div>
          </div>
          {isEnabled('T6') && <ChevronRight className="w-3.5 h-3.5 text-orange-400" />}
        </button>

        {/* T9 - Terminer la transaction */}
        <button
          onClick={() => onFire('T9')}
          disabled={!isEnabled('T9') || isLoading}
          className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
            isEnabled('T9')
              ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-100 hover:bg-emerald-900/50 ring-1 ring-emerald-500/50 cursor-pointer shadow-sm'
              : 'bg-slate-950/40 border-slate-800 text-slate-600 cursor-not-allowed'
          }`}
        >
          <div>
            <div className="font-mono font-bold text-xs text-emerald-400">T9 : Terminer</div>
            <div className="text-[10px] text-slate-400">P10 → P1 (Restitution)</div>
          </div>
          {isEnabled('T9') && <CheckSquare className="w-4 h-4 text-emerald-400 animate-pulse" />}
        </button>
      </div>
    </div>
  );
};
