from datetime import datetime
from flask import make_response, abort, session
from config import db
from models.food_consumption import food_consumption_schema, FoodConsumption, FoodConsumptionSchema
from models.day_consumption import DayConsumption, DayConsumptionSchema, day_consumption_schema
from flask_login import login_required, current_user
import uuid


def create(food_consumption):
    """Création d'une consommation d'aliments"""
    food_consumption['food_consumption_id'] = str(uuid.uuid1())
    new_food_consumption = food_consumption_schema.load(food_consumption, session=db.session)
    db.session.add(new_food_consumption)
    db.session.commit()
    return food_consumption_schema.dump(new_food_consumption), 201

def read_all():
    """Lire toutes les consommations d'aliments pour l'utilsateur courant"""
    if(current_user.is_anonymous):
        user_id = session.get('user_id')
    else:
        user_id = current_user.id
    day_consumptions = DayConsumption.query.filter_by(user_id=user_id).all()
    food_consumptions = []
    for day_consumption in day_consumptions:
        # Pour chaque jour, on récupère l'identifiant du jour et on récupère les consommation du jour
        day_consumption = day_consumption_schema.dump(day_consumption)
        day_consumption_id = day_consumption['day_consumption_id']
        food_consumptions_day = FoodConsumption.query.filter_by(day_consumption_id=day_consumption_id).all()
        food_consumptions += food_consumptions_day
    food_consumptions_schema = FoodConsumptionSchema(many=True)
    return food_consumptions_schema.dump(food_consumptions)

def read_all_for_day(day_consumption_id):
    """Lire un jour de consommation specifique"""
    existing_foods_consumptions = FoodConsumption.query.filter_by(day_consumption_id=day_consumption_id).all()
    if existing_foods_consumptions:
        food_consumptions_schema = FoodConsumptionSchema(many=True)
        return food_consumptions_schema.dump(existing_foods_consumptions), 201
    else :
        return [], 201
    #abort(404, f"Foods Consumptions with day_consumption_id {day_consumption_id} not found")
    #return True
    
def delete(food_consumption_id):
    """Supprimer une consommation d'aliments"""
    existing_food_consumption = FoodConsumption.query.get(food_consumption_id)
    if existing_food_consumption:
        db.session.delete(existing_food_consumption)
        db.session.commit()
        return make_response(f"{food_consumption_id} successfully deleted", 200)
    abort(404, f"Food consumption with ID {food_consumption_id} not found")
    return True

def update(food_consumption, food_consumption_id):
    """Modifier un jour de consommation"""
    existing_food_consumption = FoodConsumption.query.get(food_consumption_id)
    if existing_food_consumption:
        updated_food_consumption = food_consumption_schema.load(food_consumption, session=db.session)
        existing_food_consumption.quantity = updated_food_consumption.quantity
        existing_food_consumption.ref_id = updated_food_consumption.ref_id
        existing_food_consumption.color =  updated_food_consumption.color
        existing_food_consumption.unit =  updated_food_consumption.unit
        existing_food_consumption.comment =  updated_food_consumption.comment
        db.session.merge(existing_food_consumption)
        db.session.commit()
        return food_consumption_schema.dump(existing_food_consumption), 201
    abort(404, f"Food consumption with ID {food_consumption_id} not found")
    return True

