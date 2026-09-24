/**
 * Moteur de Réseau de Petri et Distributeur Automatique (TypeScript)
 * Implémentation miroir fidèle du modèle formel Petri Net (P1..P10, T1..T9).
 */

export interface Place {
  id: string;
  name: string;
  description: string;
  tokens: number;
  category: 'state' | 'resource' | 'output';
}

export interface Transition {
  id: string;
  name: string;
  description: string;
}

export interface Arc {
  id: string;
  source: string;
  target: string;
  weight: number;
  arc_type: 'input' | 'output';
}

export interface HistoryItem {
  id: number;
  transition_id: string;
  transition_name: string;
  action_description: string;
  timestamp: string;
  marking_after: Record<string, number>;
  inserted_amount: number;
  change: number;
}

export interface DrinkConfig {
  id: string;
  name: string;
  price: number;
  initial_stock: number;
  place_id: string;
  trans_id: string;
  icon: string;
  description: string;
}

export class PetriNetEngine {
  places: Map<string, Place> = new Map();
  transitions: Map<string, Transition> = new Map();
  arcs: Arc[] = [];
  inputArcs: Map<string, Array<{ placeId: string; weight: number }>> = new Map();
  outputArcs: Map<string, Array<{ placeId: string; weight: number }>> = new Map();
  guards: Map<string, () => [boolean, string]> = new Map();
  initialMarking: Map<string, number> = new Map();

  addPlace(id: string, name: string, description: string = '', tokens: number = 0, category: 'state' | 'resource' | 'output' = 'state'): Place {
    const place: Place = { id, name, description, tokens, category };
    this.places.set(id, place);
    this.initialMarking.set(id, tokens);
    return place;
  }

  addTransition(id: string, name: string, description: string = ''): Transition {
    const trans: Transition = { id, name, description };
    this.transitions.set(id, trans);
    this.inputArcs.set(id, []);
    this.outputArcs.set(id, []);
    return trans;
  }

  addInputArc(placeId: string, transId: string, weight: number = 1): Arc {
    const arc: Arc = {
      id: `${placeId}->${transId}`,
      source: placeId,
      target: transId,
      weight,
      arc_type: 'input',
    };
    this.arcs.push(arc);
    this.inputArcs.get(transId)?.push({ placeId, weight });
    return arc;
  }

  addOutputArc(transId: string, placeId: string, weight: number = 1): Arc {
    const arc: Arc = {
      id: `${transId}->${placeId}`,
      source: transId,
      target: placeId,
      weight,
      arc_type: 'output',
    };
    this.arcs.push(arc);
    this.outputArcs.get(transId)?.push({ placeId, weight });
    return arc;
  }

  setGuard(transId: string, guard: () => [boolean, string]): void {
    this.guards.set(transId, guard);
  }

  isEnabled(transId: string): [boolean, string] {
    if (!this.transitions.has(transId)) {
      return [false, `Transition ${transId} inexistante`];
    }

    const inputs = this.inputArcs.get(transId) || [];
    for (const { placeId, weight } of inputs) {
      const place = this.places.get(placeId);
      if (!place || place.tokens < weight) {
        return [false, `Jetons insuffisants dans ${placeId} (${place?.name || ''}) : requis ${weight}, disponible ${place?.tokens ?? 0}`];
      }
    }

    if (this.guards.has(transId)) {
      const [passed, reason] = this.guards.get(transId)!();
      if (!passed) return [false, reason];
    }

    return [true, 'Transition franchissable'];
  }

  fire(transId: string): [boolean, string] {
    const [enabled, reason] = this.isEnabled(transId);
    if (!enabled) {
      return [false, `Franchissement refusé : ${reason}`];
    }

    const inputs = this.inputArcs.get(transId) || [];
    for (const { placeId, weight } of inputs) {
      const place = this.places.get(placeId)!;
      place.tokens -= weight;
    }

    const outputs = this.outputArcs.get(transId) || [];
    for (const { placeId, weight } of outputs) {
      const place = this.places.get(placeId)!;
      place.tokens += weight;
    }

    return [true, `Transition ${transId} franchie avec succès`];
  }

  getMarking(): Record<string, number> {
    const res: Record<string, number> = {};
    for (const [id, place] of this.places.entries()) {
      res[id] = place.tokens;
    }
    return res;
  }

  reset(): void {
    for (const [id, tokens] of this.initialMarking.entries()) {
      const place = this.places.get(id);
      if (place) place.tokens = tokens;
    }
  }

