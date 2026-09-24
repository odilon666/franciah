import React from 'react';
import { Activity, CheckCircle2, AlertCircle, Info, RefreshCcw, Coins, Tag, ShoppingBag } from 'lucide-react';
import { Drink, VendingState } from '../types/vending';

interface MachineStatusProps {
  state: VendingState;
  drinks: Drink[];
}

export const MachineStatus: React.FC<MachineStatusProps> = ({ state, drinks }) => {
  const selectedDrinkObj = drinks.find((d) => d.id === state.selected_drink);

  const getStatusBadge = () => {
    switch (state.status_type) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
          bg: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300',
        };
      case 'warning':
        return {
          icon: <AlertCircle className="w-4 h-4 text-amber-400" />,
          bg: 'bg-amber-950/40 border-amber-500/30 text-amber-300',
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-4 h-4 text-rose-400" />,
          bg: 'bg-rose-950/40 border-rose-500/30 text-rose-300',
        };
      default:
        return {
          icon: <Info className="w-4 h-4 text-blue-400" />,
          bg: 'bg-blue-950/40 border-blue-500/30 text-blue-300',
        };
    }
  };

  const statusStyle = getStatusBadge();

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">État de la Simulation</h3>
              <p className="text-[11px] text-slate-400">Supervision en temps réel</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                state.machine_available
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${state.machine_available ? 'bg-emerald-400' : 'bg-amber-400'}`}
              />
              {state.machine_available ? 'Machine disponible (P1=1)' : 'Transaction en cours'}
            </span>
          </div>
        </div>

        {/* Message d'état dynamique */}
        <div className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 mb-3.5 ${statusStyle.bg}`}>
          <div className="mt-0.5 flex-shrink-0">{statusStyle.icon}</div>
          <span className="font-medium leading-relaxed">{state.status_message}</span>
        </div>

        {/* Grille des variables d'état */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Montant inséré */}
          <div className="bg-slate-950/70 border border-slate-800/80 p-2.5 rounded-lg">
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
              <Coins className="w-3.5 h-3.5 text-emerald-400" />
              Montant inséré
            </div>
            <div className="text-base font-bold font-mono text-emerald-400">
              {state.inserted_amount.toLocaleString()}{' '}
              <span className="text-[11px] font-normal text-slate-400">Ar</span>
            </div>
          </div>

          {/* Boisson sélectionnée */}
          <div className="bg-slate-950/70 border border-slate-800/80 p-2.5 rounded-lg">
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
              <ShoppingBag className="w-3.5 h-3.5 text-purple-400" />
              Sélection
            </div>
            <div className="text-sm font-semibold text-slate-100 truncate">
              {selectedDrinkObj ? selectedDrinkObj.name : <span className="text-slate-500 font-normal">Aucune</span>}
            </div>
          </div>

          {/* Prix de la boisson */}
          <div className="bg-slate-950/70 border border-slate-800/80 p-2.5 rounded-lg">
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
              <Tag className="w-3.5 h-3.5 text-blue-400" />
              Prix requis
            </div>
            <div className="text-base font-bold font-mono text-slate-200">
              {state.selected_price ? (
                <>
                  {state.selected_price.toLocaleString()}{' '}
                  <span className="text-[11px] font-normal text-slate-400">Ar</span>
                </>
              ) : (
                <span className="text-slate-500 text-xs font-normal">-</span>
              )}
            </div>
          </div>

          {/* Monnaie calculée */}
          <div className="bg-slate-950/70 border border-slate-800/80 p-2.5 rounded-lg">
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              Monnaie rendue
            </div>
            <div className="text-base font-bold font-mono text-amber-300">
              {state.change.toLocaleString()}{' '}
              <span className="text-[11px] font-normal text-slate-400">Ar</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pied de panneau : Transition active et dernière exécutée */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400">
          <RefreshCcw className="w-3.5 h-3.5 text-slate-500" />
          Dernière transition :{' '}
          <span className="font-mono font-semibold text-purple-400">
            {state.last_transition || 'Aucune (État initial M0)'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Activable(s) :</span>
          {state.enabled_transitions.length > 0 ? (
            <div className="flex gap-1">
              {state.enabled_transitions.map((tId) => (
                <span
                  key={tId}
                  className="px-1.5 py-0.5 rounded text-[11px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40"
                >
                  {tId}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-slate-500 text-xs">Aucune transition franchissable</span>
          )}
        </div>
      </div>
    </div>
  );
};
