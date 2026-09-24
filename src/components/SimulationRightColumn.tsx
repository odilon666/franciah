import React from 'react';
import { VendingState, Drink } from '../types/vending';
import {
  Coins,
  RotateCcw,
  Check,
  PackageCheck,
  CheckSquare,
  History,
  Layers,
  HelpCircle,
  Clock,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface SimulationRightColumnProps {
  state: VendingState;
  drinks: Drink[];
  onFire: (transId: string) => void;
  onReset: () => void;
  onOpenMarking: () => void;
  onOpenHistory: () => void;
  onOpenModel: () => void;
  isLoading?: boolean;
}

export const SimulationRightColumn: React.FC<SimulationRightColumnProps> = ({
  state,
  drinks,
  onFire,
  onReset,
  onOpenMarking,
  onOpenHistory,
  onOpenModel,
  isLoading = false,
}) => {
  const isEnabled = (transId: string) => state.enabled_transitions.includes(transId);
  const selectedDrinkObj = drinks.find((d) => d.id === state.selected_drink);

  return (
    <div className="h-full flex flex-col justify-between gap-2.5 overflow-hidden">
      {/* 1. RÉCAPITULATIF ÉTAT & COMPTEURS */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-xs flex-shrink-0">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 mb-2">
          <div className="flex items-center gap-1.5">
            <div className="p-1 rounded-lg bg-teal-50 text-teal-700">
              <Coins className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">État Transaction</span>
          </div>
          <button
            onClick={onReset}
            disabled={isLoading}
            className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:underline transition-all"
          >
            <RotateCcw className="w-3 h-3" />
            Reset M0
          </button>
        </div>

        {/* Grille 2x2 des variables clés */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Montant */}
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/80">
            <span className="text-[10px] text-slate-500 block font-medium">Montant inséré</span>
            <span className="font-mono font-black text-teal-700 text-sm">
              {state.inserted_amount.toLocaleString()} <span className="text-[10px] font-normal text-slate-500">Ar</span>
            </span>
          </div>

          {/* Boisson */}
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/80">
            <span className="text-[10px] text-slate-500 block font-medium">Sélection</span>
            <span className="font-bold text-slate-900 text-xs truncate block">
              {selectedDrinkObj ? selectedDrinkObj.name : <span className="text-slate-400 font-normal">Aucune</span>}
            </span>
          </div>

          {/* Prix */}
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/80">
            <span className="text-[10px] text-slate-500 block font-medium">Prix requis</span>
            <span className="font-mono font-bold text-slate-800 text-xs">
              {state.selected_price ? (
                `${state.selected_price.toLocaleString()} Ar`
              ) : (
                <span className="text-slate-400">-</span>
              )}
            </span>
          </div>

          {/* Monnaie */}
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/80">
            <span className="text-[10px] text-slate-500 block font-medium">Monnaie à rendre</span>
            <span className={`font-mono font-bold text-xs ${state.change > 0 ? 'text-orange-600' : 'text-slate-500'}`}>
              {state.change.toLocaleString()} Ar
            </span>
          </div>
        </div>
      </div>

      {/* 2. COMMANDES DE TRANSITIONS DIRECTES */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-xs flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 mb-2 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="p-1 rounded-lg bg-orange-50 text-orange-600">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">Actions Petri</span>
          </div>
          <span className="text-[10px] text-orange-600 font-mono font-bold bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
            {state.enabled_transitions.length} activable(s)
          </span>
        </div>

        {/* Boutons verticaux de transitions ergonomiques */}
        <div className="space-y-1.5 overflow-y-auto custom-scrollbar flex-1 min-h-0 pr-0.5">
          {/* T2 - Vérifier montant */}
          <button
            onClick={() => onFire('T2')}
            disabled={!isEnabled('T2') || isLoading}
            className={`w-full py-1.5 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
              isEnabled('T2')
                ? 'bg-teal-50 border-teal-400 text-teal-900 hover:bg-teal-600 hover:text-white shadow-xs animate-pulse'
                : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Vérifier montant (T2)</span>
            </div>
            <span className="font-mono text-[10px]">P2 → P3</span>
          </button>

          {/* T3 - Valider sélection */}
          <button
            onClick={() => onFire('T3')}
            disabled={!isEnabled('T3') || isLoading}
            className={`w-full py-1.5 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
              isEnabled('T3')
                ? 'bg-teal-50 border-teal-400 text-teal-900 hover:bg-teal-600 hover:text-white shadow-xs animate-pulse'
                : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>Valider sélection (T3)</span>
            </div>
            <span className="font-mono text-[10px]">P3 → P4</span>
          </button>

          {/* T4 / T5 / T6 - Sortie stock */}
          {(['T4', 'T5', 'T6'] as const).map((tId) => {
            const label = tId === 'T4' ? 'Délivrer Eau (T4)' : tId === 'T5' ? 'Délivrer Soda (T5)' : 'Délivrer Jus (T6)';
            const formula = tId === 'T4' ? 'P4+P5 → P8' : tId === 'T5' ? 'P4+P6 → P8' : 'P4+P7 → P8';
            const enabled = isEnabled(tId);

            return (
              <button
                key={tId}
                onClick={() => onFire(tId)}
                disabled={!enabled || isLoading}
                className={`w-full py-1.5 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                  enabled
                    ? 'bg-orange-50 border-orange-400 text-orange-900 hover:bg-orange-500 hover:text-white shadow-xs animate-pulse'
                    : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </div>
                <span className="font-mono text-[10px]">{formula}</span>
              </button>
            );
          })}

          {/* T7 - Lancer distribution */}
          <button
            onClick={() => onFire('T7')}
            disabled={!isEnabled('T7') || isLoading}
            className={`w-full py-2 px-2.5 rounded-xl border text-xs font-black flex items-center justify-between transition-all ${
              isEnabled('T7')
                ? 'bg-orange-500 border-orange-600 text-white hover:bg-orange-600 shadow-md shadow-orange-500/20 animate-pulse'
                : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <PackageCheck className="w-4 h-4" />
              <span>Distribuer boisson (T7)</span>
            </div>
            <span className="font-mono text-[10px]">P8 → P9</span>
          </button>

          {/* T8 - Délivrer boisson au client */}
          <button
            onClick={() => onFire('T8')}
            disabled={!isEnabled('T8') || isLoading}
            className={`w-full py-1.5 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
              isEnabled('T8')
                ? 'bg-emerald-600 border-emerald-700 text-white hover:bg-emerald-700 shadow-md animate-bounce'
                : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>Récupérer boisson (T8)</span>
            </div>
            <span className="font-mono text-[10px]">P9 → P10</span>
          </button>

          {/* T9 - Terminer transaction */}
          <button
            onClick={() => onFire('T9')}
            disabled={!isEnabled('T9') || isLoading}
            className={`w-full py-1.5 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
              isEnabled('T9')
                ? 'bg-emerald-600 border-emerald-700 text-white hover:bg-emerald-700 shadow-sm animate-pulse'
                : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Terminer & Rendre monnaie (T9)</span>
            </div>
            <span className="font-mono text-[10px]">P10 → P1</span>
          </button>
        </div>

        {/* 3. RACCOURCIS PANNEAUX MODAUX FORMELS */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 text-[11px] flex-shrink-0">
          <button
            onClick={onOpenMarking}
            className="flex-1 py-1 rounded-lg bg-slate-50 hover:bg-teal-50 border border-slate-200 text-slate-700 hover:text-teal-800 transition-colors flex items-center justify-center gap-1 font-medium"
            title="Afficher la distribution des jetons"
          >
            <Layers className="w-3 h-3 text-teal-600" />
            <span>Vecteur M(t)</span>
          </button>
          <button
            onClick={onOpenHistory}
            className="flex-1 py-1 rounded-lg bg-slate-50 hover:bg-teal-50 border border-slate-200 text-slate-700 hover:text-teal-800 transition-colors flex items-center justify-center gap-1 font-medium"
            title="Consulter l'historique"
          >
            <History className="w-3 h-3 text-teal-600" />
            <span>Historique</span>
          </button>
          <button
            onClick={onOpenModel}
            className="p-1 rounded-lg bg-slate-50 hover:bg-teal-50 border border-slate-200 text-slate-700 hover:text-teal-800 transition-colors"
            title="Guide du modèle"
          >
            <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
          </button>
        </div>
      </div>
    </div>
  );
};
