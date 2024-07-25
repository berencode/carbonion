from flask.cli import FlaskGroup
from datetime import datetime
from app import app
from config import db
from models.user import User
from models.user import user_schema
from models.food import food_schema
from models.new import new_schema
from models.challenge import challenge_schema
from models.indicator import indicator_schema
from models.day_consumption import DayConsumptionSchema
from models.food_consumption import FoodConsumptionSchema
import pandas as pd
import json
import sys

cli = FlaskGroup(app)

def create_initial_data():
    """Insertion des données initiales dans la base de données"""
    # Insertion de l'utilisateur admin
    user_data = {
        "id": "68d1b91b-fd1d-4d7f-9b58-3912dd9ad23e", 
        'mail': 'admin', 
        'password' : 'sha256$2aIwJvL5wyOVy44M$b647244dda1675acb69104c5985f8e6674119b44999c6e4d97514941a906d47e', 
        'activated' : True
    }
    user_instance = user_schema.load(user_data)
    db.session.add(user_instance)

    # Insertion de l'actualité initiale
    new_data = {
        'new_id' : "68d1b91b-abcd-efgh-9b58-3912dd9ad23e",
        'creation_date' : '2024-03-01 10:35:49.301643',
        'title' : 'Carbonion est né !',
        'text' : 'Après plusieurs mois de travail, la première version de Carbonion est disponible.'
    }
    new_instance = new_schema.load(new_data)
    db.session.add(new_instance)

    # Insertion des données de référentiel
    df = pd.read_csv('data/result.csv', index_col = 0)

    for i in range(0, len(df)):
        line = df.iloc[i]
        food_data = line.to_dict()
        food_instance = food_schema.load(food_data)
        db.session.add(food_instance)
    
    print(food_instance)
    # Insertion des types d'indicateurs par défaut
    indicators = []
    # Ajout de l'empreinte carbone
    indicators.append({
        'indicator_id' : "carbone",
        'label' : 'Empreinte carbone',                  
        'color' : 'black',
        'unit' : 'kg éq.CO2', 
        'column' : 'kg_CO2_eq'
    })
    
    # Ajout de l'utilisation du sol
    indicators.append({
        'indicator_id' : "utilisation_sol",
        'label' : 'Utilisation du sol',                  
        'color' : 'blue',
        'unit' : 'Pt',
        'column' : 'Pt_utilisation_sol_eq', 
    })
    
    # Ajout de l'utilisation d'eau
    indicators.append({
        'indicator_id' : "utilisation_eau",
        'label' : "Utilisation d'eau",                  
        'color' : 'blue',
        'unit' : 'm3',
        'column' : 'm3_consommation_eau_eq', 
    })
    
    # Ajout de l'acidification des océans
    indicators.append({
        'indicator_id' : "acidification_ocean",
        'label' : "Acidification des océans",                  
        'color' : 'blue',
        'unit' : 'mol',
        'column' : 'mol_acidification_kg_eq', 
    })
    
    indicator_instance = indicator_schema.load(indicators, many=True)
    db.session.bulk_save_objects(indicator_instance)
    
    # Commit the changes to the database
    #db.session.commit()
    print("Insertion des données initiales terminée.")

@cli.command("maj_data")
def maj_data():
    print("Mise à jour des données")
    create_initial_data()
    db.session.commit()

@cli.command("create_db")
def create_db():
    print("Création des bases de données")
    db.drop_all()
    db.create_all()
    create_initial_data()
    db.session.commit()


if __name__ == "__main__":
    print("LANCEMENT PRINCIPAL")
    cli()