  getEnabledTransitions(): string[] {
    const enabled: string[] = [];
    for (const transId of this.transitions.keys()) {
      const [isEn] = this.isEnabled(transId);
      if (isEn) enabled.push(transId);
    }
    return enabled;
  }
}

export class VendingMachineService {
  net: PetriNetEngine = new PetriNetEngine();
  insertedAmount: number = 0;
  selectedDrink: string | null = null;
  selectedPrice: number | null = null;
  change: number = 0;
  statusMessage: string = 'Machine disponible - Prête pour une nouvelle transaction';
  statusType: 'info' | 'success' | 'warning' | 'error' = 'info';
  lastTransition: string | null = null;
  history: HistoryItem[] = [];
  historyCounter: number = 0;

  drinksConfig: Record<string, DrinkConfig> = {
    water: {
      id: 'water',
      name: 'Eau Minérale',
      price: 1000,
      initial_stock: 5,
      place_id: 'P5',
      trans_id: 'T4',
      icon: 'Droplets',
      description: 'Eau pure et fraîche (50 cl)',
    },
    soda: {
      id: 'soda',
      name: 'Soda',
      price: 1500,
      initial_stock: 5,
      place_id: 'P6',
      trans_id: 'T5',
      icon: 'CupSoda',
      description: 'Boisson gazeuse rafraîchissante (33 cl)',
    },
    juice: {
      id: 'juice',
      name: 'Jus Naturel',
      price: 2000,
      initial_stock: 5,
      place_id: 'P7',
      trans_id: 'T6',
      icon: 'Citrus',
      description: 'Jus de fruits vitaminé (25 cl)',
    },
  };

  constructor() {
    this.buildPetriNet();
  }

  private buildPetriNet(): void {
    // 1. Places
    this.net.addPlace('P1', 'Machine disponible', 'Machine libre pour démarrer une transaction', 1, 'state');
    this.net.addPlace('P2', 'Argent inséré', 'Crédit présent dans le distributeur', 0, 'state');
    this.net.addPlace('P3', 'Montant suffisant', 'Montant vérifié supérieur ou égal au prix', 0, 'state');
    this.net.addPlace('P4', 'Boisson sélectionnée', 'Choix de boisson validé', 0, 'state');

    // Ressources
    this.net.addPlace('P5', 'Stock Eau', "Stock physique d'eau", 5, 'resource');
    this.net.addPlace('P6', 'Stock Soda', 'Stock physique de soda', 5, 'resource');
    this.net.addPlace('P7', 'Stock Jus', 'Stock physique de jus', 5, 'resource');

    // Sorties
    this.net.addPlace('P8', 'Distribution en cours', 'Mécanisme de distribution activé', 0, 'state');
    this.net.addPlace('P9', 'Boisson délivrée', 'Boisson dans le bac de récupération', 0, 'output');
    this.net.addPlace('P10', 'Transaction terminée', 'Monnaie rendue et boisson servie', 0, 'output');

    // 2. Transitions
    this.net.addTransition('T1', "Insérer de l'argent", "Insertion d'Ariary par le client (P1 -> P2)");
    this.net.addTransition('T2', 'Vérifier le montant', 'Validation du crédit suffisant (P2 -> P3)');
    this.net.addTransition('T3', 'Sélectionner une boisson', 'Validation du choix de boisson (P3 -> P4)');
    this.net.addTransition('T4', "Sélectionner l'eau", 'Consommation stock Eau (P4 + P5 -> P8)');
    this.net.addTransition('T5', 'Sélectionner le soda', 'Consommation stock Soda (P4 + P6 -> P8)');
    this.net.addTransition('T6', 'Sélectionner le jus', 'Consommation stock Jus (P4 + P7 -> P8)');
    this.net.addTransition('T7', 'Lancer la distribution', 'Préparation et acheminement du produit (P8 -> P9)');
    this.net.addTransition('T8', 'Délivrer la boisson', 'Mise à disposition et calcul de la monnaie (P9 -> P10)');
    this.net.addTransition('T9', 'Terminer la transaction', 'Rendu monnaie et retour machine disponible (P10 -> P1)');

    // 3. Arcs
    this.net.addInputArc('P1', 'T1', 1);
    this.net.addOutputArc('T1', 'P2', 1);

    this.net.addInputArc('P2', 'T2', 1);
    this.net.addOutputArc('T2', 'P3', 1);

    this.net.addInputArc('P3', 'T3', 1);
    this.net.addOutputArc('T3', 'P4', 1);

    this.net.addInputArc('P4', 'T4', 1);
    this.net.addInputArc('P5', 'T4', 1);
    this.net.addOutputArc('T4', 'P8', 1);

    this.net.addInputArc('P4', 'T5', 1);
    this.net.addInputArc('P6', 'T5', 1);
    this.net.addOutputArc('T5', 'P8', 1);

    this.net.addInputArc('P4', 'T6', 1);
    this.net.addInputArc('P7', 'T6', 1);
    this.net.addOutputArc('T6', 'P8', 1);

    this.net.addInputArc('P8', 'T7', 1);
    this.net.addOutputArc('T7', 'P9', 1);

    this.net.addInputArc('P9', 'T8', 1);
    this.net.addOutputArc('T8', 'P10', 1);

    this.net.addInputArc('P10', 'T9', 1);
    this.net.addOutputArc('T9', 'P1', 1);

    // 4. Gardes
    this.net.setGuard('T2', () => this.guardT2());
    this.net.setGuard('T4', () => this.guardDrinkSelection('water'));
    this.net.setGuard('T5', () => this.guardDrinkSelection('soda'));
    this.net.setGuard('T6', () => this.guardDrinkSelection('juice'));
  }

