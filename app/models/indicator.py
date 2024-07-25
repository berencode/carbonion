from config import db, ma

class Indicator(db.Model):
    """
        Représente un indicateur (ex : carbon_foot_print)
    """
    __tablename__ = "indicator"
    indicator_id = db.Column(db.String(100), primary_key=True)  # primary keys are required by SQLAlchemy
    label = db.Column(db.String(100))                           # label de l'indicateur considéré
    color = db.Column(db.String(100))                           # couleur de l'indicateur
    unit = db.Column(db.String(20))                             # unité de l'indicateur
    column = db.Column(db.String(100))                          # colonne correspondante à l'indicateur dans le référentiels
    def __repr__(self):
        return f'<Indicator "{self.label}">'


class IndicatorSchema(ma.SQLAlchemyAutoSchema):
    """
        Schéma indicator class
    """
    class Meta:
        model = Indicator
        load_instance = True
        sqla_session = db.session

indicator_schema = IndicatorSchema()
