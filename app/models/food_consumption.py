from config import db, ma
from models.day_consumption import DayConsumption, DayConsumptionSchema


class FoodConsumption(db.Model):
    """
        Représente la consommation d'un aliment
    """
    __tablename__ = "food_consumption"
    food_consumption_id = db.Column(db.String(100), primary_key=True) # primary keys are required by SQLAlchemy
    ref_id = db.Column(db.String(100))  # Clé étrangère vers l'aliment consommé
    quantity = db.Column(db.Float())    # Quantité
    unit = db.Column(db.String(30))     # Unité de la quantitée
    meal_type_id = db.Column(db.String(30))   # Identifiant du type de repas auquel la consommation d'aliment est attaché
    color = db.Column(db.String(30))    # Couleur de l'aliment
    comment = db.Column(db.String(200)) # Commentaire sur l'aliment
    day_consumption_id = db.Column(db.String(100)) # Clé étrangère vers le jour de consommation où la consommation est déclarée
    def __repr__(self):
        return f'<FoodConsumption "{self.food_consumption_id}">'


    def get_user_id(self):
        existing_day_consumption = DayConsumption.query.filter_by(day_consumption_id=self.day_consumption_id).first()
        if(existing_day_consumption):
            return existing_day_consumption.user_id
        return False


class FoodConsumptionSchema(ma.SQLAlchemyAutoSchema):
    """doc"""
    class Meta:
        model = FoodConsumption
        load_instance = True
        sqla_session = db.session
        
food_consumption_schema = FoodConsumptionSchema()