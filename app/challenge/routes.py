from flask import render_template, request, url_for, redirect
from werkzeug.security import generate_password_hash, check_password_hash
from challenge import bp
from flask_login import login_user, login_required, logout_user, current_user
from models.user import User
from config import db
import uuid 
from models.day_consumption import DayConsumption, day_consumption_schema
from models.food_consumption import FoodConsumption



@bp.route('/')
@login_required
def challenge():
    """
        Affichage général des challenges
    """
    days_consumption = DayConsumption.query.all()
    
    challenge_is_empty = request.args.get('challenge_is_empty')
    
    if(len(days_consumption) > 0):
        current_day_consumption = DayConsumption.query.all()[0]
        current_day_consumption_id = current_day_consumption.day_consumption_id
        current_foods_consumption =  FoodConsumption.query.filter_by(day_consumption_id=current_day_consumption_id).all()
    else :
        current_day_consumption = None
        current_foods_consumption = []
    
    print("RENDER NEW TEMPLATE :", current_day_consumption)
    return render_template('challenge.html',
                           current_user=current_user,
                           current_day_consumption = current_day_consumption,
                           days_consumption = days_consumption,
                           current_foods_consumption = current_foods_consumption,
                           challenge_is_empty = challenge_is_empty
    )