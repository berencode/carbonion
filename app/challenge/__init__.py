from flask import Blueprint

bp = Blueprint('challenge', __name__)

from challenge import routes