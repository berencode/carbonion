from flask import render_template, request, url_for, redirect
from werkzeug.security import generate_password_hash, check_password_hash
from statement import bp
from flask_login import login_user, login_required, logout_user, current_user
from models.user import User
from config import db
import uuid 
from models.day_consumption import DayConsumption, day_consumption_schema
from models.food_consumption import FoodConsumption



@bp.route('/')
@login_required
def statement():
    """
        Affichage général des jours de consommation
    """
    return render_template('statement.html',
                        current_user=current_user
    )
