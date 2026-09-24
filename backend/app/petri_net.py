"""
Moteur générique de Réseau de Petri pour la simulation du distributeur automatique.
Contient les structures Place, Transition, Arc, Marking,
ainsi que les algorithmes d'activation et de franchissement (firing).
"""

from typing import Callable, Dict, List, Optional, Tuple


class Place:
    def __init__(self, id: str, name: str, description: str = "", tokens: int = 0, category: str = "state"):
        self.id = id
        self.name = name
        self.description = description
        self.tokens = tokens
        self.category = category

    def to_dict(self) -> Dict:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "tokens": self.tokens,
            "category": self.category,
        }


class Transition:
    def __init__(self, id: str, name: str, description: str = ""):
        self.id = id
        self.name = name
        self.description = description

    def to_dict(self) -> Dict:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
        }


class Arc:
    def __init__(self, id: str, source: str, target: str, weight: int = 1, arc_type: str = "input"):
        self.id = id
        self.source = source  # Place ID ou Transition ID
        self.target = target  # Transition ID ou Place ID
        self.weight = weight
        self.arc_type = arc_type

    def to_dict(self) -> Dict:
        return {
            "id": self.id,
            "source": self.source,
            "target": self.target,
            "weight": self.weight,
            "arc_type": self.arc_type,
        }


class PetriNet:
    """
    Réseau de Petri formel défini par le quadruplet (P, T, Pre, Post)
    avec gestion du marquage M(t) et des conditions de garde (predicates).
    """

    def __init__(self):
        self.places: Dict[str, Place] = {}
        self.transitions: Dict[str, Transition] = {}
        self.arcs: List[Arc] = []
        # Pre(t): liste de (place_id, weight)
        self.input_arcs: Dict[str, List[Tuple[str, int]]] = {}
        # Post(t): liste de (place_id, weight)
        self.output_arcs: Dict[str, List[Tuple[str, int]]] = {}
        # Fonctions de garde personnalisées pour transitions: id -> Callable[[], Tuple[bool, str]]
        self.guards: Dict[str, Callable[[], Tuple[bool, str]]] = {}
        self.initial_marking: Dict[str, int] = {}

    def add_place(self, place_id: str, name: str, description: str = "", tokens: int = 0, category: str = "state") -> Place:
        place = Place(place_id, name, description, tokens, category)
        self.places[place_id] = place
        self.initial_marking[place_id] = tokens
        return place

    def add_transition(self, trans_id: str, name: str, description: str = "") -> Transition:
        trans = Transition(trans_id, name, description)
        self.transitions[trans_id] = trans
        self.input_arcs[trans_id] = []
        self.output_arcs[trans_id] = []
        return trans

    def add_input_arc(self, place_id: str, trans_id: str, weight: int = 1) -> Arc:
        if place_id not in self.places:
            raise ValueError(f"Place inconnue: {place_id}")
        if trans_id not in self.transitions:
            raise ValueError(f"Transition inconnue: {trans_id}")
        arc_id = f"{place_id}->{trans_id}"
        arc = Arc(arc_id, place_id, trans_id, weight, "input")
        self.arcs.append(arc)
        self.input_arcs[trans_id].append((place_id, weight))
        return arc

    def add_output_arc(self, trans_id: str, place_id: str, weight: int = 1) -> Arc:
        if trans_id not in self.transitions:
            raise ValueError(f"Transition inconnue: {trans_id}")
        if place_id not in self.places:
            raise ValueError(f"Place inconnue: {place_id}")
        arc_id = f"{trans_id}->{place_id}"
        arc = Arc(arc_id, trans_id, place_id, weight, "output")
        self.arcs.append(arc)
        self.output_arcs[trans_id].append((place_id, weight))
        return arc

    def set_guard(self, trans_id: str, guard_func: Callable[[], Tuple[bool, str]]) -> None:
        if trans_id not in self.transitions:
            raise ValueError(f"Transition inconnue: {trans_id}")
        self.guards[trans_id] = guard_func

    def is_enabled(self, trans_id: str) -> Tuple[bool, str]:
        """
        Vérifie si une transition t est franchissable (activable) sous le marquage courant M.
        Condition formelle : Pour chaque place p en amont, M(p) >= Pre(p, t).
        De plus, toute condition de garde externe associée doit être satisfaite.
        """
        if trans_id not in self.transitions:
            return False, f"Transition {trans_id} inexistante"

        # 1. Vérification formelle du marquage (condition d'entrée des jetons)
        for place_id, weight in self.input_arcs.get(trans_id, []):
            place = self.places[place_id]
            if place.tokens < weight:
                return (
                    False,
                    f"Jetons insuffisants dans {place.id} ({place.name}) : requis {weight}, disponible {place.tokens}",
                )

        # 2. Vérification de la garde externe éventuelle
        if trans_id in self.guards:
            passed, reason = self.guards[trans_id]()
            if not passed:
                return False, reason

        return True, "Transition franchissable"

    def fire(self, trans_id: str) -> Tuple[bool, str]:
        """
        Exécute le franchissement de la transition trans_id :
        M'(p) = M(p) - Pre(p, t) + Post(p, t)
        Retourne (succès, message).
        """
        enabled, reason = self.is_enabled(trans_id)
        if not enabled:
            return False, f"Franchissement refusé : {reason}"

        # Consommer les jetons des places d'entrée
        for place_id, weight in self.input_arcs.get(trans_id, []):
            self.places[place_id].tokens -= weight

        # Produire les jetons dans les places de sortie
        for place_id, weight in self.output_arcs.get(trans_id, []):
            self.places[place_id].tokens += weight

        return True, f"Transition {trans_id} franchie avec succès"

    def get_marking(self) -> Dict[str, int]:
        """Retourne le vecteur de marquage courant."""
        return {p_id: place.tokens for p_id, place in self.places.items()}

    def set_marking(self, marking: Dict[str, int]) -> None:
        """Modifie le marquage courant."""
        for p_id, tokens in marking.items():
            if p_id in self.places:
                self.places[p_id].tokens = tokens

    def reset(self) -> None:
        """Réinitialise le réseau au marquage initial M0."""
        for p_id, tokens in self.initial_marking.items():
            if p_id in self.places:
                self.places[p_id].tokens = tokens

    def get_enabled_transitions(self) -> List[str]:
        """Retourne la liste des IDs de toutes les transitions activables."""
        enabled = []
        for trans_id in self.transitions:
            is_en, _ = self.is_enabled(trans_id)
            if is_en:
                enabled.append(trans_id)
        return enabled