  private guardT2(): [boolean, string] {
    if (!this.selectedDrink) {
      const minPrice = 1000;
      if (this.insertedAmount < minPrice) {
        return [false, `Montant insuffisant (${this.insertedAmount} Ar). Le montant minimum est de ${minPrice} Ar.`];
      }
      return [true, 'Montant suffisant pour au moins une boisson'];
    }

    const cfg = this.drinksConfig[this.selectedDrink];
    if (this.insertedAmount < cfg.price) {
      return [false, `Montant insuffisant pour ${cfg.name} : ${this.insertedAmount} Ar inséré(s), ${cfg.price} Ar requis.`];
    }
    return [true, `Montant suffisant (${this.insertedAmount} Ar >= ${cfg.price} Ar)`];
  }

  private guardDrinkSelection(drinkKey: string): [boolean, string] {
    const cfg = this.drinksConfig[drinkKey];
    const stock = this.net.places.get(cfg.place_id)?.tokens ?? 0;
    if (stock <= 0) {
      return [false, `${cfg.name} indisponible : stock épuisé (0 jeton dans ${cfg.place_id})`];
    }
    if (this.selectedDrink && this.selectedDrink !== drinkKey) {
      return [false, `La boisson sélectionnée est ${this.drinksConfig[this.selectedDrink].name}, pas ${cfg.name}.`];
    }
    return [true, `Stock suffisant pour ${cfg.name} (${stock} restant(s))`];
  }

  private logHistory(transId: string, transName: string, desc: string): void {
    this.historyCounter++;
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    this.history.push({
      id: this.historyCounter,
      transition_id: transId,
      transition_name: transName,
      action_description: desc,
      timestamp: timeStr,
      marking_after: this.net.getMarking(),
      inserted_amount: this.insertedAmount,
      change: this.change,
    });
  }

  insertMoney(amount: number): [boolean, string] {
    if (amount <= 0) return [false, 'Le montant inséré doit être strictement positif.'];

    const marking = this.net.getMarking();
    if (marking['P1'] >= 1) {
      const [success, msg] = this.net.fire('T1');
      if (!success) return [false, msg];
      this.insertedAmount = amount;
      this.lastTransition = 'T1';
      this.statusMessage = `Argent inséré : ${amount} Ar. Total : ${this.insertedAmount} Ar.`;
      this.statusType = 'info';
      this.logHistory('T1', "Insérer de l'argent", `Insertion initiale de ${amount} Ar. Total : ${this.insertedAmount} Ar.`);
      return [true, `Argent inséré : ${amount} Ar.`];
    } else if (marking['P2'] >= 1) {
      this.insertedAmount += amount;
      this.statusMessage = `Ajout de ${amount} Ar. Total inséré : ${this.insertedAmount} Ar.`;
      this.statusType = 'info';
      this.logHistory('T1', "Insérer de l'argent", `Complément de ${amount} Ar inséré. Total cumulé : ${this.insertedAmount} Ar.`);
      return [true, `Montant ajouté : ${amount} Ar. Total : ${this.insertedAmount} Ar.`];
    } else {
      return [false, "Impossible d'insérer de l'argent dans l'état actuel de la machine."];
    }
  }

