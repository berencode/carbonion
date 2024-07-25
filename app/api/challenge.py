from datetime import datetime
from flask import make_response, abort
from api.day_consumption import create as create_day_consumption
from api.day_consumption import read_one as read_one_day_consumption
from api.day_consumption import delete as delete_day_consumption
from config import db
from models.challenge import challenge_schema, Challenge, ChallengeSchema
from models.day_consumption import DayConsumption, DayConsumptionSchema
from flask_login import login_required, current_user
import uuid
import random

def get_random_color():
    """Permet d'obtenir une couleur aléatoire"""
    random_colors = [
        "#3498db",  # Blue
        "#e74c3c",  # Red
        "#2ecc71",  # Green
        "#f39c12",  # Orange
        "#1abc9c",  # Turquoise
        "#9b59b6",  # Purple
        "#2c3e50",  # Dark Gray
        "#e67e22",  # Carrot
        "#27ae60",  # Nephritis
        "#c0392b",  # Pomegranate
    ]
    return random.choice(random_colors)

def all_challenge_terminated(user):
    """ Vérifie que tous les challenges de l'utilisateur sont terminés"""
    challenges = Challenge.query.filter_by(user_id=user.id).all()
    is_all_terminated = True
    for challenge in challenges :
        if not is_terminated(challenge.challenge_id):
            is_all_terminated = False
    return is_all_terminated

def is_terminated(challenge_id):
    """
        Vérifie qu'un challenge est terminé, c'est à dire que tous les jours 
        de consommations sont cloturés
    """
    challenge = Challenge.query.filter_by(challenge_id=challenge_id).first()
    if challenge:
        # si le challenge existe, on doit récupère tous les jours de consommations
        day_consumptions = DayConsumption.query.filter_by(challenge_id=challenge_id).all()
        is_all_finished = True
        for day_consumption in day_consumptions :
            if not day_consumption.is_finished:
                is_all_finished = False
        return is_all_finished
    return False



@login_required
def create(challenge):
    """Création d'un nouveau challenge"""
    challenge['challenge_id'] = str(uuid.uuid1())

    if all_challenge_terminated(current_user):
        challenge['user_id'] = current_user.id
        challenge['color'] = get_random_color()
        challenge['name'] = "Nouveau challenge"
        for i in range(0, int(challenge['day_number'])):
            # on initialise chaque jour
            day_consumption = {}
            day_consumption['challenge_id'] = challenge['challenge_id']
            day_consumption['_index'] = i
            create_day_consumption(day_consumption)

        new_challenge = challenge_schema.load(challenge, session=db.session)
        db.session.add(new_challenge)
        db.session.commit()
        return challenge_schema.dump(new_challenge), 201

    return {}, 201

@login_required
def read_all():
    """Lire tous les challenges de l'utilisateur courant"""
    existing_challenges = Challenge.query.filter_by(user_id=current_user.id).all()
    if existing_challenges:
        challenges_schema = ChallengeSchema(many=True)
        challenges_data = challenges_schema.dump(existing_challenges)
        # Add termination status to each challenge
        for challenge in challenges_data:
            challenge_id = challenge['challenge_id']
            challenge['is_terminated'] = is_terminated(challenge_id)
        return challenges_data, 201
    return [], 201


@login_required
def read_one(challenge_id):
    """Lire un challenge en particulier"""
    existing_challenge = Challenge.query.get(challenge_id)
    if existing_challenge:
        challenge = challenge_schema.dump(existing_challenge)
        # ajout des informations utiles par la suite
        challenge['is_terminated'] = is_terminated(challenge_id)
        return challenge, 201
    abort(404, f"Challenge with ID {challenge_id} not found")
    return True

@login_required
def update(challenge, challenge_id):
    """Modifier un challenge"""
    existing_challenge = Challenge.query.get(challenge_id)
    old_day_number = int(existing_challenge.day_number)
    if existing_challenge:
        updated_challenge = challenge_schema.load(challenge, session=db.session)
        new_day_number = int(updated_challenge.day_number)
        print(old_day_number, new_day_number)
        if old_day_number < new_day_number:
            # on doit créer des nouveaux jours
            for i in range(int(old_day_number), int(new_day_number)):
                # on initialise chaque nouveau jour
                day_consumption = {}
                day_consumption['challenge_id'] = updated_challenge.challenge_id
                day_consumption['_index'] = i
                create_day_consumption(day_consumption)
        elif old_day_number > new_day_number:
            # on doit supprimer les jours existants
            day_consumptions = DayConsumption.query.filter_by(challenge_id=challenge_id).filter(DayConsumption._index>=new_day_number).all()
            for day_consumption in day_consumptions:
                delete_day_consumption(day_consumption.day_consumption_id)
        existing_challenge.day_number = updated_challenge.day_number
        existing_challenge.name = updated_challenge.name
        db.session.merge(existing_challenge)
        db.session.commit()
        return challenge_schema.dump(existing_challenge), 201
    abort(404, f"Challenge with ID {challenge_id} not found")
    return True

@login_required
def delete(challenge_id):
    """Supprimer une consommation d'aliments"""
    existing_challenge = Challenge.query.get(challenge_id)
    if existing_challenge:
        # chargement de tous les jours de consommation liés au challenge
        day_consumptions_data = DayConsumption.query.filter_by(challenge_id=challenge_id).all()
        day_consumptions_schema = DayConsumptionSchema(many=True)
        day_consumptions = day_consumptions_schema.dump(day_consumptions_data)
        for day_consumption in day_consumptions:
            # suppression du jour de consommation
            print("day_consumption : ", day_consumption)
            delete_day_consumption(day_consumption['day_consumption_id'])
        db.session.delete(existing_challenge)
        db.session.commit()
        return make_response(f"{challenge_id} successfully deleted", 200)
    abort(404, f"Food consumption with ID {challenge_id} not found")
    return True
