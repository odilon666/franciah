import React from 'react';
import { VendingState, Drink } from '../../types/vending';
import {
  CheckCircle2,
  ArrowDown,
  Coins,
  ShieldCheck,
  Package,
  PackageCheck,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Play,
} from 'lucide-react';

interface SimulationStepViewProps {
  state: VendingState;
  drinks: Drink[];
  onFire: (transId: string) => void;
  onReset: () => void;
  onInsertMoney: (amount: number) => void;
  onSelectDrink: (drinkId: string) => void;
  isLoading?: boolean;
}

export const SimulationStepView: React.FC<SimulationStepViewProps> = ({
  state,
  drinks,
  onFire,
  onReset,
  onInsertMoney,
  onSelectDrink,
  isLoading = false,
}) => {
  const isEnabled = (transId: string) => state.enabled_transitions.includes(transId);
  const selectedDrinkObj = drinks.find((d) => d.id === state.selected_drink);

  // Étapes formelles ordonnées de la simulation du distributeur
  const steps = [
    {
      stepNumber: 1,
      placeId: 'P1',
      title: 'Machine disponible',
      description: 'La borne est libre et prête pour une nouvelle commande.',
      tokens: state.marking.P1,
      isActive: state.marking.P1 > 0,
      actionTransition: 'T1',
      actionLabel: 'Insérer 1 000 Ar (T1)',
      canAct: isEnabled('T1'),
      onAct: () => onInsertMoney(1000),
    },
    {
      stepNumber: 2,
      placeId: 'P2',
      title: 'Argent inséré',
      description: `Crédit monnayeur : ${state.inserted_amount} Ar. En attente de validation.`,
      tokens: state.marking.P2,
      isActive: state.marking.P2 > 0,
      actionTransition: 'T2',
      actionLabel: 'Vérifier le montant (T2)',
      canAct: isEnabled('T2'),
      onAct: () => onFire('T2'),
    },
    {
      stepNumber: 3,
      placeId: 'P3',
      title: 'Montant vérifié',
      description: 'Le crédit inséré est supérieur ou égal au prix de la boisson.',
      tokens: state.marking.P3,
      isActive: state.marking.P3 > 0,
      actionTransition: 'T3',
      actionLabel: 'Sélectionner une boisson (T3)',
      canAct: isEnabled('T3'),
      onAct: () => onFire('T3'),
    },
    {
      stepNumber: 4,
      placeId: 'P4',
      title: 'Boisson sélectionnée',
      description: selectedDrinkObj
        ? `${selectedDrinkObj.name} (${selectedDrinkObj.price} Ar) validé.`
        : 'Choix de produit validé.',
      tokens: state.marking.P4,
      isActive: state.marking.P4 > 0,
      actionTransition: selectedDrinkObj?.transition_id || 'T4',
      actionLabel: `Allouer ressource (${selectedDrinkObj?.transition_id || 'T4-T6'})`,
      canAct: isEnabled('T4') || isEnabled('T5') || isEnabled('T6'),
      onAct: () => {
        if (isEnabled('T4')) onFire('T4');
        else if (isEnabled('T5')) onFire('T5');
        else if (isEnabled('T6')) onFire('T6');
      },
    },
    {
      stepNumber: 5,
      placeId: 'P8',
      title: 'Distribution',
      description: 'Actionneur physique enclenché, préparation du flacon.',
      tokens: state.marking.P8,
      isActive: state.marking.P8 > 0,
      actionTransition: 'T7',
      actionLabel: 'Lancer la distribution (T7)',
      canAct: isEnabled('T7'),
      onAct: () => onFire('T7'),
    },
    {
      stepNumber: 6,
      placeId: 'P9',
      title: 'Boisson délivrée',
      description: 'Boisson prête et disponible dans le bac de récupération.',
      tokens: state.marking.P9,
      isActive: state.marking.P9 > 0,
      actionTransition: 'T8',
      actionLabel: 'Prendre la boisson (T8)',
      canAct: isEnabled('T8'),
      onAct: () => onFire('T8'),
    },
    {
      stepNumber: 7,
      placeId: 'P10',
      title: 'Transaction terminée',
      description: `Monnaie restituée (${state.change} Ar) et réinitialisation du cycle.`,
      tokens: state.marking.P10,
      isActive: state.marking.P10 > 0,
      actionTransition: 'T9',
      actionLabel: 'Terminer & Restituer monnaie (T9)',
      canAct: isEnabled('T9'),
      onAct: () => onFire('T9'),
    },
  ];

  return (
    <div className="h-full w-full max-w-5xl mx-auto flex flex-col gap-3 p-3 overflow-y-auto custom-scrollbar">
      {/* En-tête de la vue Simulation */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs flex items-center justify-between flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900">
              Simulation Formelle du Cycle de Vente
            </h2>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              Graphe Séquentiel
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Suivi des jetons et déclenchement direct des transitions autorisées.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 text-teal-700 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500" /> Étape active
            </span>
            <span className="flex items-center gap-1 text-orange-600 font-semibold">
              <span className="w-2.5 h-2.5 rounded-md bg-orange-500" /> Action disponible
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Inactive
            </span>
          </div>

          <button
            onClick={onReset}
            disabled={isLoading}
            className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 transition-all shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset M0</span>
          </button>
        </div>
      </div>

      {/* Séquence des 7 étapes avec flèches */}
      <div className="space-y-2 flex-1 pb-2">
        {steps.map((step, idx) => (
          <React.Fragment key={step.placeId}>
            <div
              className={`rounded-xl border p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                step.isActive
                  ? 'bg-teal-50/70 border-teal-500 ring-2 ring-teal-400/30 shadow-xs'
                  : 'bg-white border-slate-200 opacity-85 hover:opacity-100'
              }`}
            >
              {/* Gauche : Numéro & Place & Nom */}
              <div className="flex items-start sm:items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0 ${
                    step.isActive
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {step.stepNumber}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-extrabold ${
                        step.isActive ? 'text-teal-900' : 'text-slate-700'
                      }`}
                    >
                      {step.title}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                        step.isActive
                          ? 'bg-teal-200/80 text-teal-900'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      Place {step.placeId}
                    </span>
                    {step.isActive && (
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-1.5 py-0.2 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-ping" />
                        Actif (1 jeton)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{step.description}</p>
                </div>
              </div>

              {/* Droite : Bouton d'action ou statut */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                {step.canAct ? (
                  <button
                    onClick={step.onAct}
                    disabled={isLoading}
                    className="py-1.5 px-3.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs shadow-xs hover:shadow-orange-500/20 active:scale-95 transition-all flex items-center gap-1.5 animate-pulse"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>{step.actionLabel}</span>
                  </button>
                ) : (
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                    Trans. {step.actionTransition}
                  </span>
                )}
              </div>
            </div>

            {/* Flèche vers l'étape suivante */}
            {idx < steps.length - 1 && (
              <div className="flex justify-center -my-0.5">
                <ArrowDown className="w-4 h-4 text-teal-600/50" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
