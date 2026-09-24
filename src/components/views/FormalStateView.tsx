import React from 'react';
import { VendingState, Drink } from '../../types/vending';
import { Layers, ShieldCheck, Cpu } from 'lucide-react';

interface FormalStateViewProps {
  state: VendingState;
  drinks: Drink[];
}

const PLACES_METADATA = [
  { id: 'P1', name: 'Machine disponible', type: 'État', initial: 1, role: 'Conditionne le début de transaction' },
  { id: 'P2', name: 'Argent inséré', type: 'État', initial: 0, role: 'Crédit présent dans le monnayeur' },
  { id: 'P3', name: 'Montant suffisant', type: 'État', initial: 0, role: 'Garde monétaire validée' },
  { id: 'P4', name: 'Boisson sélectionnée', type: 'État', initial: 0, role: 'Choix de produit validé' },
  { id: 'P5', name: 'Stock Eau', type: 'Ressource', initial: 5, role: '1 jeton = 1 bouteille Eau' },
  { id: 'P6', name: 'Stock Soda', type: 'Ressource', initial: 5, role: '1 jeton = 1 canette Soda' },
  { id: 'P7', name: 'Stock Jus', type: 'Ressource', initial: 5, role: '1 jeton = 1 brique Jus' },
  { id: 'P8', name: 'Distribution en cours', type: 'Exécution', initial: 0, role: 'Actionneur physique en marche' },
  { id: 'P9', name: 'Boisson délivrée', type: 'Sortie', initial: 0, role: 'Boisson présente dans le bac' },
  { id: 'P10', name: 'Transaction terminée', type: 'Sortie', initial: 0, role: 'Monnaie restituée et fin de cycle' },
];

const TRANSITIONS_METADATA = [
  { id: 'T1', name: 'Insérer de l’argent', formula: 'P1 → T1 → P2', guard: 'amount > 0' },
  { id: 'T2', name: 'Vérifier le montant', formula: 'P2 → T2 → P3', guard: 'inserted_amount >= price(drink)' },
  { id: 'T3', name: 'Sélectionner une boisson', formula: 'P3 → T3 → P4', guard: 'drink != null' },
  { id: 'T4', name: 'Sélectionner l’eau', formula: 'P4 + P5 → T4 → P8', guard: 'tokens(P5) > 0' },
  { id: 'T5', name: 'Sélectionner le soda', formula: 'P4 + P6 → T5 → P8', guard: 'tokens(P6) > 0' },
  { id: 'T6', name: 'Sélectionner le jus', formula: 'P4 + P7 → T6 → P8', guard: 'tokens(P7) > 0' },
  { id: 'T7', name: 'Lancer la distribution', formula: 'P8 → T7 → P9', guard: 'Distribution amorcée' },
  { id: 'T8', name: 'Délivrer la boisson', formula: 'P9 → T8 → P10', guard: 'change = inserted - price' },
  { id: 'T9', name: 'Terminer la transaction', formula: 'P10 → T9 → P1', guard: 'Restitution monnaie & reset cycle' },
];

export const FormalStateView: React.FC<FormalStateViewProps> = ({ state }) => {
  const markingVector = PLACES_METADATA.map((p) => state.marking[p.id] ?? 0);

  return (
    <div className="h-full w-full p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar max-w-6xl mx-auto">
      {/* En-tête avec vecteur mathématique */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-600" />
            Vecteur de Marquage Formel M(t)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Équation d'état formelle : M(t+1) = M(t) - Pre · s + Post · s
          </p>
        </div>

        <div className="bg-teal-50 px-3 py-2 rounded-xl border border-teal-200 font-mono text-xs text-teal-900 font-black shadow-xs">
          M(t) = ({markingVector.join(', ')})
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        {/* TABLEAU DES 10 PLACES */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col">
          <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-teal-600" />
            Tableau des 10 Places Formelles
          </h3>

          <div className="space-y-1.5 overflow-y-auto custom-scrollbar flex-1 pr-1">
            {PLACES_METADATA.map((place) => {
              const currentTokens = state.marking[place.id] ?? 0;
              const hasTokens = currentTokens > 0;

              return (
                <div
                  key={place.id}
                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-colors ${
                    hasTokens
                      ? 'bg-teal-50/80 border-teal-400 text-teal-950 font-medium'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-black text-teal-700 w-8">{place.id}</span>
                    <div>
                      <div className="font-bold text-slate-800">{place.name}</div>
                      <div className="text-[10px] text-slate-400">{place.role}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 text-right">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                      {place.type}
                    </span>
                    <span
                      className={`font-mono font-bold text-xs px-2 py-0.5 rounded-md ${
                        hasTokens ? 'bg-teal-600 text-white shadow-xs' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {currentTokens}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TABLEAU DES 9 TRANSITIONS */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col">
          <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
            Tableau des 9 Transitions & Gardes
          </h3>

          <div className="space-y-1.5 overflow-y-auto custom-scrollbar flex-1 pr-1">
            {TRANSITIONS_METADATA.map((trans) => {
              const isEnabled = state.enabled_transitions.includes(trans.id);

              return (
                <div
                  key={trans.id}
                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-colors ${
                    isEnabled
                      ? 'bg-orange-50 border-orange-400 text-orange-950'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-black text-orange-600 w-8">{trans.id}</span>
                    <div>
                      <div className="font-bold text-slate-800">{trans.name}</div>
                      <div className="text-[10px] font-mono text-teal-700">{trans.formula}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        isEnabled
                          ? 'bg-orange-500 text-white shadow-xs animate-pulse'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isEnabled ? 'Franchissable ✓' : 'Non active'}
                    </span>
                    <div className="text-[9px] text-slate-400 font-mono mt-0.5">{trans.guard}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
