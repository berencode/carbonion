from flask import Blueprint

bp = Blueprint('sharing', __name__)

from sharing import routes