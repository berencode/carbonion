from config import db, ma
from datetime import datetime
class New(db.Model):
    """
        Représente une actualité
    """
    __tablename__ = "new"
    new_id =  db.Column(db.String(500), primary_key=True)  # primary keys are required by SQLAlchemy
    creation_date = db.Column(db.DateTime, default=datetime.utcnow)
    title = db.Column(db.String(500))
    text = db.Column(db.String(500))
    def __repr__(self):
        return f'<New "{self.code_agb}">'
    
class NewSchema(ma.SQLAlchemyAutoSchema):
    """doc"""
    class Meta:
        model = New
        load_instance = True
        sqla_session = db.session

new_schema = NewSchema()