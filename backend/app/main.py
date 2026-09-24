"""
Application FastAPI - Distributeur Automatique avec Réseau de Petri
Point d'entrée de l'API REST.
"""

from typing import Dict, List
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import (
    ActionResponse,
    Drink,
    FireTransitionRequest,
    HistoryItem,
    InsertMoneyRequest,
    PetriArc,
    PetriPlace,
    PetriTransition,
    SelectDrinkRequest,
    VendingState,
)
from app.vending_machine import VendingMachine

app = FastAPI(
    title="Distributeur Automatique - Réseau de Petri",
    description="API de simulation et de gestion d'un distributeur automatique contrôlé par Réseau de Petri",
    version="1.0.0",
)

# CORS pour développement
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instance unique du distributeur automatique (source de vérité)
vending_service = VendingMachine()


@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Distributeur Automatique - Réseau de Petri",
        "version": "1.0.0",
        "endpoints": [
            "/api/state",
            "/api/places",
            "/api/transitions",
            "/api/drinks",
            "/api/arcs",
            "/api/insert-money",
            "/api/select-drink",
            "/api/fire",
            "/api/reset",
            "/api/history",
        ],
    }


@app.get("/api/state", response_model=VendingState)
def get_state():
    """Retourne l'état complet du distributeur et le marquage du Réseau de Petri."""
    return vending_service.get_state()


@app.get("/api/places", response_model=List[PetriPlace])
def get_places():
    """Retourne la liste des places du Réseau de Petri avec leur nombre de jetons."""
    return vending_service.get_places()


@app.get("/api/transitions", response_model=List[PetriTransition])
def get_transitions():
    """Retourne les transitions avec leur état d'activation (franchissable ou non)."""
    return vending_service.get_transitions()


@app.get("/api/drinks", response_model=List[Drink])
def get_drinks():
    """Retourne les boissons avec leurs prix et stocks courants."""
    return vending_service.get_drinks()


@app.get("/api/arcs", response_model=List[PetriArc])
def get_arcs():
    """Retourne les arcs du Réseau de Petri."""
    return vending_service.get_arcs()


@app.get("/api/history", response_model=List[HistoryItem])
def get_history():
    """Retourne l'historique complet des franchissements de transitions."""
    return vending_service.history


@app.post("/api/insert-money", response_model=ActionResponse)
def insert_money(req: InsertMoneyRequest):
    """Insère de l'argent dans le distributeur."""
    success, message = vending_service.insert_money(req.amount)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message,
        )
    return ActionResponse(
        success=True,
        message=message,
        state=vending_service.get_state(),
    )


@app.post("/api/select-drink", response_model=ActionResponse)
def select_drink(req: SelectDrinkRequest):
    """Sélectionne une boisson (water, soda, juice)."""
    success, message = vending_service.select_drink(req.drink_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message,
        )
    return ActionResponse(
        success=True,
        message=message,
        state=vending_service.get_state(),
    )


@app.post("/api/fire", response_model=ActionResponse)
def fire_transition(req: FireTransitionRequest):
    """Déclenche manuellement une transition spécifique."""
    success, message = vending_service.fire_transition(req.transition_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message,
        )
    return ActionResponse(
        success=True,
        message=message,
        state=vending_service.get_state(),
    )


@app.post("/api/reset", response_model=ActionResponse)
def reset_simulation():
    """Réinitialise la simulation à l'état M0 initial."""
    vending_service.reset_simulation()
    return ActionResponse(
        success=True,
        message="Simulation réinitialisée avec succès au marquage initial M0.",
        state=vending_service.get_state(),
    )
