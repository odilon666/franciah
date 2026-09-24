import { ActionResponse, Drink, HistoryItem, PetriArc, PetriPlace, PetriTransition, VendingState } from '../types/vending';

const API_BASE = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({ detail: 'Erreur réseau inattendue' }));
  if (!res.ok) {
    const errorMsg = data.detail || data.message || `Erreur serveur HTTP ${res.status}`;
    throw new Error(errorMsg);
  }
  return data as T;
}

export const vendingApi = {
  async getState(): Promise<VendingState> {
    const res = await fetch(`${API_BASE}/state`);
    return handleResponse<VendingState>(res);
  },

  async getPlaces(): Promise<PetriPlace[]> {
    const res = await fetch(`${API_BASE}/places`);
    return handleResponse<PetriPlace[]>(res);
  },

  async getTransitions(): Promise<PetriTransition[]> {
    const res = await fetch(`${API_BASE}/transitions`);
    return handleResponse<PetriTransition[]>(res);
  },

  async getDrinks(): Promise<Drink[]> {
    const res = await fetch(`${API_BASE}/drinks`);
    return handleResponse<Drink[]>(res);
  },

  async getArcs(): Promise<PetriArc[]> {
    const res = await fetch(`${API_BASE}/arcs`);
    return handleResponse<PetriArc[]>(res);
  },

  async getHistory(): Promise<HistoryItem[]> {
    const res = await fetch(`${API_BASE}/history`);
    return handleResponse<HistoryItem[]>(res);
  },

  async insertMoney(amount: number): Promise<ActionResponse> {
    const res = await fetch(`${API_BASE}/insert-money`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
    return handleResponse<ActionResponse>(res);
  },

  async selectDrink(drinkId: string): Promise<ActionResponse> {
    const res = await fetch(`${API_BASE}/select-drink`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drink_id: drinkId }),
    });
    return handleResponse<ActionResponse>(res);
  },

  async fireTransition(transitionId: string, drinkId?: string): Promise<ActionResponse> {
    const res = await fetch(`${API_BASE}/fire`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transition_id: transitionId, drink_id: drinkId }),
    });
    return handleResponse<ActionResponse>(res);
  },

  async resetSimulation(): Promise<ActionResponse> {
    const res = await fetch(`${API_BASE}/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse<ActionResponse>(res);
  },
};
