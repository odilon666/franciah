import React from 'react';
import { History, Clock, CornerDownRight, CheckCircle2, Coins } from 'lucide-react';
import { HistoryItem } from '../types/vending';

interface HistoryPanelProps {
  history: HistoryItem[];
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history }) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-teal-50 text-teal-700 rounded-xl border border-teal-200">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Journal d'Audit des Franchissements</h3>
            <p className="text-[11px] text-slate-500">Traçabilité complète des transitions franchies</p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-teal-800 font-bold px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200">
          {history.length} transition(s)
        </span>
      </div>

      <div className="overflow-y-auto pr-1 space-y-2 flex-grow custom-scrollbar">
        {history.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-xs text-center px-4">
            <Clock className="w-8 h-8 text-slate-300 mb-2 stroke-[1.5]" />
            <p className="font-semibold text-slate-700">Aucun franchissement enregistré</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Insérez de l'argent ou sélectionnez une boisson pour débuter le cycle.
            </p>
          </div>
        ) : (
          history
            .slice()
            .reverse()
            .map((item) => (
              <div
                key={item.id}
                className="bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-teal-300 rounded-xl p-3 transition-all shadow-xs"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-400 font-bold">#{item.id}</span>
                    <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 text-xs font-mono font-black border border-orange-200">
                      {item.transition_id}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{item.transition_name}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {item.timestamp}
                  </span>
                </div>

                <div className="flex items-start gap-1.5 text-xs text-slate-700 pl-3 mt-1 border-l-2 border-teal-500">
                  <CornerDownRight className="w-3.5 h-3.5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span className="leading-snug">{item.action_description}</span>
                </div>

                {/* Résumé du marquage après franchissement */}
                <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-mono text-slate-600">
                  <div className="flex gap-1.5 overflow-x-auto items-center">
                    <span className="text-slate-400 text-[9px] font-sans">Jetons actifs :</span>
                    {Object.entries(item.marking_after)
                      .filter(([_, count]) => count > 0)
                      .map(([pId, count]) => (
                        <span key={pId} className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-teal-800 font-bold">
                          {pId}={count}
                        </span>
                      ))}
                  </div>
                  {item.inserted_amount > 0 && (
                    <span className="text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      Crédit : {item.inserted_amount} Ar
                    </span>
                  )}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};
