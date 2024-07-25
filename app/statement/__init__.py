from flask import Blueprint

bp = Blueprint('statement', __name__)

from statement import routes