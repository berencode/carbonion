from config import db, ma
import datetime

now = datetime.datetime.utcnow

class DayConsumption(db.Model):
    """
        Représente un jour de consommmation.
    """
    __tablename__ = "day_consumption"
    day_consumption_id = db.Column(db.String(100), primary_key=True) # primary keys
    date = db.Column(db.Date(), default=now)         # Date à laquelle la consommation est déclarée
    commentary = db.Column(db.String(500), default="")
    user_id = db.Column(db.String(100))
    challenge_id = db.Column(db.String(100))        # Identifiant du challenge auquel le jour est attaché
    _index = db.Column(db.Integer)                  # Index du jour au sein du challenge
    is_finished = db.Column(db.Boolean)             # Booléen indiquant si la saisie est déclarée cloturée
    want_share = db.Column(db.Boolean)                 # Booléen indiquant si l'utilisateur souhaite partager son menu
    shared_id = db.Column(db.String(100))           # identifiant du partage
    def __repr__(self):
        return f'<DayConsumption "{self.day_consumption_id}">'


class DayConsumptionSchema(ma.SQLAlchemyAutoSchema):
    """doc"""
    class Meta:
        model = DayConsumption
        load_instance = True
        sqla_session = db.session
        include_relationships = True

day_consumption_schema = DayConsumptionSchema()
