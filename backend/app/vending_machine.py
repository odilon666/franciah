"""
Logique métier du Distributeur Automatique couplée au Réseau de Petri.
Gère les boissons, les stocks (places P5, P6, P7), l'argent, la monnaie,
et assure la cohérence stricte avec les règles du Réseau de Petri.
"""

from datetime import datetime
from typing import Dict, List, Optional, Tuple

from app.petri_net import PetriNet
from app.schemas import Drink, HistoryItem, PetriArc, PetriPlace, PetriTransition, VendingState


class VendingMachine:
    DRINKS_CONFIG = {
        "water": {
            "id": "water",
            "name": "Eau Minérale",
            "price": 1000,
            "initial_stock": 5,
            "place_id": "P5",
            "trans_id": "T4",
            "icon": "Droplets",
            "description": "Eau pure et fraîche (50 cl)",
        },
        "soda": {
            "id": "soda",
            "name": "Soda",
            "price": 1500,
            "initial_stock": 5,
            "place_id": "P6",
            "trans_id": "T5",
            "icon": "CupSoda",
            "description": "Boisson gazeuse rafraîchissante (33 cl)",
        },
        "juice": {
            "id": "juice",
            "name": "Jus Naturel",
            "price": 2000,
            "initial_stock": 5,
            "place_id": "P7",
            "trans_id": "T6",
            "icon": "Citrus",
            "description": "Jus de fruits vitaminé (25 cl)",
        },
    }

    def __init__(self):
        self.net = PetriNet()
        self.inserted_amount: int = 0
        self.selected_drink: Optional[str] = None
        self.selected_price: Optional[int] = None
        self.change: int = 0
        self.status_message: str = "Machine disponible - Prête pour une nouvelle transaction"
        self.status_type: str = "info"
        self.last_transition: Optional[str] = None
        self.history: List[HistoryItem] = []
        self.history_counter: int = 0

        self._build_petri_net()

    def _build_petri_net(self):
        """Construit la structure formelle du Réseau de Petri selon la spécification."""
        # 1. PLACES
        self.net.add_place("P1", "Machine disponible", "Machine libre pour démarrer une transaction", tokens=1, category="state")
        self.net.add_place("P2", "Argent inséré", "Crédit présent dans le distributeur", tokens=0, category="state")
        self.net.add_place("P3", "Montant suffisant", "Montant vérifié supérieur ou égal au prix", tokens=0, category="state")
        self.net.add_place("P4", "Boisson sélectionnée", "Choix de boisson validé", tokens=0, category="state")

        # Places de ressources (stocks)
        self.net.add_place("P5", "Stock Eau", "Stock physique d'eau (1 jeton = 1 bouteille)", tokens=5, category="resource")
        self.net.add_place("P6", "Stock Soda", "Stock physique de soda (1 jeton = 1 canette)", tokens=5, category="resource")
        self.net.add_place("P7", "Stock Jus", "Stock physique de jus (1 jeton = 1 brique)", tokens=5, category="resource")

        # Places d'exécution et de sortie
        self.net.add_place("P8", "Distribution en cours", "Mécanisme de distribution activé", tokens=0, category="state")
        self.net.add_place("P9", "Boisson délivrée", "Boisson dans le bac de récupération", tokens=0, category="output")
        self.net.add_place("P10", "Transaction terminée", "Monnaie rendue et boisson servie", tokens=0, category="output")

        # 2. TRANSITIONS
        self.net.add_transition("T1", "Insérer de l'argent", "Insertion d'Ariary par le client (P1 -> P2)")
        self.net.add_transition("T2", "Vérifier le montant", "Validation du crédit suffisant (P2 -> P3)")
        self.net.add_transition("T3", "Sélectionner une boisson", "Validation du choix de boisson (P3 -> P4)")
        self.net.add_transition("T4", "Sélectionner l'eau", "Consommation stock Eau (P4 + P5 -> P8)")
        self.net.add_transition("T5", "Sélectionner le soda", "Consommation stock Soda (P4 + P6 -> P8)")
        self.net.add_transition("T6", "Sélectionner le jus", "Consommation stock Jus (P4 + P7 -> P8)")
        self.net.add_transition("T7", "Lancer la distribution", "Préparation et acheminement du produit (P8 -> P9)")
        self.net.add_transition("T8", "Délivrer la boisson", "Mise à disposition et calcul de la monnaie (P9 -> P10)")
        self.net.add_transition("T9", "Terminer la transaction", "Rendu monnaie et retour machine disponible (P10 -> P1)")

        # 3. ARCS
        # T1 : P1 -> T1 -> P2
        self.net.add_input_arc("P1", "T1", 1)
        self.net.add_output_arc("T1", "P2", 1)

        # T2 : P2 -> T2 -> P3
        self.net.add_input_arc("P2", "T2", 1)
        self.net.add_output_arc("T2", "P3", 1)

        # T3 : P3 -> T3 -> P4
        self.net.add_input_arc("P3", "T3", 1)
        self.net.add_output_arc("T3", "P4", 1)

        # T4 (Eau) : P4 + P5 -> T4 -> P8
        self.net.add_input_arc("P4", "T4", 1)
        self.net.add_input_arc("P5", "T4", 1)
        self.net.add_output_arc("T4", "P8", 1)

        # T5 (Soda) : P4 + P6 -> T5 -> P8
        self.net.add_input_arc("P4", "T5", 1)
        self.net.add_input_arc("P6", "T5", 1)
        self.net.add_output_arc("T5", "P8", 1)

        # T6 (Jus) : P4 + P7 -> T6 -> P8
        self.net.add_input_arc("P4", "T6", 1)
        self.net.add_input_arc("P7", "T6", 1)
        self.net.add_output_arc("T6", "P8", 1)

        # T7 : P8 -> T7 -> P9
        self.net.add_input_arc("P8", "T7", 1)
        self.net.add_output_arc("T7", "P9", 1)

        # T8 : P9 -> T8 -> P10
        self.net.add_input_arc("P9", "T8", 1)
        self.net.add_output_arc("T8", "P10", 1)

        # T9 : P10 -> T9 -> P1
        self.net.add_input_arc("P10", "T9", 1)
        self.net.add_output_arc("T9", "P1", 1)

        # 4. GARDES SPÉCIFIQUES
        self.net.set_guard("T2", self._guard_t2)
        self.net.set_guard("T4", lambda: self._guard_drink_selection("water"))
        self.net.set_guard("T5", lambda: self._guard_drink_selection("soda"))
        self.net.set_guard("T6", lambda: self._guard_drink_selection("juice"))

    def _guard_t2(self) -> Tuple[bool, str]:
        """Garde pour T2 : Montant inséré suffisant pour la boisson sélectionnée."""
        if not self.selected_drink:
            # Si aucune boisson n'est encore sélectionnée, vérifier si le montant permet au moins l'eau (1000 Ar)
            min_price = min(cfg["price"] for cfg in self.DRINKS_CONFIG.values())
            if self.inserted_amount < min_price:
                return False, f"Montant insuffisant ({self.inserted_amount} Ar). Le montant minimum est de {min_price} Ar."
            return True, "Montant suffisant pour au moins une boisson"

        drink_cfg = self.DRINKS_CONFIG[self.selected_drink]
        needed = drink_cfg["price"]
        if self.inserted_amount < needed:
            return False, f"Montant insuffisant pour {drink_cfg['name']} : {self.inserted_amount} Ar inséré(s), {needed} Ar requis."
        return True, f"Montant suffisant ({self.inserted_amount} Ar >= {needed} Ar)"

    def _guard_drink_selection(self, drink_key: str) -> Tuple[bool, str]:
        """Garde pour T4, T5, T6 : vérifie le stock et la cohérence du choix."""
        drink_cfg = self.DRINKS_CONFIG[drink_key]
        place_id = drink_cfg["place_id"]
        stock = self.net.places[place_id].tokens
        if stock <= 0:
            return False, f"{drink_cfg['name']} indisponible : stock épuisé (0 jeton dans {place_id})"

        if self.selected_drink and self.selected_drink != drink_key:
            return False, f"La boisson sélectionnée est {self.DRINKS_CONFIG[self.selected_drink]['name']}, pas {drink_cfg['name']}."

        return True, f"Stock suffisant pour {drink_cfg['name']} ({stock} restant(s))"

    def insert_money(self, amount: int) -> Tuple[bool, str]:
        """
        Insère un montant en Ariary.
        Règle 1 : Une transaction peut commencer uniquement si P1 contient un jeton.
        Si la transaction est déjà en cours dans l'étape d'insertion (P2=1),
        le client peut ajouter de l'argent supplémentaire.
        """
        if amount <= 0:
            return False, "Le montant inséré doit être strictement positif."

        marking = self.net.get_marking()

        # Si P1 a un jeton, nous franchissons formellement T1
        if marking["P1"] >= 1:
            success, msg = self.net.fire("T1")
            if not success:
                return False, msg
            self.inserted_amount = amount
            self.last_transition = "T1"
            self.status_message = f"Argent inséré : {amount} Ar. Total : {self.inserted_amount} Ar."
            self.status_type = "info"
            self._log_history("T1", "Insérer de l'argent", f"Insertion initiale de {amount} Ar. Total : {self.inserted_amount} Ar.")
            return True, f"Argent inséré : {amount} Ar."

        # Si on est déjà dans l'état P2 (Argent inséré), on peut rajouter de l'argent
        elif marking["P2"] >= 1:
            self.inserted_amount += amount
            self.status_message = f"Ajout de {amount} Ar. Total inséré : {self.inserted_amount} Ar."
            self.status_type = "info"
            self._log_history("T1", "Insérer de l'argent", f"Complément de {amount} Ar inséré. Total cumulé : {self.inserted_amount} Ar.")
            return True, f"Montant ajouté : {amount} Ar. Total : {self.inserted_amount} Ar."

        else:
            return False, "Impossible d'insérer de l'argent dans l'état actuel de la machine."

    def select_drink(self, drink_id: str) -> Tuple[bool, str]:
        """
        Sélectionne une boisson parmi water, soda, juice.
        Peut être fait au début ou pendant les étapes P1, P2, P3, P4.
        Si la machine est en P4 (jeton dans P4), sélectionner la boisson
        déclenche directement la transition correspondante (T4, T5 ou T6).
        """
        if drink_id not in self.DRINKS_CONFIG:
            return False, f"Boisson inconnue : {drink_id}"

        drink_cfg = self.DRINKS_CONFIG[drink_id]
        place_id = drink_cfg["place_id"]
        stock = self.net.places[place_id].tokens

        if stock <= 0:
            self.status_message = f"{drink_cfg['name']} indisponible : stock épuisé"
            self.status_type = "error"
            return False, self.status_message

        self.selected_drink = drink_id
        self.selected_price = drink_cfg["price"]

        marking = self.net.get_marking()

        # Si nous sommes à l'état P4 (Boisson sélectionnée), déclencher la transition de stock associée
        if marking["P4"] >= 1:
            trans_id = drink_cfg["trans_id"]
            return self.fire_transition(trans_id)

        # Si nous sommes à l'étape P3 (Montant suffisant), et que l'utilisateur clique sur la boisson
        if marking["P3"] >= 1:
            # On franchit d'abord T3 pour passer à P4, puis la transition de sélection
            success, msg = self.net.fire("T3")
            if success:
                self.last_transition = "T3"
                self._log_history("T3", "Sélectionner une boisson", f"Validation sélection boisson : {drink_cfg['name']}")
                trans_id = drink_cfg["trans_id"]
                return self.fire_transition(trans_id)

        self.status_message = f"Boisson sélectionnée : {drink_cfg['name']} ({drink_cfg['price']} Ar)"
        self.status_type = "info"
        return True, self.status_message

    def fire_transition(self, trans_id: str) -> Tuple[bool, str]:
        """
        Déclenche manuellement une transition du Réseau de Petri si elle est activée.
        """
        if trans_id not in self.net.transitions:
            return False, f"Transition inconnue : {trans_id}"

        # Cas particuliers avec logique métier
        if trans_id == "T1":
            if self.inserted_amount == 0:
                # Montant par défaut pour T1 si déclenché directement
                return self.insert_money(1000)
            else:
                success, msg = self.net.fire("T1")
                if success:
                    self.last_transition = "T1"
                    self._log_history("T1", "Insérer de l'argent", f"Argent inséré ({self.inserted_amount} Ar)")
                return success, msg

        if trans_id == "T2":
            # Vérification du montant
            if not self.selected_drink:
                # Vérifier si l'utilisateur a inséré au moins le prix de la boisson la moins chère
                min_price = min(cfg["price"] for cfg in self.DRINKS_CONFIG.values())
                if self.inserted_amount < min_price:
                    self.status_message = f"Distribution impossible : montant insuffisant ({self.inserted_amount} Ar < {min_price} Ar)"
                    self.status_type = "error"
                    return False, self.status_message
            else:
                needed = self.DRINKS_CONFIG[self.selected_drink]["price"]
                if self.inserted_amount < needed:
                    diff = needed - self.inserted_amount
                    self.status_message = f"Distribution impossible : montant insuffisant (manque {diff} Ar)"
                    self.status_type = "error"
                    return False, self.status_message

            success, msg = self.net.fire("T2")
            if success:
                self.last_transition = "T2"
                self.status_message = "Montant suffisant vérifié"
                self.status_type = "success"
                self._log_history("T2", "Vérifier le montant", f"Montant vérifié : {self.inserted_amount} Ar (Suffisant)")
                return True, "Montant vérifié avec succès"
            return False, msg

        if trans_id == "T3":
            success, msg = self.net.fire("T3")
            if success:
                self.last_transition = "T3"
                drink_name = self.DRINKS_CONFIG[self.selected_drink]["name"] if self.selected_drink else "Boisson"
                self.status_message = f"Boisson sélectionnée validée ({drink_name})"
                self.status_type = "info"
                self._log_history("T3", "Sélectionner une boisson", f"Sélection de {drink_name}")
                return True, "Boisson sélectionnée avec succès"
            return False, msg

        if trans_id in ("T4", "T5", "T6"):
            drink_key = "water" if trans_id == "T4" else ("soda" if trans_id == "T5" else "juice")
            drink_cfg = self.DRINKS_CONFIG[drink_key]

            # Vérifier stock
            stock = self.net.places[drink_cfg["place_id"]].tokens
            if stock <= 0:
                self.status_message = f"{drink_cfg['name']} indisponible : stock épuisé"
                self.status_type = "error"
                return False, self.status_message

            # Mettre à jour la sélection si nécessaire
            self.selected_drink = drink_key
            self.selected_price = drink_cfg["price"]

            success, msg = self.net.fire(trans_id)
            if success:
                self.last_transition = trans_id
                remaining_stock = self.net.places[drink_cfg["place_id"]].tokens
                self.status_message = f"{drink_cfg['name']} sélectionné(e) (Stock restant : {remaining_stock})"
                self.status_type = "success"
                self._log_history(
                    trans_id,
                    f"Sélectionner {drink_cfg['name']}",
                    f"{drink_cfg['name']} sélectionné (Stock {drink_cfg['place_id']} : {stock} -> {remaining_stock})",
                )
                return True, f"{drink_cfg['name']} sélectionné"
            return False, msg

        if trans_id == "T7":
            # Lancer la distribution
            success, msg = self.net.fire("T7")
            if success:
                self.last_transition = "T7"
                self.status_message = "Distribution en cours..."
                self.status_type = "info"
                self._log_history("T7", "Lancer la distribution", "Distribution lancée")
                return True, "Distribution lancée"
            return False, msg

        if trans_id == "T8":
            # Délivrer la boisson et calculer la monnaie
            success, msg = self.net.fire("T8")
            if success:
                self.last_transition = "T8"
                price = self.selected_price if self.selected_price else 0
                if self.inserted_amount >= price:
                    self.change = self.inserted_amount - price
                else:
                    self.change = 0

                drink_name = self.DRINKS_CONFIG[self.selected_drink]["name"] if self.selected_drink else "Boisson"
                self.status_message = f"Boisson délivrée : {drink_name} ! Monnaie à rendre : {self.change} Ar."
                self.status_type = "success"
                self._log_history(
                    "T8",
                    "Délivrer la boisson",
                    f"Boisson {drink_name} délivrée. Prix: {price} Ar, Inséré: {self.inserted_amount} Ar, Monnaie: {self.change} Ar",
                )
                return True, "Boisson délivrée"
            return False, msg

        if trans_id == "T9":
            # Terminer la transaction et retour à l'état initial P1
            success, msg = self.net.fire("T9")
            if success:
                self.last_transition = "T9"
                rendered_change = self.change
                # Remise à zéro pour le prochain client tout en gardant l'historique et les stocks
                self.inserted_amount = 0
                self.selected_drink = None
                self.selected_price = None
                self.change = 0
                self.status_message = f"Transaction terminée. Monnaie restituée ({rendered_change} Ar). Machine disponible."
                self.status_type = "success"
                self._log_history(
                    "T9",
                    "Terminer la transaction",
                    f"Transaction terminée. Restitution de {rendered_change} Ar de monnaie. Machine prête pour un nouvel achat.",
                )
                return True, "Transaction terminée"
            return False, msg

        return False, f"Transition {trans_id} non gérée"

    def reset_simulation(self) -> None:
        """
        Réinitialise la simulation à l'état initial strict :
        M0 = (1, 0, 0, 0, 5, 5, 5, 0, 0, 0)
        montantInsere = 0, selectedDrink = None, change = 0, history = []
        """
        self.net.reset()
        self.inserted_amount = 0
        self.selected_drink = None
        self.selected_price = None
        self.change = 0
        self.status_message = "Simulation réinitialisée au marquage M0. Machine disponible."
        self.status_type = "info"
        self.last_transition = None
        self.history.clear()
        self.history_counter = 0

    def _log_history(self, trans_id: str, trans_name: str, description: str):
        self.history_counter += 1
        entry = HistoryItem(
            id=self.history_counter,
            transition_id=trans_id,
            transition_name=trans_name,
            action_description=description,
            timestamp=datetime.now().strftime("%H:%M:%S"),
            marking_after=self.net.get_marking(),
            inserted_amount=self.inserted_amount,
            change=self.change,
        )
        self.history.append(entry)

    def get_state(self) -> VendingState:
        marking = self.net.get_marking()
        enabled = self.net.get_enabled_transitions()
        machine_available = marking.get("P1", 0) >= 1

        stocks = {
            "water": marking.get("P5", 0),
            "soda": marking.get("P6", 0),
            "juice": marking.get("P7", 0),
        }

        return VendingState(
            machine_available=machine_available,
            inserted_amount=self.inserted_amount,
            selected_drink=self.selected_drink,
            selected_price=self.selected_price,
            change=self.change,
            stocks=stocks,
            marking=marking,
            enabled_transitions=enabled,
            last_transition=self.last_transition,
            status_message=self.status_message,
            status_type=self.status_type,
        )

    def get_places(self) -> List[PetriPlace]:
        return [
            PetriPlace(
                id=p.id,
                name=p.name,
                description=p.description,
                tokens=p.tokens,
                category=p.category,
            )
            for p in self.net.places.values()
        ]

    def get_transitions(self) -> List[PetriTransition]:
        enabled_list = self.net.get_enabled_transitions()
        result = []
        for t in self.net.transitions.values():
            is_en = t.id in enabled_list
            reason = None
            if not is_en:
                _, reason = self.net.is_enabled(t.id)

            input_places = [p_id for p_id, _ in self.net.input_arcs.get(t.id, [])]
            output_places = [p_id for p_id, _ in self.net.output_arcs.get(t.id, [])]

            result.append(
                PetriTransition(
                    id=t.id,
                    name=t.name,
                    description=t.description,
                    is_enabled=is_en,
                    disabled_reason=reason,
                    input_places=input_places,
                    output_places=output_places,
                )
            )
        return result

    def get_arcs(self) -> List[PetriArc]:
        return [
            PetriArc(
                id=a.id,
                source=a.source,
                target=a.target,
                weight=a.weight,
                arc_type=a.arc_type,
            )
            for a in self.net.arcs
        ]

    def get_drinks(self) -> List[Drink]:
        marking = self.net.get_marking()
        return [
            Drink(
                id=cfg["id"],
                name=cfg["name"],
                price=cfg["price"],
                stock=marking.get(cfg["place_id"], 0),
                place_id=cfg["place_id"],
                transition_id=cfg["trans_id"],
                icon=cfg["icon"],
                description=cfg["description"],
            )
            for cfg in self.DRINKS_CONFIG.values()
        ]
