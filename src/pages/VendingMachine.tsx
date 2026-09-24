import React, { useEffect, useState, useCallback } from 'react';
import {
  RotateCcw,
  Sparkles,
  HelpCircle,
  Database,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  Layers,
  History,
  LayoutGrid,
  Package,
  Cpu,
  Tv,
  Workflow,
} from 'lucide-react';
import { vendingApi } from '../services/api';
import { Drink, HistoryItem, VendingState } from '../types/vending';
import { StatusBar } from '../components/StatusBar';
import { DrinksAndMoneyColumn } from '../components/DrinksAndMoneyColumn';
import { SimulationRightColumn } from '../components/SimulationRightColumn';
import { PetriNet } from '../components/PetriNet';
import { MarkingModal } from '../components/MarkingModal';
import { ModelGuideModal } from '../components/ModelGuideModal';
import { HistoryModal } from '../components/HistoryModal';
import { InteractiveVendingView } from '../components/views/InteractiveVendingView';
import { SimulationStepView } from '../components/views/SimulationStepView';
import { StockTableView } from '../components/views/StockTableView';
import { FormalStateView } from '../components/views/FormalStateView';
import { HistoryPanel } from '../components/HistoryPanel';

type ViewMode = 'kiosk' | 'simulation' | 'petrinet' | 'cockpit' | 'stocks' | 'history' | 'state';

