from datetime import datetime
from flask import make_response, abort, session
from config import db
from models.food_consumption import food_consumption_schema, FoodConsumption, FoodConsumptionSchema
from models.day_consumption import DayConsumption, DayConsumptionSchema, day_consumption_schema
from flask_login import login_required, current_user
import uuid


def create(food_consumption):
    """Création d'une consommation d'aliments"""
    if(current_user.is_anonymous):
        user_id = session.get('user_id')
    else:
        user_id = current_user.id

    can_create = False
    # on vérifie que le jour de consommation où on essaie de créer la consommation appartient bien à l'utilisateur
    existing_day_consumption = DayConsumption.query.filter_by(day_consumption_id=food_consumption['day_consumption_id']).first()
    if(existing_day_consumption):
        if(user_id == existing_day_consumption.user_id):
            can_create = True
        
    if(can_create):
        food_consumption['food_consumption_id'] = str(uuid.uuid1())
        new_food_consumption = food_consumption_schema.load(food_consumption, session=db.session)
        db.session.add(new_food_consumption)
        db.session.commit()
        return food_consumption_schema.dump(new_food_consumption), 201
    else :
        abort(404, f"You have not the required right to create into this day_consumption_id")
        return True

    
@login_required
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
    existing_day_consumption = DayConsumption.query.filter_by(day_consumption_id=day_consumption_id).first()

    if(current_user.is_anonymous):
        user_id = session.get('user_id')
    else:
        user_id = current_user.id

    existing_foods_consumptions = None
    if existing_day_consumption:
        # on vérifie que l'utilisateur qui cherche à accéder à ce jour a bien le droit de le faire
        if existing_day_consumption.user_id == user_id:
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

    if(current_user.is_anonymous):
        user_id = session.get('user_id')
    else:
        user_id = current_user.id

    if(user_id == existing_food_consumption.get_user_id()):
        db.session.delete(existing_food_consumption)
        db.session.commit()
        return make_response(f"{food_consumption_id} successfully deleted", 200)
    abort(404, f"Food consumption with ID {food_consumption_id} not found")
    return True

def update(food_consumption, food_consumption_id):
    """Modifier une consommation"""
    existing_food_consumption = FoodConsumption.query.get(food_consumption_id)

    if(current_user.is_anonymous):
        user_id = session.get('user_id')
    else:
        user_id = current_user.id
    # on vérifie que l'utilisateur qui cherche à accéder à ce jour a bien le droit de le faire
    if existing_food_consumption and existing_food_consumption.get_user_id() == user_id:
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

