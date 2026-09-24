import React from 'react';
import { Drink, Marking } from '../../types/vending';
import { Package, Droplets, CupSoda, Citrus, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface StockTableViewProps {
  drinks: Drink[];
  marking: Marking;
}

export const StockTableView: React.FC<StockTableViewProps> = ({ drinks, marking }) => {
  const getDrinkIcon = (id: string) => {
    switch (id) {
      case 'water':
        return <Droplets className="w-7 h-7 text-cyan-500" />;
      case 'soda':
        return <CupSoda className="w-7 h-7 text-amber-500" />;
      case 'juice':
        return <Citrus className="w-7 h-7 text-orange-500" />;
      default:
        return <Package className="w-7 h-7 text-teal-500" />;
    }
  };

  return (
    <div className="h-full w-full p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar max-w-6xl mx-auto">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 flex-shrink-0">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-teal-600" />
            Gestion des Stocks & Ressources (Places P5, P6, P7)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Chaque jeton dans les places de ressources représente une unité physique de boisson prête à être délivrée.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-mono font-bold text-teal-800">
          Capacité initiale M0 : 5 par produit
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
        {drinks.map((drink) => {
          const currentTokens = marking[drink.place_id] ?? drink.stock;
          const initialStock = 5;
          const soldCount = initialStock - currentTokens;
          const pct = Math.max(0, Math.min(100, (currentTokens / initialStock) * 100));
          const isOut = currentTokens <= 0;

          return (
            <div
              key={drink.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 shadow-xs">
                    {getDrinkIcon(drink.id)}
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 font-mono text-xs font-bold">
                      Place {drink.place_id}
                    </span>
                    <div className="text-[11px] text-slate-400 font-mono mt-1">
                      Transition : {drink.transition_id}
                    </div>
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-slate-900">{drink.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{drink.description}</p>
                <div className="mt-2 font-mono text-teal-700 font-bold text-base">
                  {drink.price.toLocaleString()} Ar / unité
                </div>
              </div>

              {/* Jauge graphique */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-xs text-slate-500 font-medium">Niveau physique</span>
                  <span className="text-xl font-bold font-mono text-slate-900">
                    {currentTokens} <span className="text-xs text-slate-400 font-normal">/ {initialStock} jetons</span>
                  </span>
                </div>

                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200 p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      currentTokens > 2
                        ? 'bg-teal-500'
                        : currentTokens > 0
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span>Unités servies : {soldCount}</span>
                  <span className={isOut ? 'text-rose-600 font-bold' : 'text-teal-700 font-semibold'}>
                    {isOut ? 'Rupture de stock' : 'Stock suffisant'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
