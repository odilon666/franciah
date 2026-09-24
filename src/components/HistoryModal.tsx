import React from 'react';
import { X, History, Clock, CornerDownRight } from 'lucide-react';
import { HistoryItem } from '../types/vending';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, history }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl max-w-2xl w-full p-5 text-slate-800 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Journal des Franchissements</h3>
              <p className="text-[11px] text-slate-500">
                {history.length} transition(s) franchie(s) durant la session
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Liste */}
        <div className="overflow-y-auto pr-1 py-3 space-y-2 flex-1 custom-scrollbar">
          {history.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs">
              <Clock className="w-8 h-8 text-slate-300 mb-2 stroke-[1.5]" />
              <p className="font-semibold text-slate-700">Aucun franchissement enregistré</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Insérez de l'argent ou effectuez une commande pour démarrer.
              </p>
            </div>
          ) : (
            history
              .slice()
              .reverse()
              .map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3 hover:border-teal-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-slate-400 font-bold">#{item.id}</span>
                      <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-800 text-xs font-mono font-black border border-orange-200">
                        {item.transition_id}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{item.transition_name}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {item.timestamp}
                    </span>
                  </div>

                  <div className="flex items-start gap-2 text-xs text-slate-700 pl-3 mt-1 border-l-2 border-teal-500">
                    <CornerDownRight className="w-3.5 h-3.5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span>{item.action_description}</span>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-600">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-slate-400 text-[10px]">Marquage :</span>
                      {Object.entries(item.marking_after)
                        .filter(([_, count]) => count > 0)
                        .map(([pId, count]) => (
                          <span key={pId} className="px-1.5 py-0.2 rounded bg-white border border-slate-200 text-teal-800 font-bold">
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

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors shadow-xs"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
