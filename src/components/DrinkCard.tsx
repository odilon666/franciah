import React from 'react';
import { Droplets, CupSoda, Citrus, CheckCircle2, AlertCircle } from 'lucide-react';
import { Drink } from '../types/vending';

interface DrinkCardProps {
  drink: Drink;
  isSelected: boolean;
  canSelect: boolean;
  onSelect: (drinkId: string) => void;
  isLoading?: boolean;
}

export const DrinkCard: React.FC<DrinkCardProps> = ({
  drink,
  isSelected,
  canSelect,
  onSelect,
  isLoading = false,
}) => {
  const getIcon = () => {
    switch (drink.id) {
      case 'water':
        return <Droplets className="w-8 h-8 text-cyan-400" />;
      case 'soda':
        return <CupSoda className="w-8 h-8 text-amber-400" />;
      case 'juice':
        return <Citrus className="w-8 h-8 text-orange-400" />;
      default:
        return <CupSoda className="w-8 h-8 text-purple-400" />;
    }
  };

  const isOutOfStock = drink.stock <= 0;

  return (
    <div
      className={`relative rounded-xl border p-4 transition-all duration-200 flex flex-col justify-between ${
        isSelected
          ? 'bg-purple-950/40 border-purple-500 shadow-lg shadow-purple-500/20 ring-1 ring-purple-400'
          : isOutOfStock
          ? 'bg-slate-900/40 border-slate-800 opacity-60'
          : 'bg-slate-900/80 border-slate-700/80 hover:border-slate-600'
      }`}
    >
      {isSelected && (
        <div className="absolute -top-2.5 right-3 bg-purple-600 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
          <CheckCircle2 className="w-3 h-3" />
          Sélectionné
        </div>
      )}

      <div>
        <div className="flex items-start justify-between mb-3">
          <div className="p-2.5 bg-slate-800/90 rounded-lg border border-slate-700/60 shadow-inner">
            {getIcon()}
          </div>
          <div className="text-right">
            <span className="text-xl font-bold text-slate-100 tracking-tight">
              {drink.price.toLocaleString()} <span className="text-sm font-medium text-purple-400">Ar</span>
            </span>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              Place {drink.place_id} · {drink.transition_id}
            </div>
          </div>
        </div>

        <h3 className="text-base font-semibold text-white tracking-wide">{drink.name}</h3>
        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed line-clamp-1">{drink.description}</p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              drink.stock > 2 ? 'bg-emerald-400' : drink.stock > 0 ? 'bg-amber-400 animate-pulse' : 'bg-rose-500'
            }`}
          />
          <span className="text-xs text-slate-300 font-medium">
            Stock: <span className={`font-mono font-bold ${isOutOfStock ? 'text-rose-400' : 'text-emerald-400'}`}>{drink.stock}</span>
          </span>
        </div>

        <button
          onClick={() => onSelect(drink.id)}
          disabled={!canSelect || isOutOfStock || isLoading}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 ${
            isOutOfStock
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800'
              : isSelected
              ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30'
              : 'bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 border border-purple-700/50 hover:border-purple-600'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isOutOfStock ? (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              Épuisé
            </>
          ) : isSelected ? (
            'Sélectionné'
          ) : (
            'Sélectionner'
          )}
        </button>
      </div>
    </div>
  );
};
