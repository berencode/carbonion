from flask import render_template, request, url_for, redirect, session
from werkzeug.security import generate_password_hash, check_password_hash
from demo import bp
from models.user import User
from config import db
import uuid 
from models.day_consumption import DayConsumption, day_consumption_schema
from models.food_consumption import FoodConsumption
from api import challenge
from flask_login import current_user



@bp.before_request
def assign_unique_id():
    print("qmsoerqmoseirjmqoseij")
    if current_user.is_anonymous :
        print("qmoseirmqoseiur")
        print(session.get('user_id'))
        if 'user_id' not in session:
            user_id = str(uuid.uuid4())
            session['user_id'] = user_id
            print("On va créer un challenge factice")
            challenge.create({'day_number' : 1, 'status' : 0})

@bp.route('/')
def demo():
    """
        Affichage général des jours de consommation
    """     
    return render_template('demo.html',
        current_user=current_user
    )