  selectDrink(drinkId: string): [boolean, string] {
    const cfg = this.drinksConfig[drinkId];
    if (!cfg) return [false, `Boisson inconnue : ${drinkId}`];

    const stock = this.net.places.get(cfg.place_id)?.tokens ?? 0;
    if (stock <= 0) {
      this.statusMessage = `${cfg.name} indisponible : stock épuisé`;
      this.statusType = 'error';
      return [false, this.statusMessage];
    }

    this.selectedDrink = drinkId;
    this.selectedPrice = cfg.price;

    const marking = this.net.getMarking();
    if (marking['P4'] >= 1) {
      return this.fireTransition(cfg.trans_id);
    }
    if (marking['P3'] >= 1) {
      const [success] = this.net.fire('T3');
      if (success) {
        this.lastTransition = 'T3';
        this.logHistory('T3', 'Sélectionner une boisson', `Validation sélection boisson : ${cfg.name}`);
        return this.fireTransition(cfg.trans_id);
      }
    }

    this.statusMessage = `Boisson sélectionnée : ${cfg.name} (${cfg.price} Ar)`;
    this.statusType = 'info';
    return [true, this.statusMessage];
  }

  fireTransition(transId: string): [boolean, string] {
    if (!this.net.transitions.has(transId)) {
      return [false, `Transition inconnue : ${transId}`];
    }

    if (transId === 'T1') {
      if (this.insertedAmount === 0) return this.insertMoney(1000);
      const [s, m] = this.net.fire('T1');
      if (s) {
        this.lastTransition = 'T1';
        this.logHistory('T1', "Insérer de l'argent", `Argent inséré (${this.insertedAmount} Ar)`);
      }
      return [s, m];
    }

    if (transId === 'T2') {
      if (!this.selectedDrink) {
        const minPrice = 1000;
        if (this.insertedAmount < minPrice) {
          this.statusMessage = `Distribution impossible : montant insuffisant (${this.insertedAmount} Ar < ${minPrice} Ar)`;
          this.statusType = 'error';
          return [false, this.statusMessage];
        }
      } else {
        const needed = this.drinksConfig[this.selectedDrink].price;
        if (this.insertedAmount < needed) {
          const diff = needed - this.insertedAmount;
          this.statusMessage = `Distribution impossible : montant insuffisant (manque ${diff} Ar)`;
          this.statusType = 'error';
          return [false, this.statusMessage];
        }
      }

      const [s, m] = this.net.fire('T2');
      if (s) {
        this.lastTransition = 'T2';
        this.statusMessage = 'Montant suffisant vérifié';
        this.statusType = 'success';
        this.logHistory('T2', 'Vérifier le montant', `Montant vérifié : ${this.insertedAmount} Ar (Suffisant)`);
        return [true, 'Montant vérifié avec succès'];
      }
      return [false, m];
    }

    if (transId === 'T3') {
      const [s, m] = this.net.fire('T3');
      if (s) {
        this.lastTransition = 'T3';
        const name = this.selectedDrink ? this.drinksConfig[this.selectedDrink].name : 'Boisson';
        this.statusMessage = `Boisson sélectionnée validée (${name})`;
        this.statusType = 'info';
        this.logHistory('T3', 'Sélectionner une boisson', `Sélection de ${name}`);
        return [true, 'Boisson sélectionnée avec succès'];
      }
      return [false, m];
    }

    if (['T4', 'T5', 'T6'].includes(transId)) {
      const drinkKey = transId === 'T4' ? 'water' : transId === 'T5' ? 'soda' : 'juice';
      const cfg = this.drinksConfig[drinkKey];
      const stock = this.net.places.get(cfg.place_id)?.tokens ?? 0;
      if (stock <= 0) {
        this.statusMessage = `${cfg.name} indisponible : stock épuisé`;
        this.statusType = 'error';
        return [false, this.statusMessage];
      }

      this.selectedDrink = drinkKey;
      this.selectedPrice = cfg.price;

      const [s, m] = this.net.fire(transId);
      if (s) {
        this.lastTransition = transId;
        const rem = this.net.places.get(cfg.place_id)?.tokens ?? 0;
        this.statusMessage = `${cfg.name} sélectionné(e) (Stock restant : ${rem})`;
        this.statusType = 'success';
        this.logHistory(transId, `Sélectionner ${cfg.name}`, `${cfg.name} sélectionné (Stock ${cfg.place_id} : ${stock} -> ${rem})`);
        return [true, `${cfg.name} sélectionné`];
      }
      return [false, m];
    }

    if (transId === 'T7') {
      const [s, m] = this.net.fire('T7');
      if (s) {
        this.lastTransition = 'T7';
        this.statusMessage = 'Distribution en cours...';
        this.statusType = 'info';
        this.logHistory('T7', 'Lancer la distribution', 'Distribution lancée');
        return [true, 'Distribution lancée'];
      }
      return [false, m];
    }

    if (transId === 'T8') {
      const [s, m] = this.net.fire('T8');
      if (s) {
        this.lastTransition = 'T8';
        const price = this.selectedPrice ?? 0;
        this.change = this.insertedAmount >= price ? this.insertedAmount - price : 0;
        const name = this.selectedDrink ? this.drinksConfig[this.selectedDrink].name : 'Boisson';
        this.statusMessage = `Boisson délivrée : ${name} ! Monnaie à rendre : ${this.change} Ar.`;
        this.statusType = 'success';
        this.logHistory('T8', 'Délivrer la boisson', `Boisson ${name} délivrée. Prix: ${price} Ar, Inséré: ${this.insertedAmount} Ar, Monnaie: ${this.change} Ar`);
        return [true, 'Boisson délivrée'];
      }
      return [false, m];
    }

    if (transId === 'T9') {
      const [s, m] = this.net.fire('T9');
      if (s) {
        this.lastTransition = 'T9';
        const rendered = this.change;
        this.insertedAmount = 0;
        this.selectedDrink = null;
        this.selectedPrice = null;
        this.change = 0;
        this.statusMessage = `Transaction terminée. Monnaie restituée (${rendered} Ar). Machine disponible.`;
        this.statusType = 'success';
        this.logHistory('T9', 'Terminer la transaction', `Transaction terminée. Restitution de ${rendered} Ar de monnaie. Machine prête pour un nouvel achat.`);
        return [true, 'Transaction terminée'];
      }
      return [false, m];
    }

    return [false, `Transition ${transId} non gérée`];
  }

