from config import db, ma

class Food(db.Model):
    """
        Représente un aliment
    """
    __tablename__ = "food"
    code_agb = db.Column(db.String(500), primary_key=True)  # primary keys are required by SQLAlchemy
    groupe_aliment = db.Column(db.String(500))              # Clé étrangère vers l'aliment consommé
    sous_groupe_aliment = db.Column(db.String(500))         # Clé étrangère vers l'aliment consommé
    nom_produit = db.Column(db.String(500))                     # Quantité
    lci_name = db.Column(db.String(500))                     # Unité de la quantitée
    code_saison = db.Column(db.Integer)                   # Couleur de l'aliment
    code_avion = db.Column(db.Integer)                    # Commentaire sur l'aliment
    kg_CO2_eq = db.Column(db.Float(10))
    Pt_utilisation_sol_eq = db.Column(db.Float(10))
    m3_consommation_eau_eq = db.Column(db.Float(10))
    mol_acidification_kg_eq = db.Column(db.Float(10))
    groupe_aliment_color = db.Column(db.String(500))
    def __repr__(self):
        return f'<Food "{self.code_agb}">'


class FoodSchema(ma.SQLAlchemyAutoSchema):
    """doc"""
    class Meta:
        model = Food
        load_instance = True
        sqla_session = db.session

food_schema = FoodSchema()