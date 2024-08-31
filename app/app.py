from flask import render_template
from flask_login import LoginManager
from flask_admin.contrib.sqla import ModelView
import config
from models.user import User
from models.challenge import Challenge as ChallengeModel
from models.food_consumption import FoodConsumption
from models.day_consumption import DayConsumption
from models.food import Food
from models.indicator import Indicator
from models.new import New
from flask_login import login_required, current_user

connex_app = config.connex_app
connex_app.add_api(config.basedir + "/swagger.yml")

app = config.app

login_manager = LoginManager()
login_manager.login_view = 'auth.signin'
login_manager.init_app(app)

from models.user import User

@login_manager.user_loader
def load_user(user_id):
    # since the user_id is just the primary key of our user table, use it in the query for the user
    return User.query.get(user_id)

# Register blueprints here
from main import bp as main_bp
app.register_blueprint(main_bp)

from auth import bp as auth_bp
app.register_blueprint(auth_bp, url_prefix='/auth')

from statement import bp as statement_bp
app.register_blueprint(statement_bp, url_prefix='/statement')

from demo import bp as demo_bp
app.register_blueprint(demo_bp, url_prefix='/demo')

from sharing import bp as sharing_bp
app.register_blueprint(sharing_bp, url_prefix='/sharing')

from challenge import bp as challenge_bp
app.register_blueprint(challenge_bp, url_prefix='/challenge', name="challenge")

# Interface d'administration
class AdminModelView(ModelView):
    def is_accessible(self):
        return current_user.is_authenticated and current_user.role.name == 'admin'

class UserAdmin(AdminModelView):
    column_display_pk = True
    pass
class RoleAdmin(AdminModelView):
    column_display_pk = True
    pass
class ChallengeAdmin(AdminModelView):
    column_display_pk = True
    pass
class FoodConsumptionAdmin(AdminModelView):
    column_display_pk = True
    pass
class FoodAdmin(AdminModelView):
    column_display_pk = True
    pass
class IndicatorAdmin(AdminModelView):
    column_display_pk = True
    pass
class NewAdmin(AdminModelView):
    column_display_pk = True
    form_columns = ('new_id', 'creation_date', 'title', 'text')
    pass
class DayConsumptionAdmin(AdminModelView):
    column_display_pk = True
    pass


config.admin.add_view(UserAdmin(User, config.db.session))
config.admin.add_view(ChallengeAdmin(ChallengeModel, config.db.session, endpoint="challenge-admin"))
config.admin.add_view(FoodConsumptionAdmin(FoodConsumption, config.db.session))
config.admin.add_view(FoodAdmin(Food, config.db.session))
config.admin.add_view(IndicatorAdmin(Indicator, config.db.session))
config.admin.add_view(NewAdmin(New, config.db.session))
config.admin.add_view(DayConsumptionAdmin(DayConsumption, config.db.session))

@app.route('/test/')
def test_page():
    return '<h1>Testing the Flask Application Factory Pattern</h1>'

# Run the app if this file is the entry point
#if __name__ == '__main__':
#    connex_app.run(port=8080, debug=True)