  reset(): void {
    this.net.reset();
    this.insertedAmount = 0;
    this.selectedDrink = null;
    this.selectedPrice = null;
    this.change = 0;
    this.statusMessage = 'Simulation réinitialisée au marquage M0. Machine disponible.';
    this.statusType = 'info';
    this.lastTransition = null;
    this.history = [];
    this.historyCounter = 0;
  }

  getState() {
    const marking = this.net.getMarking();
    const enabled = this.net.getEnabledTransitions();
    const machineAvailable = (marking['P1'] ?? 0) >= 1;

    return {
      machine_available: machineAvailable,
      inserted_amount: this.insertedAmount,
      selected_drink: this.selectedDrink,
      selected_price: this.selectedPrice,
      change: this.change,
      stocks: {
        water: marking['P5'] ?? 0,
        soda: marking['P6'] ?? 0,
        juice: marking['P7'] ?? 0,
      },
      marking,
      enabled_transitions: enabled,
      last_transition: this.lastTransition,
      status_message: this.statusMessage,
      status_type: this.statusType,
    };
  }

  getPlaces() {
    return Array.from(this.net.places.values());
  }

  getTransitions() {
    const enabledList = this.net.getEnabledTransitions();
    return Array.from(this.net.transitions.values()).map((t) => {
      const isEnabled = enabledList.includes(t.id);
      const [, reason] = isEnabled ? [true, null] : this.net.isEnabled(t.id);
      const inputPlaces = (this.net.inputArcs.get(t.id) || []).map((a) => a.placeId);
      const outputPlaces = (this.net.outputArcs.get(t.id) || []).map((a) => a.placeId);
      return {
        id: t.id,
        name: t.name,
        description: t.description,
        is_enabled: isEnabled,
        disabled_reason: isEnabled ? null : reason,
        input_places: inputPlaces,
        output_places: outputPlaces,
      };
    });
  }

  getArcs() {
    return this.net.arcs;
  }

  getDrinks() {
    const marking = this.net.getMarking();
    return Object.values(this.drinksConfig).map((cfg) => ({
      id: cfg.id,
      name: cfg.name,
      price: cfg.price,
      stock: marking[cfg.place_id] ?? 0,
      place_id: cfg.place_id,
      transition_id: cfg.trans_id,
      icon: cfg.icon,
      description: cfg.description,
    }));
  }
}

export const vendingService = new VendingMachineService();
