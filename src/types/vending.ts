export interface Marking {
  P1: number;
  P2: number;
  P3: number;
  P4: number;
  P5: number;
  P6: number;
  P7: number;
  P8: number;
  P9: number;
  P10: number;
  [key: string]: number;
}

export interface Drink {
  id: string;
  name: string;
  price: number;
  stock: number;
  place_id: string;
  transition_id: string;
  icon: string;
  description: string;
}

export interface PetriPlace {
  id: string;
  name: string;
  description: string;
  tokens: number;
  category: 'state' | 'resource' | 'output';
}

export interface PetriTransition {
  id: string;
  name: string;
  description: string;
  is_enabled: boolean;
  disabled_reason?: string | null;
  input_places: string[];
  output_places: string[];
}

export interface PetriArc {
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
  marking_after: Marking;
  inserted_amount: number;
  change: number;
}

export interface VendingState {
  machine_available: boolean;
  inserted_amount: number;
  selected_drink: string | null;
  selected_price: number | null;
  change: number;
  stocks: {
    water: number;
    soda: number;
    juice: number;
    [key: string]: number;
  };
  marking: Marking;
  enabled_transitions: string[];
  last_transition: string | null;
  status_message: string;
  status_type: 'info' | 'success' | 'warning' | 'error';
}

export interface ActionResponse {
  success: boolean;
  message: string;
  state: VendingState;
}
