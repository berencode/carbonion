from datetime import datetime
from flask import make_response, abort
from config import db
from models.food import food_schema, Food, FoodSchema
from flask_login import current_user
import uuid

def read_all():
    """Lire tous les aliments"""
    food_consumptions = Food.query.all()
    food_consumptions_schema = FoodSchema(many=True)
    return food_consumptions_schema.dump(food_consumptions)

def read_one(code_agb):
    """Lire un jour de consommation specifique"""
    existing_food = Food.query.get(code_agb)
    if existing_food:
        return food_schema.dump(existing_food), 201
    abort(404, f"Food with code_agb {code_agb} not found")
    return True