export const VendingMachine: React.FC = () => {
  const [state, setState] = useState<VendingState | null>(null);
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  // VUE PAR DÉFAUT : BORNE TACTILE SMART DRINK (Section 2 & 3 des instructions utilisateur)
  const [activeTab, setActiveTab] = useState<ViewMode>('kiosk');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Modales d'information
  const [isMarkingModalOpen, setIsMarkingModalOpen] = useState<boolean>(false);
  const [isModelModalOpen, setIsModelModalOpen] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);

  // Charger les données de la machine
  const loadData = useCallback(async () => {
    try {
      const [stateData, drinksData, historyData] = await Promise.all([
        vendingApi.getState(),
        vendingApi.getDrinks(),
        vendingApi.getHistory(),
      ]);
      setState(stateData);
      setDrinks(drinksData);
      setHistory(historyData);
      setIsBackendConnected(true);
      setErrorMessage(null);
    } catch (err: any) {
      console.error('Erreur chargement données:', err);
      setIsBackendConnected(false);
      setErrorMessage('Connexion au backend en attente...');
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [loadData]);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleInsertMoney = async (amount: number) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await vendingApi.insertMoney(amount);
      setState(res.state);
      showToast(res.message);
      await loadData();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDrink = async (drinkId: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await vendingApi.selectDrink(drinkId);
      setState(res.state);
      showToast(res.message);
      await loadData();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFireTransition = async (transId: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await vendingApi.fireTransition(transId);
      setState(res.state);
      showToast(res.message);
      await loadData();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await vendingApi.resetSimulation();
      setState(res.state);
      showToast(res.message);
      await loadData();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Exécution guidée pas-à-pas pour la démonstration universitaire
  const handleAutoDemoStep = async () => {
    if (!state) return;
    const { marking, inserted_amount, selected_drink } = state;

    if (marking.P1 >= 1) {
      await handleInsertMoney(1000);
      return;
    }
    if (marking.P2 >= 1) {
      if (inserted_amount < 1500) {
        await handleInsertMoney(500);
        return;
      }
      if (!selected_drink) {
        await handleSelectDrink('soda');
        return;
      }
      await handleFireTransition('T2');
      return;
    }
    if (marking.P3 >= 1) {
      await handleFireTransition('T3');
      return;
    }
    if (marking.P4 >= 1) {
      await handleFireTransition('T5');
      return;
    }
    if (marking.P8 >= 1) {
      await handleFireTransition('T7');
      return;
    }
    if (marking.P9 >= 1) {
      await handleFireTransition('T8');
      return;
    }
    if (marking.P10 >= 1) {
      await handleFireTransition('T9');
      return;
    }
  };

  if (!state) {
    return (
      <div className="h-screen w-screen bg-[#F8FAFC] text-slate-900 flex flex-col items-center justify-center p-6 overflow-hidden">
        <div className="w-10 h-10 rounded-full border-4 border-teal-500 border-t-transparent animate-spin mb-3" />
        <h2 className="text-base font-extrabold text-slate-900">Initialisation de la Borne Smart Drink...</h2>
        <p className="text-xs text-slate-500 mt-1">Chargement du modèle formel Réseau de Petri</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#F8FAFC] text-slate-900 flex flex-col overflow-hidden select-none font-sans">
      {/* Toast de succès flottant */}
      {successToast && (
        <div className="fixed top-3 right-4 z-50 bg-emerald-50 border border-emerald-300 text-emerald-900 px-3.5 py-1.5 rounded-xl shadow-lg backdrop-blur-md flex items-center gap-2 text-xs animate-in fade-in slide-in-from-top-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Alerte d'erreur flottante */}
      {errorMessage && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 bg-rose-50 border border-rose-300 text-rose-900 px-4 py-1.5 rounded-xl text-xs flex items-center gap-3 shadow-xl backdrop-blur-md font-medium">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-rose-600 hover:text-rose-800 font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {/* 1. EN-TÊTE PRINCIPAL MODERNE & LUMINEUX (~44px) */}
      <header className="h-11 bg-white border-b border-slate-200 px-3 flex items-center justify-between flex-shrink-0 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-teal-600 flex items-center justify-center text-white text-sm shadow-xs">
            🥤
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-xs sm:text-sm font-black tracking-tight text-slate-900 uppercase">
              SMART DRINK
            </h1>
            <span className="hidden sm:inline text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
              RÉSEAU DE PETRI
            </span>
          </div>
        </div>

        {/* Boutons d'actions rapides et Modales */}
        <div className="flex items-center gap-1.5">
          {/* Témoin backend */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-[10px] text-slate-600 font-mono">
            <Database className="w-3 h-3 text-teal-600" />
            <span className={`w-1.5 h-1.5 rounded-full ${isBackendConnected ? 'bg-emerald-500' : 'bg-rose-500 animate-ping'}`} />
            <span>FastAPI</span>
          </div>

          {/* Bouton Modale Marquage M(t) */}
          <button
            onClick={() => setIsMarkingModalOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-teal-50 border border-slate-200 text-[11px] text-slate-700 hover:text-teal-900 flex items-center gap-1 font-medium transition-colors shadow-xs"
            title="Consulter le vecteur de marquage M(t)"
          >
            <Layers className="w-3 h-3 text-teal-600" />
            <span className="hidden sm:inline">Vecteur</span> M(t)
          </button>

          {/* Bouton Modale Guide M0 */}
          <button
            onClick={() => setIsModelModalOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-teal-50 border border-slate-200 text-[11px] text-slate-700 hover:text-teal-900 flex items-center gap-1 font-medium transition-colors shadow-xs"
            title="Consulter le modèle formel académique M0"
          >
            <HelpCircle className="w-3 h-3 text-teal-600" />
            <span className="hidden sm:inline">Guide</span> M0
          </button>

          {/* Bouton Étape Démo (ORANGE VIBRANT) */}
          <button
            onClick={handleAutoDemoStep}
            disabled={isLoading}
            className="px-3 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-extrabold flex items-center gap-1 shadow-xs hover:shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-50"
            title="Avancer automatiquement d'une étape logique dans le cycle"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Étape Démo</span>
          </button>
        </div>
      </header>

      {/* 2. BARRE D'ÉTAT EN TEMPS RÉEL (Section 10) */}
      <StatusBar state={state} drinks={drinks} />

      {/* 3. BARRE DE NAVIGATION PAR ONGLETS (Section 2) */}
      <nav className="h-10 bg-white border-b border-slate-200 px-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
          {/* ONGLET 1 : DISTRIBUTEUR (PAR DÉFAUT - PREMIÈRE VUE) */}
          <button
            onClick={() => setActiveTab('kiosk')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
              activeTab === 'kiosk'
                ? 'bg-teal-600 text-white ring-2 ring-teal-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Distributeur (Borne)</span>
          </button>

          {/* ONGLET 2 : SIMULATION (ÉTAPE PAR ÉTAPE) */}
          <button
            onClick={() => setActiveTab('simulation')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
              activeTab === 'simulation'
                ? 'bg-teal-600 text-white ring-2 ring-teal-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>Simulation</span>
          </button>

          {/* ONGLET 3 : RÉSEAU DE PETRI */}
          <button
            onClick={() => setActiveTab('petrinet')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
              activeTab === 'petrinet'
                ? 'bg-teal-600 text-white ring-2 ring-teal-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Réseau de Petri</span>
          </button>

          {/* ONGLET 4 : COCKPIT 3 COLONNES */}
          <button
            onClick={() => setActiveTab('cockpit')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
              activeTab === 'cockpit'
                ? 'bg-teal-600 text-white ring-2 ring-teal-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Vue Cockpit</span>
          </button>

          {/* ONGLET 5 : STOCKS (P5..P7) */}
          <button
            onClick={() => setActiveTab('stocks')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
              activeTab === 'stocks'
                ? 'bg-teal-600 text-white ring-2 ring-teal-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Stocks (P5-P7)</span>
          </button>

          {/* ONGLET 6 : HISTORIQUE */}
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
              activeTab === 'history'
                ? 'bg-teal-600 text-white ring-2 ring-teal-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Historique ({history.length})</span>
          </button>

          {/* ONGLET 7 : ÉTAT FORMEL */}
          <button
            onClick={() => setActiveTab('state')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
              activeTab === 'state'
                ? 'bg-teal-600 text-white ring-2 ring-teal-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>État Formel</span>
          </button>
        </div>

        {/* Bouton Reset discret */}
        <button
          onClick={handleReset}
          disabled={isLoading}
          className="text-slate-500 hover:text-rose-600 text-[11px] font-medium flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-colors flex-shrink-0"
          title="Réinitialiser au marquage initial M0"
        >
          <RotateCcw className="w-3 h-3 text-rose-500" />
          <span className="hidden sm:inline">Reset M0</span>
        </button>
      </nav>

      {/* 4. CONTENEUR PRINCIPAL SANS AUCUN SCROLL SUR LE CORPS DE PAGE (Section 1) */}
      <main className="flex-1 min-h-0 w-full p-2.5 overflow-hidden relative">
        {/* VUE 1 : BORNE DE DISTRIBUTION TACTILE (PREMIÈRE VUE PRINCIPALE) */}
        {activeTab === 'kiosk' && (
          <InteractiveVendingView
            state={state}
            drinks={drinks}
            onSelectDrink={handleSelectDrink}
            onInsertMoney={handleInsertMoney}
            onFire={handleFireTransition}
            onReset={handleReset}
            isLoading={isLoading}
          />
        )}

        {/* VUE 2 : WORKFLOW SIMULATION ÉTAPE PAR ÉTAPE */}
        {activeTab === 'simulation' && (
          <SimulationStepView
            state={state}
            drinks={drinks}
            onFire={handleFireTransition}
            onReset={handleReset}
            onInsertMoney={handleInsertMoney}
            onSelectDrink={handleSelectDrink}
            isLoading={isLoading}
          />
        )}

        {/* VUE 3 : RÉSEAU DE PETRI PLEIN ÉCRAN */}
        {activeTab === 'petrinet' && (
          <div className="h-full w-full flex flex-col overflow-hidden">
            <PetriNet
              marking={state.marking}
              enabledTransitions={state.enabled_transitions}
              lastTransition={state.last_transition}
              onTransitionClick={handleFireTransition}
            />
          </div>
        )}

        {/* VUE 4 : COCKPIT 3 COLONNES */}
        {activeTab === 'cockpit' && (
          <div className="h-full w-full flex flex-col md:flex-row gap-2.5 overflow-hidden">
            {/* Colonne 1 : BOISSONS & MONNAYEUR (Gauche) */}
            <aside className="w-full md:w-[250px] lg:w-[270px] flex-shrink-0 h-full overflow-hidden">
              <DrinksAndMoneyColumn
                drinks={drinks}
                state={state}
                onSelectDrink={handleSelectDrink}
                onInsertMoney={handleInsertMoney}
                isLoading={isLoading}
              />
            </aside>

            {/* Colonne 2 : RÉSEAU DE PETRI (Centrale) */}
            <section className="flex-1 min-w-0 h-full flex flex-col overflow-hidden">
              <PetriNet
                marking={state.marking}
                enabledTransitions={state.enabled_transitions}
                lastTransition={state.last_transition}
                onTransitionClick={handleFireTransition}
              />
            </section>

            {/* Colonne 3 : SIMULATION & ACTIONS (Droite) */}
            <aside className="w-full md:w-[270px] lg:w-[300px] flex-shrink-0 h-full overflow-hidden">
              <SimulationRightColumn
                state={state}
                drinks={drinks}
                onFire={handleFireTransition}
                onReset={handleReset}
                onOpenMarking={() => setIsMarkingModalOpen(true)}
                onOpenHistory={() => setIsHistoryModalOpen(true)}
                onOpenModel={() => setIsModelModalOpen(true)}
                isLoading={isLoading}
              />
            </aside>
          </div>
        )}

        {/* VUE 5 : STOCKS (P5..P7) */}
        {activeTab === 'stocks' && (
          <StockTableView drinks={drinks} marking={state.marking} />
        )}

        {/* VUE 6 : HISTORIQUE COMPLET */}
        {activeTab === 'history' && (
          <div className="h-full w-full max-w-4xl mx-auto overflow-hidden">
            <HistoryPanel history={history} />
          </div>
        )}

        {/* VUE 7 : ÉTAT FORMEL & EQUATIONS */}
        {activeTab === 'state' && (
          <FormalStateView state={state} drinks={drinks} />
        )}
      </main>

      {/* 5. FOOTER DISCRET D'UNE SEULE LIGNE */}
      <footer className="h-6 bg-white border-t border-slate-200 px-3 flex items-center justify-between text-[10px] text-slate-500 font-mono flex-shrink-0 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-500" />
          <span>Smart Vending Kiosk • Réseau de Petri Formel • Modèle Universitaire</span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <span>M0 = (1, 0, 0, 0, 5, 5, 5, 0, 0, 0)</span>
          <span className="text-teal-700 font-semibold">10 Places · 9 Transitions</span>
        </div>
      </footer>

      {/* MODALES FLOTTANTES */}
      <MarkingModal
        isOpen={isMarkingModalOpen}
        onClose={() => setIsMarkingModalOpen(false)}
        marking={state.marking}
      />

      <ModelGuideModal
        isOpen={isModelModalOpen}
        onClose={() => setIsModelModalOpen(false)}
      />

      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={history}
      />
    </div>
  );
};
