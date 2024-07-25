from datetime import datetime
from flask import make_response, abort
from config import db
from models.new import new_schema, New, NewSchema
from flask_login import current_user
import uuid

def read_all():
    """Lire toutes les actualités"""
    news = New.query.all()
    news_schema = NewSchema(many=True)
    news_data =news_schema.dump(news)
    return news_data