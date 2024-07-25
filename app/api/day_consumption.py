from datetime import datetime
from flask import make_response, abort
from config import db
from models.day_consumption import day_consumption_schema, DayConsumption,DayConsumptionSchema
from api.food_consumption import delete as delete_food_consumption
from flask_login import login_required, current_user
import uuid
from models.food_consumption import FoodConsumption, FoodConsumptionSchema


@login_required
def create(day_consumption):
    """Création d'un jour de consommation d'aliments"""
    day_consumption['day_consumption_id'] = str(uuid.uuid1())
    if current_user.is_authenticated:
        day_consumption['user_id'] = current_user.id
        day_consumption['is_finished'] = False
        
    new_day_consumption = day_consumption_schema.load(day_consumption, session=db.session)
    db.session.add(new_day_consumption)
    db.session.commit()
    return day_consumption_schema.dump(new_day_consumption), 201

@login_required
def read_all():
    """Lire tous les jours de consommation de l'utilisateur courant"""
    day_consumptions = DayConsumption.query.filter_by(user_id=current_user.id).order_by(DayConsumption._index.asc()).all()
    day_consumptions_schema = DayConsumptionSchema(many=True)
    return day_consumptions_schema.dump(day_consumptions)

@login_required
def read_one(day_consumption_id):
    """Lire un jour de consommation specifique"""
    existing_day_consumption = DayConsumption.query.get(day_consumption_id)
    if existing_day_consumption:
        return day_consumption_schema.dump(existing_day_consumption), 201
    abort(404, f"DayConsumption with ID {day_consumption_id} not found")
    return True

@login_required
def delete(day_consumption_id):
    """Supprimer un jour de consommation"""
    existing_day_consumption = DayConsumption.query.get(day_consumption_id)
    if existing_day_consumption:
        food_consumptions_data = FoodConsumption.query.filter_by(day_consumption_id=day_consumption_id).all()
        food_consumptions_schema = FoodConsumptionSchema(many=True)
        food_consumptions = food_consumptions_schema.dump(food_consumptions_data)
        for food_consumption in food_consumptions:
            # suppression de la consommation lié au jour de consommation
            delete_food_consumption(food_consumption['food_consumption_id'])
        db.session.delete(existing_day_consumption)
        db.session.commit()
        return make_response(f"{day_consumption_id} successfully deleted", 200)
    abort(404, f"DayConsumption with ID {day_consumption_id} not found")
    return True

@login_required
def update(day_consumption, day_consumption_id):
    """Modifier un jour de consommation"""
    existing_day_consumption = DayConsumption.query.get(day_consumption_id)
    if existing_day_consumption:
        update_person = day_consumption_schema.load(day_consumption, session=db.session)
        existing_day_consumption.day_consumption_id = update_person.day_consumption_id
        existing_day_consumption.date = update_person.date
        db.session.merge(existing_day_consumption)
        db.session.commit()
        return day_consumption_schema.dump(existing_day_consumption), 201
    abort(404, f"DayConsumption with ID {day_consumption_id} not found")
    return True
