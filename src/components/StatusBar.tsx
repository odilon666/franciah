import React from 'react';
import { VendingState, Drink } from '../types/vending';
import { Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface StatusBarProps {
  state: VendingState;
  drinks: Drink[];
}

export const StatusBar: React.FC<StatusBarProps> = ({ state, drinks }) => {
  const selectedDrinkObj = drinks.find((d) => d.id === state.selected_drink);
  const currentStock = selectedDrinkObj ? state.stocks[selectedDrinkObj.id] : null;

  // Feedback color
  const getBadgeStyle = () => {
    switch (state.status_type) {
      case 'success':
        return 'text-emerald-700 bg-emerald-50 border-emerald-300';
      case 'warning':
        return 'text-amber-800 bg-amber-50 border-amber-300';
      case 'error':
        return 'text-rose-700 bg-rose-50 border-rose-300';
      default:
        return 'text-teal-800 bg-teal-50 border-teal-200';
    }
  };

  return (
    <div className="w-full bg-white border-b border-slate-200 px-3 py-1.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs select-none flex-shrink-0 shadow-xs">
      {/* Items horizontaux de statut */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-slate-700">
        {/* Machine Status */}
        <div className="flex items-center gap-1.5 font-medium">
          <span className="text-slate-500 font-semibold">Borne :</span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${
              state.machine_available
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-amber-50 text-amber-700 border-amber-300'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                state.machine_available ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
              }`}
            />
            {state.machine_available ? 'DISPONIBLE (P1=1)' : 'EN TRANSACTION'}
          </span>
        </div>

        <span className="text-slate-300 hidden sm:inline">│</span>

        {/* Montant inséré */}
        <div className="flex items-center gap-1">
          <span className="text-slate-500 font-medium">Crédit :</span>
          <span className="font-mono font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
            {state.inserted_amount.toLocaleString()} Ar
          </span>
        </div>

        <span className="text-slate-300 hidden sm:inline">│</span>

        {/* Boisson sélectionnée */}
        <div className="flex items-center gap-1">
          <span className="text-slate-500 font-medium">Sélection :</span>
          <span className="font-bold text-slate-900">
            {selectedDrinkObj ? (
              <span className="text-teal-700">{selectedDrinkObj.name}</span>
            ) : (
              <span className="text-slate-400 font-normal italic">Aucune</span>
            )}
          </span>
        </div>

        <span className="text-slate-300 hidden md:inline">│</span>

        {/* Stock */}
        <div className="flex items-center gap-1">
          <span className="text-slate-500 font-medium">Stock :</span>
          <span className="font-mono font-semibold text-slate-700">
            {currentStock !== null ? (
              `${currentStock} jeton(s)`
            ) : (
              <span className="text-slate-400 font-normal">P5:5 · P6:5 · P7:5</span>
            )}
          </span>
        </div>

        <span className="text-slate-300 hidden md:inline">│</span>

        {/* Monnaie calculée */}
        <div className="flex items-center gap-1">
          <span className="text-slate-500 font-medium">Monnaie :</span>
          <span className={`font-mono font-bold ${state.change > 0 ? 'text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200' : 'text-slate-500'}`}>
            {state.change.toLocaleString()} Ar
          </span>
        </div>

        <span className="text-slate-300 hidden lg:inline">│</span>

        {/* Dernière transition */}
        <div className="hidden lg:flex items-center gap-1">
          <span className="text-slate-500 font-medium">Dernier tir :</span>
          <span className="font-mono font-bold text-teal-700 px-1.5 py-0.5 rounded bg-teal-50 border border-teal-200 text-[11px]">
            {state.last_transition || 'M0 initial'}
          </span>
        </div>
      </div>

      {/* Message de retour d'action en temps réel */}
      <div className="flex items-center gap-1.5 overflow-hidden">
        <span className={`px-2.5 py-0.5 rounded-md border text-[11px] font-semibold truncate max-w-[320px] sm:max-w-md ${getBadgeStyle()}`}>
          {state.status_message}
        </span>
      </div>
    </div>
  );
};
