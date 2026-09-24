import React from 'react';
import { Package, Droplets, CupSoda, Citrus } from 'lucide-react';
import { Drink } from '../types/vending';

interface StockPanelProps {
  drinks: Drink[];
  marking: Record<string, number>;
}

export const StockPanel: React.FC<StockPanelProps> = ({ drinks, marking }) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Stocks des Ressources</h3>
            <p className="text-[11px] text-slate-400">Places P5, P6, P7 du Réseau de Petri</p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-slate-400">Capacité max : 5</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {drinks.map((drink) => {
          const tokens = marking[drink.place_id] ?? drink.stock;
          const maxTokens = 5;
          const percentage = Math.min(100, Math.max(0, (tokens / maxTokens) * 100));

          return (
            <div
              key={drink.id}
              className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-200 truncate flex items-center gap-1.5">
                  {drink.id === 'water' && <Droplets className="w-3.5 h-3.5 text-cyan-400" />}
                  {drink.id === 'soda' && <CupSoda className="w-3.5 h-3.5 text-amber-400" />}
                  {drink.id === 'juice' && <Citrus className="w-3.5 h-3.5 text-orange-400" />}
                  {drink.name}
                </span>
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-purple-300">
                  {drink.place_id}
                </span>
              </div>

              <div>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-lg font-bold font-mono text-slate-100">{tokens}</span>
                  <span className="text-[11px] text-slate-400 font-mono">/ 5 jetons</span>
                </div>

                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      tokens > 2 ? 'bg-emerald-500' : tokens > 0 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
