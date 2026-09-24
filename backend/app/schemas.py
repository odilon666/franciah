from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class Drink(BaseModel):
    id: str
    name: str
    price: int
    stock: int
    place_id: str
    transition_id: str
    icon: str
    description: str


class Marking(BaseModel):
    P1: int = 1
    P2: int = 0
    P3: int = 0
    P4: int = 0
    P5: int = 5
    P6: int = 5
    P7: int = 5
    P8: int = 0
    P9: int = 0
    P10: int = 0


class PetriPlace(BaseModel):
    id: str
    name: str
    description: str
    tokens: int
    category: str  # "state" | "resource" | "output"


class PetriTransition(BaseModel):
    id: str
    name: str
    description: str
    is_enabled: bool
    disabled_reason: Optional[str] = None
    input_places: List[str]
    output_places: List[str]


class PetriArc(BaseModel):
    id: str
    source: str
    target: str
    weight: int = 1
    arc_type: str = "normal"  # "input" | "output"


class HistoryItem(BaseModel):
    id: int
    transition_id: str
    transition_name: str
    action_description: str
    timestamp: str
    marking_after: Dict[str, int]
    inserted_amount: int
    change: int


class VendingState(BaseModel):
    machine_available: bool
    inserted_amount: int
    selected_drink: Optional[str]
    selected_price: Optional[int]
    change: int
    stocks: Dict[str, int]
    marking: Dict[str, int]
    enabled_transitions: List[str]
    last_transition: Optional[str] = None
    status_message: str = "Machine disponible"
    status_type: str = "info"  # "info" | "success" | "warning" | "error"


class InsertMoneyRequest(BaseModel):
    amount: int = Field(gt=0, description="Montant inséré en Ariary (Ar)")


class SelectDrinkRequest(BaseModel):
    drink_id: str = Field(description="Identifiant de la boisson ('water', 'soda', 'juice')")


class FireTransitionRequest(BaseModel):
    transition_id: str = Field(description="Identifiant de la transition à déclencher (T1..T9)")
    drink_id: Optional[str] = None


class ActionResponse(BaseModel):
    success: bool
    message: str
    state: VendingState
