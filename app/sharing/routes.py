from flask import render_template, request, url_for, redirect, session
from werkzeug.security import generate_password_hash, check_password_hash
from sharing import bp
from models.user import User
from config import db
import uuid 
from models.day_consumption import DayConsumption, day_consumption_schema
from models.food_consumption import FoodConsumption
from api import challenge
from flask_login import current_user






@bp.route('/<share_link>', methods=['GET'])
def share_content(share_link):
    """
        L'utilisateur cherche à accéder à ce lien de partage. On doit vérifier que l'utilisateur accepte toujours
        que ce lien soit partageable.
    """
    # on sélectionne le jour de consommation en question
    day_consumption = DayConsumption.query.get(share_link)

    if(day_consumption.want_share):
    #days_consumption = DayConsumption.query.all()
        return render_template('sharing.html', day_consumption=day_consumption)
    else:
        print("Vous n'avez pas le droit d'être ici !")
        return render_template('not_allowed.html')