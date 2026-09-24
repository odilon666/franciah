import React from 'react';
import { Drink, VendingState } from '../types/vending';
import { Droplets, CupSoda, Citrus, Banknote, CheckCircle2 } from 'lucide-react';

interface DrinksAndMoneyColumnProps {
  drinks: Drink[];
  state: VendingState;
  onSelectDrink: (drinkId: string) => void;
  onInsertMoney: (amount: number) => void;
  isLoading?: boolean;
}

export const DrinksAndMoneyColumn: React.FC<DrinksAndMoneyColumnProps> = ({
  drinks,
  state,
  onSelectDrink,
  onInsertMoney,
  isLoading = false,
}) => {
  const canInsertMoney = state.marking.P1 >= 1 || state.marking.P2 >= 1;
  const canSelectDrinks =
    state.marking.P1 >= 1 ||
    state.marking.P2 >= 1 ||
    state.marking.P3 >= 1 ||
    state.marking.P4 >= 1;

  const getDrinkIcon = (id: string) => {
    switch (id) {
      case 'water':
        return <Droplets className="w-4 h-4 text-cyan-500" />;
      case 'soda':
        return <CupSoda className="w-4 h-4 text-amber-500" />;
      case 'juice':
        return <Citrus className="w-4 h-4 text-orange-500" />;
      default:
        return <CupSoda className="w-4 h-4 text-teal-500" />;
    }
  };

  return (
    <div className="h-full flex flex-col justify-between gap-2.5 overflow-hidden">
      {/* SECTION 1 : BOISSONS (3 CARTES) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-xs flex flex-col gap-2 flex-1 min-h-0 overflow-hidden">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="p-1 rounded-lg bg-teal-50 text-teal-700">
              <CupSoda className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">Boissons</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">3 choix</span>
        </div>

        {/* Liste des 3 boissons */}
        <div className="flex-1 min-h-0 flex flex-col justify-between gap-2 overflow-y-auto custom-scrollbar pr-0.5">
          {drinks.map((drink) => {
            const isSelected = state.selected_drink === drink.id;
            const isOutOfStock = drink.stock <= 0;

            return (
              <div
                key={drink.id}
                className={`p-2.5 rounded-xl border transition-all duration-150 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-teal-50/70 border-teal-500 ring-2 ring-teal-400/30 shadow-xs'
                    : isOutOfStock
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : 'bg-white border-slate-200/90 hover:border-teal-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                      {getDrinkIcon(drink.id)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">{drink.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {drink.place_id} · {drink.transition_id}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-extrabold font-mono text-teal-700">
                      {drink.price.toLocaleString()} <span className="text-[10px] font-normal text-slate-500">Ar</span>
                    </div>
                    <div className="text-[10px] font-mono mt-0.5">
                      <span className="text-slate-400">Stock: </span>
                      <span
                        className={`font-bold ${
                          isOutOfStock ? 'text-rose-600' : drink.stock <= 2 ? 'text-amber-600' : 'text-slate-700'
                        }`}
                      >
                        {drink.stock}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 italic">
                    {drink.description}
                  </span>
                  <button
                    onClick={() => onSelectDrink(drink.id)}
                    disabled={isOutOfStock || isLoading || !canSelectDrinks}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all shadow-xs ${
                      isSelected
                        ? 'bg-teal-600 text-white'
                        : isOutOfStock
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-teal-50 hover:bg-teal-600 text-teal-800 hover:text-white border border-teal-200 hover:border-teal-600'
                    }`}
                  >
                    {isSelected ? 'Sélectionné ✓' : isOutOfStock ? 'Épuisé' : 'Choisir'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2 : INSERTION D'ARGENT (T1) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-xs flex-shrink-0">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 mb-2">
          <div className="flex items-center gap-1.5">
            <div className="p-1 rounded-lg bg-teal-50 text-teal-700">
              <Banknote className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">Monnayeur (T1)</span>
          </div>
          <span className="text-[10px] font-mono text-teal-700 font-bold bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
            {state.inserted_amount} Ar
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {[500, 1000, 2000].map((amount) => (
            <button
              key={amount}
              onClick={() => onInsertMoney(amount)}
              disabled={isLoading || !canInsertMoney}
              className={`py-2 px-1 rounded-xl text-center border font-mono font-bold text-xs transition-all shadow-xs ${
                canInsertMoney
                  ? 'bg-teal-50 hover:bg-teal-600 text-teal-800 hover:text-white border-teal-200 hover:border-teal-600 active:scale-95'
                  : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              +{amount}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
