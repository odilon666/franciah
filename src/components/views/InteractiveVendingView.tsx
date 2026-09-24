import React from 'react';
import { Drink, VendingState } from '../../types/vending';
import {
  Droplets,
  CupSoda,
  Citrus,
  Banknote,
  CheckCircle2,
  PackageCheck,
  Coins,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface InteractiveVendingViewProps {
  state: VendingState;
  drinks: Drink[];
  onSelectDrink: (drinkId: string) => void;
  onInsertMoney: (amount: number) => void;
  onFire: (transId: string) => void;
  onReset: () => void;
  isLoading?: boolean;
}

export const InteractiveVendingView: React.FC<InteractiveVendingViewProps> = ({
  state,
  drinks,
  onSelectDrink,
  onInsertMoney,
  onFire,
  onReset,
  isLoading = false,
}) => {
  const selectedDrinkObj = drinks.find((d) => d.id === state.selected_drink);
  const isEnabled = (transId: string) => state.enabled_transitions.includes(transId);

  const getDrinkIcon = (id: string) => {
    switch (id) {
      case 'water':
        return <Droplets className="w-12 h-12 text-cyan-500" />;
      case 'soda':
        return <CupSoda className="w-12 h-12 text-amber-500" />;
      case 'juice':
        return <Citrus className="w-12 h-12 text-orange-500" />;
      default:
        return <Sparkles className="w-12 h-12 text-teal-500" />;
    }
  };

  const getDrinkIllustrationBg = (id: string) => {
    switch (id) {
      case 'water':
        return 'bg-cyan-50 border-cyan-200 group-hover:border-cyan-300';
      case 'soda':
        return 'bg-amber-50 border-amber-200 group-hover:border-amber-300';
      case 'juice':
        return 'bg-orange-50 border-orange-200 group-hover:border-orange-300';
      default:
        return 'bg-teal-50 border-teal-200';
    }
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-between p-2 sm:p-3 overflow-hidden select-none max-w-6xl mx-auto">
      {/* 1. CARTOUCHE SUPÉRIEURE DE LA BORNE TACTILE */}
      <div className="w-full bg-white rounded-xl border border-slate-200/90 shadow-xs px-4 py-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white text-lg shadow-sm">
            🥤
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black tracking-tight text-slate-900">
                SMART DRINK KIOSK
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                BORNE 24/7
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Distribution automatique pilotée par Réseau de Petri
            </p>
          </div>
        </div>

        {/* Badge d'état de la machine */}
        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1 rounded-lg border font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs ${
              state.machine_available
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                state.machine_available ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
              }`}
            />
            <span>{state.machine_available ? 'État : DISPONIBLE' : 'État : EN COURS'}</span>
          </div>

          <button
            onClick={onReset}
            disabled={isLoading}
            className="text-xs text-slate-500 hover:text-rose-600 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-rose-200 hover:bg-rose-50 transition-all font-medium"
            title="Réinitialiser au marquage initial M0"
          >
            Reset M0
          </button>
        </div>
      </div>

      {/* 2. ZONE CENTRALE : LES 3 GRANDES CARTES DE BOISSONS */}
      <div className="w-full flex-1 min-h-0 flex flex-col justify-center my-2">
        <div className="text-center mb-2 flex-shrink-0">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            CHOISISSEZ VOTRE BOISSON
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 h-full max-h-[310px]">
          {drinks.map((drink) => {
            const isSelected = state.selected_drink === drink.id;
            const isOut = drink.stock <= 0;

            return (
              <div
                key={drink.id}
                onClick={() => !isOut && !isLoading && onSelectDrink(drink.id)}
                className={`bg-white rounded-2xl border-2 p-3.5 sm:p-4 flex flex-col justify-between transition-all duration-200 cursor-pointer group shadow-sm hover:shadow-md ${
                  isSelected
                    ? 'border-teal-500 ring-2 ring-teal-400/40 bg-teal-50/20 shadow-teal-500/10'
                    : isOut
                    ? 'border-slate-200 bg-slate-50/60 opacity-50 cursor-not-allowed'
                    : 'border-slate-200/90 hover:border-teal-400 hover:bg-slate-50/50'
                }`}
              >
                {/* En-tête de carte : Nom & Place formelle */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Place {drink.place_id}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isOut
                        ? 'bg-rose-100 text-rose-700'
                        : drink.stock <= 2
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isOut ? 'Épuisé' : `Stock : ${drink.stock}/5`}
                  </span>
                </div>

                {/* Grande Illustration visuelle de la boisson */}
                <div className="flex flex-col items-center justify-center my-1.5 sm:my-2">
                  <div
                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 duration-200 ${getDrinkIllustrationBg(
                      drink.id
                    )}`}
                  >
                    {getDrinkIcon(drink.id)}
                  </div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 mt-2">
                    {drink.name}
                  </h3>
                  <div className="text-base sm:text-lg font-mono font-black text-teal-600">
                    {drink.price.toLocaleString()} Ar
                  </div>
                </div>

                {/* Bouton tactile de sélection */}
                <button
                  type="button"
                  disabled={isOut || isLoading}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isOut && !isLoading) onSelectDrink(drink.id);
                  }}
                  className={`w-full py-2 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-150 flex items-center justify-center gap-1.5 shadow-xs ${
                    isSelected
                      ? 'bg-teal-600 hover:bg-teal-700 text-white ring-2 ring-teal-500/30'
                      : isOut
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-100 hover:bg-teal-600 hover:text-white text-slate-700 group-hover:border-teal-400'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>SÉLECTIONNÉ ✓</span>
                    </>
                  ) : isOut ? (
                    'INDISPONIBLE'
                  ) : (
                    'CHOISIR'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. PANNEAU DE CONTRÔLE TACTILE & MONNAYEUR (Partie inférieure) */}
      <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-sm p-3 sm:p-4 flex flex-col gap-3 flex-shrink-0">
        {/* ÉCRAN TACTILE : 4 CADRANS D'INFORMATION */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Cadrant 1 : Argent Inséré */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Argent Inséré
            </span>
            <div className="text-lg sm:text-xl font-mono font-black text-teal-700 mt-1">
              {state.inserted_amount.toLocaleString()} Ar
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Place P2</span>
          </div>

          {/* Cadrant 2 : Boisson Sélectionnée */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Boisson
            </span>
            <div className="text-sm sm:text-base font-bold text-slate-900 mt-1 truncate">
              {selectedDrinkObj ? selectedDrinkObj.name : '—'}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Place P4</span>
          </div>

          {/* Cadrant 3 : Prix à payer */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Prix
            </span>
            <div className="text-lg sm:text-xl font-mono font-bold text-slate-700 mt-1">
              {state.selected_price ? `${state.selected_price.toLocaleString()} Ar` : '—'}
            </div>
            <span className="text-[10px] text-slate-400">Tarif catalogue</span>
          </div>

          {/* Cadrant 4 : Monnaie à rendre */}
          <div
            className={`border rounded-xl p-2.5 flex flex-col justify-between ${
              state.change > 0
                ? 'bg-orange-50 border-orange-200 text-orange-900'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Monnaie Rendue
            </span>
            <div className="text-lg sm:text-xl font-mono font-black text-orange-600 mt-1">
              {state.change.toLocaleString()} Ar
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Place P10</span>
          </div>
        </div>

        {/* LIGNE D'INSERTION MONÉTAIRE & BOUTONS D'ACTIONS TACTILES */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3 pt-1 border-t border-slate-100">
          {/* Fente Monnayeur tactile */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5 flex-shrink-0">
              <Banknote className="w-4 h-4 text-teal-600" />
              Insérer :
            </span>
            <div className="flex items-center gap-1.5 flex-1 sm:flex-none">
              {[500, 1000, 2000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => onInsertMoney(amt)}
                  disabled={isLoading}
                  className="flex-1 sm:flex-none py-1.5 px-3 rounded-lg bg-teal-50 hover:bg-teal-600 text-teal-800 hover:text-white border border-teal-200 hover:border-teal-600 font-mono font-bold text-xs transition-all active:scale-95 shadow-xs"
                >
                  +{amt} Ar
                </button>
              ))}
            </div>
          </div>

          {/* Séquence d'actions du Réseau de Petri */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
            {/* Action T2 : Vérifier le montant */}
            <button
              type="button"
              onClick={() => onFire('T2')}
              disabled={!isEnabled('T2') || isLoading}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                isEnabled('T2')
                  ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20 animate-pulse'
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Vérifier Montant (T2)</span>
            </button>

            {/* Action T3 : Valider Sélection */}
            {isEnabled('T3') && (
              <button
                type="button"
                onClick={() => onFire('T3')}
                disabled={isLoading}
                className="py-2 px-3.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs animate-pulse flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Valider Choix (T3)</span>
              </button>
            )}

            {/* Action T4/T5/T6 : Prise de ressource en stock */}
            {(isEnabled('T4') || isEnabled('T5') || isEnabled('T6')) && (
              <button
                type="button"
                onClick={() => {
                  if (isEnabled('T4')) onFire('T4');
                  else if (isEnabled('T5')) onFire('T5');
                  else if (isEnabled('T6')) onFire('T6');
                }}
                disabled={isLoading}
                className="py-2 px-3.5 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-xs animate-pulse flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Préparer Boisson ({isEnabled('T4') ? 'T4' : isEnabled('T5') ? 'T5' : 'T6'})</span>
              </button>
            )}

            {/* Action T7 : Lancer la distribution (GRAND BOUTON ORANGE) */}
            <button
              type="button"
              onClick={() => onFire('T7')}
              disabled={!isEnabled('T7') || isLoading}
              className={`py-2 px-5 rounded-xl text-xs sm:text-sm font-extrabold transition-all shadow-sm flex items-center gap-2 ${
                isEnabled('T7')
                  ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/30 animate-pulse scale-102 ring-2 ring-orange-400/50'
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
              }`}
            >
              <PackageCheck className="w-4 h-4" />
              <span>DISTRIBUER (T7)</span>
            </button>

            {/* Action T8 : Prendre la boisson délivrée */}
            {state.marking.P9 > 0 && (
              <button
                type="button"
                onClick={() => onFire('T8')}
                disabled={isLoading}
                className="py-2 px-4 rounded-xl text-xs sm:text-sm font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 animate-bounce flex items-center gap-2"
              >
                <span>🎁 PRENDRE LA BOISSON (T8)</span>
              </button>
            )}

            {/* Action T9 : Terminer la transaction et récupérer la monnaie */}
            <button
              type="button"
              onClick={() => onFire('T9')}
              disabled={!isEnabled('T9') || isLoading}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                isEnabled('T9')
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 animate-pulse'
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Terminer & Monnaie (T9)</span>
            </button>
          </div>
        </div>

        {/* 4. BAC DE RÉCUPÉRATION PHYSIQUE EN BAS (Place P9) */}
        <div
          className={`w-full rounded-xl border p-2.5 flex items-center justify-between transition-colors ${
            state.marking.P9 > 0
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400/30'
              : state.marking.P8 > 0
              ? 'bg-orange-50 border-orange-300'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                state.marking.P9 > 0
                  ? 'bg-emerald-600 text-white'
                  : state.marking.P8 > 0
                  ? 'bg-orange-500 text-white animate-spin'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              <PackageCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>Bac de Récupération (Place P9)</span>
                {state.marking.P9 > 0 && (
                  <span className="text-[10px] font-bold bg-emerald-200 text-emerald-800 px-1.5 py-0.2 rounded">
                    Boisson Disponible !
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                {state.marking.P9 > 0
                  ? 'Votre boisson fraîche est dans le bac. Cliquez sur "PRENDRE LA BOISSON" pour finaliser le cycle.'
                  : state.marking.P8 > 0
                  ? 'Délivrance mécanique en cours...'
                  : 'Le bac est vide. Prêt pour la commande.'}
              </p>
            </div>
          </div>

          {state.marking.P9 > 0 && (
            <button
              type="button"
              onClick={() => onFire('T8')}
              className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-extrabold shadow-sm flex items-center gap-1"
            >
              Prendre (T8)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
