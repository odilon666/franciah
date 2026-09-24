import React from 'react';
import { Banknote, Plus, AlertTriangle, ArrowRight } from 'lucide-react';

interface MoneyPanelProps {
  insertedAmount: number;
  canInsert: boolean;
  onInsert: (amount: number) => void;
  isLoading?: boolean;
}

export const MoneyPanel: React.FC<MoneyPanelProps> = ({
  insertedAmount,
  canInsert,
  onInsert,
  isLoading = false,
}) => {
  const denominations = [500, 1000, 2000];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Insertion d'argent</h3>
              <p className="text-[11px] text-slate-400">Devise : Ariary (Ar) · Transition T1</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Crédit inséré</span>
            <div className="text-2xl font-black font-mono text-emerald-400">
              {insertedAmount.toLocaleString()} <span className="text-xs font-normal text-slate-400">Ar</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3">
          {denominations.map((amount) => (
            <button
              key={amount}
              onClick={() => onInsert(amount)}
              disabled={!canInsert || isLoading}
              className="py-2.5 px-3 bg-slate-800/90 hover:bg-emerald-950/40 text-slate-100 hover:text-emerald-300 border border-slate-700/70 hover:border-emerald-600/60 rounded-lg text-xs font-semibold font-mono flex items-center justify-center gap-1 transition-all duration-150 shadow-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-800 disabled:hover:text-slate-100 disabled:hover:border-slate-700/70"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              {amount.toLocaleString()} Ar
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
        {!canInsert ? (
          <span className="flex items-center gap-1.5 text-amber-400/90">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            Insertion bloquée : machine en cours de traitement
          </span>
        ) : (
          <span className="flex items-center gap-1 text-slate-400">
            <ArrowRight className="w-3 h-3 text-emerald-400" />
            Place P1 ou P2 active : l'insertion déclenche T1
          </span>
        )}
      </div>
    </div>
  );
};
