from config import db, ma
from flask_login import UserMixin
from flask import current_app
from itsdangerous import TimedJSONWebSignatureSerializer as Serializer
from models.challenge import Challenge, ChallengeSchema
from datetime import datetime


class User(UserMixin, db.Model):
    __tablename__ = "user"
    id = db.Column(db.String(100), primary_key=True) # primary keys are required by SQLAlchemy
    mail = db.Column(db.String(150))
    password = db.Column(db.Text)
    inscription_date = db.Column(db.DateTime, default=datetime.utcnow)
    activated = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return f'<User "{self.mail}">'
    
    def remove(self):
        db.session.delete(self)
    
    def get_inscription_date(self):
        return self.inscription_date.strftime('%d-%m-%Y')
    
    def get_reset_token(self, expires_sec=1800):
        s=Serializer(current_app.config['SECRET_KEY'], expires_sec)
        return s.dumps({'user_id': self.id}).decode('utf-8')
    
    def get_activate_token(self, expires_sec=5400):
        s=Serializer(current_app.config['SECRET_KEY'], expires_sec)
        return s.dumps({'user_id': self.id}).decode('utf-8')
    
    def has_challenge(self):
        existing_day_consumption = Challenge.query.filter_by(user_id=self.id).first()
        print(existing_day_consumption)
        return existing_day_consumption
    
    @staticmethod
    def verify_reset_token(token):
        s=Serializer(current_app.config['SECRET_KEY'])
        try:
            user_id = s.loads(token)['user_id']
        except:
            return None
        return User.query.get(user_id)
    @staticmethod
    def verify_activate_token(token):
        s=Serializer(current_app.config['SECRET_KEY'])
        try:
            user_id = s.loads(token)['user_id']
        except:
            return None
        return User.query.get(user_id)
    
class UserSchema(ma.SQLAlchemyAutoSchema):
    """doc"""
    class Meta:
        model = User
        load_instance = True
        sqla_session = db.session

user_schema = UserSchema()