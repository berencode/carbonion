from main import bp
from flask import render_template, current_app
from flask_login import login_required, current_user
import os

@bp.route('/')
def index():
    return render_template('index.html', 
        current_user=current_user, 
        instance_name=os.environ.get('INSTANCE_NAME'),
        version=current_app.config['VERSION']
    )

@bp.route('/profil')
@login_required
def profile():
    return render_template('profil.html', current_user=current_user)

@bp.route('/mentions_legales')
def mentions_legales():
    """
        Affichage des mentions légales
    """
    return render_template('mentions_legales.html')