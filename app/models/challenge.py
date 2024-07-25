from config import db, ma
import datetime

now = datetime.datetime.utcnow

class Challenge(db.Model):
    """
        Représente un challenge (c'est à dire un ensemble de jour de consommations que l'utilisateur s'est engagé à remplir)
    """
    __tablename__ = "challenge"
    challenge_id = db.Column(db.String(100), primary_key=True)  # primary keys
    date = db.Column(db.Date(), default=now)                    # Date à laquelle le challenge est commencé
    user_id = db.Column(db.String(100))                         # Utilisateur propriétaire du challenge
    status = db.Column(db.Integer)                              # Status du challenge
    name = db.Column(db.String(100))
    day_number = db.Column(db.Integer)
    color = db.Column(db.String(10))                            # À chaque challenge,on associe une couleur par défaut pour que l'utilisateur s'y retrouve
    def __repr__(self):
        return f'<Challenge "{self.challenge_id}">'


class ChallengeSchema(ma.SQLAlchemyAutoSchema):
    """doc"""
    class Meta:
        model = Challenge
        load_instance = True
        sqla_session = db.session
        include_relationships = True

challenge_schema = ChallengeSchema()
