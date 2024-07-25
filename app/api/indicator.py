from datetime import datetime
from flask import make_response, abort
from config import db
from models.indicator import indicator_schema, Indicator, IndicatorSchema
from flask_login import current_user
import uuid

def read_all():
    """Lire tous les indicateurs"""
    indicators = Indicator.query.all()
    indicators_schema = IndicatorSchema(many=True)
    indicators_data =indicators_schema.dump(indicators)
    return indicators_data