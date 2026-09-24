import React, { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { Marking } from '../types/vending';

interface MarkingModalProps {
  isOpen: boolean;
  onClose: () => void;
  marking: Marking;
}

const PLACE_NAMES: Record<string, { label: string; cat: string }> = {
  P1: { label: 'Machine disponible', cat: 'État' },
  P2: { label: 'Argent inséré', cat: 'État' },
  P3: { label: 'Montant suffisant', cat: 'État' },
  P4: { label: 'Boisson sélectionnée', cat: 'État' },
  P5: { label: 'Stock Eau', cat: 'Ressource' },
  P6: { label: 'Stock Soda', cat: 'Ressource' },
  P7: { label: 'Stock Jus', cat: 'Ressource' },
  P8: { label: 'Distribution en cours', cat: 'Exécution' },
  P9: { label: 'Boisson délivrée', cat: 'Sortie' },
  P10: { label: 'Transaction terminée', cat: 'Sortie' },
};

export const MarkingModal: React.FC<MarkingModalProps> = ({ isOpen, onClose, marking }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const places = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10'];
  const vectorStr = `M = (${places.map((p) => marking[p] ?? 0).join(', ')})`;

  const handleCopy = () => {
    navigator.clipboard.writeText(vectorStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl max-w-md w-full p-5 text-slate-800 flex flex-col gap-4">
        {/* En-tête */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
              Vecteur de Marquage M(t)
            </h3>
            <p className="text-[11px] text-slate-500">Distribution actuelle des jetons dans les 10 places</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Représentation vectorielle mathématique */}
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 flex items-center justify-between">
          <div className="font-mono text-xs text-teal-900 font-extrabold">{vectorStr}</div>
          <button
            onClick={handleCopy}
            className="px-2.5 py-1 bg-white hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1 transition-colors shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copié' : 'Copier'}
          </button>
        </div>

        {/* Tableau formel P1..P10 */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {places.map((pId) => {
            const tokens = marking[pId] ?? 0;
            const info = PLACE_NAMES[pId];
            const hasTokens = tokens > 0;

            return (
              <div
                key={pId}
                className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                  hasTokens
                    ? 'bg-teal-50 border-teal-400 text-teal-950 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-teal-700 text-xs">{pId}</span>
                    <span className="text-[10px] text-slate-500 truncate max-w-[100px]">{info?.label}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className={`font-mono font-bold text-xs px-2 py-0.5 rounded-md ${
                      hasTokens
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {tokens}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bouton de fermeture */}
        <div className="pt-2 border-t border-slate-100 flex justify-end">
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
