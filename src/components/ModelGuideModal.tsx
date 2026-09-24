import React from 'react';
import { X, BookOpen, Layers } from 'lucide-react';

interface ModelGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModelGuideModal: React.FC<ModelGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl max-w-2xl w-full p-5 text-slate-800 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Modèle Formel du Réseau de Petri</h3>
              <p className="text-[11px] text-slate-500">Distributeur Automatique · Modélisation Académique</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corps */}
        <div className="overflow-y-auto pr-1 py-3 space-y-4 custom-scrollbar flex-1 text-xs">
          {/* Marquage initial */}
          <div className="bg-teal-50/60 p-3.5 rounded-xl border border-teal-200">
            <h4 className="font-extrabold text-teal-900 mb-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-teal-700" />
              Marquage Initial M0
            </h4>
            <p className="font-mono text-teal-800 bg-white p-2 rounded-lg border border-teal-200 text-xs font-bold">
              M0 = (1, 0, 0, 0, 5, 5, 5, 0, 0, 0)
            </p>
            <p className="text-slate-600 mt-2 text-[11px] leading-relaxed">
              La machine est disponible (<span className="text-teal-700 font-bold font-mono">P1=1</span>). Les stocks physiques
              sont alimentés à pleine capacité avec 5 unités d'eau (<span className="text-teal-700 font-bold font-mono">P5=5</span>),
              5 sodas (<span className="text-teal-700 font-bold font-mono">P6=5</span>) et 5 jus (
              <span className="text-teal-700 font-bold font-mono">P7=5</span>).
            </p>
          </div>

          {/* Grille Places et Transitions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Places */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-800 mb-2">Les 10 Places (P1 à P10)</h4>
              <ul className="space-y-1 text-slate-600 text-[11px] font-mono">
                <li>• <strong className="text-teal-700">P1</strong> : Machine disponible (1 jeton)</li>
                <li>• <strong className="text-teal-700">P2</strong> : Argent inséré</li>
                <li>• <strong className="text-teal-700">P3</strong> : Montant suffisant</li>
                <li>• <strong className="text-teal-700">P4</strong> : Boisson sélectionnée</li>
                <li>• <strong className="text-teal-700">P5</strong> : Stock Eau (5 jetons)</li>
                <li>• <strong className="text-teal-700">P6</strong> : Stock Soda (5 jetons)</li>
                <li>• <strong className="text-teal-700">P7</strong> : Stock Jus (5 jetons)</li>
                <li>• <strong className="text-teal-700">P8</strong> : Distribution en cours</li>
                <li>• <strong className="text-teal-700">P9</strong> : Boisson délivrée</li>
                <li>• <strong className="text-teal-700">P10</strong> : Transaction terminée</li>
              </ul>
            </div>

            {/* Transitions */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-800 mb-2">Les 9 Transitions (T1 à T9)</h4>
              <ul className="space-y-1 text-slate-600 text-[11px]">
                <li>• <strong className="text-orange-600 font-mono">T1</strong> : Insérer argent (P1 → P2)</li>
                <li>• <strong className="text-orange-600 font-mono">T2</strong> : Vérifier montant (P2 → P3)</li>
                <li>• <strong className="text-orange-600 font-mono">T3</strong> : Sélectionner boisson (P3 → P4)</li>
                <li>• <strong className="text-orange-600 font-mono">T4</strong> : Délivrer eau (P4+P5 → P8)</li>
                <li>• <strong className="text-orange-600 font-mono">T5</strong> : Délivrer soda (P4+P6 → P8)</li>
                <li>• <strong className="text-orange-600 font-mono">T6</strong> : Délivrer jus (P4+P7 → P8)</li>
                <li>• <strong className="text-orange-600 font-mono">T7</strong> : Lancer distribution (P8 → P9)</li>
                <li>• <strong className="text-orange-600 font-mono">T8</strong> : Prendre boisson (P9 → P10)</li>
                <li>• <strong className="text-orange-600 font-mono">T9</strong> : Terminer & Reset (P10 → P1)</li>
              </ul>
            </div>
          </div>

          {/* Tarification */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-[11px] text-slate-600">
            <h4 className="font-bold text-slate-800 mb-1">Boissons & Tarification (Ariary - Madagascar)</h4>
            <div className="grid grid-cols-3 gap-2 mt-2 font-mono text-center">
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <div className="text-cyan-600 font-bold">Eau Minérale</div>
                <div className="text-slate-800 font-extrabold">1 000 Ar</div>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <div className="text-amber-600 font-bold">Soda</div>
                <div className="text-slate-800 font-extrabold">1 500 Ar</div>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <div className="text-orange-600 font-bold">Jus Naturel</div>
                <div className="text-slate-800 font-extrabold">2 000 Ar</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer modale */}
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
