from flask import Blueprint

bp = Blueprint('demo', __name__)

from demo import routes