from flask import render_template
from flask_login import LoginManager
from flask_admin.contrib.sqla import ModelView
import config
from models.user import User
from models.challenge import Challenge as ChallengeModel
from models.food_consumption import FoodConsumption
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

from challenge import bp as challenge_bp
app.register_blueprint(challenge_bp, url_prefix='/challenge', name="challenge")

class UserAdmin(ModelView):
    column_list = ('username', 'email', 'role')
    column_labels = {'username': 'Username', 'email': 'Email Address', 'role': 'Role'}
    column_filters = ('username', 'email', 'role.name')

class RoleAdmin(ModelView):
    column_list = ('name',)
    column_labels = {'name': 'Role Name'}
    column_filters = ('name',)

class PostAdmin(ModelView):
    column_list = ('title', 'author', 'content')
    column_labels = {'title': 'Post Title', 'author': 'Author', 'content': 'Content'}
    column_filters = ('title', 'author.username')



class AdminModelView(ModelView):
    def is_accessible(self):
        return current_user.is_authenticated and current_user.role.name == 'Admin'

class UserAdmin(AdminModelView):
    pass


# Ajouter la liste des vues configurables ici
config.admin.add_view(UserAdmin(User, config.db.session))
config.admin.add_view(ModelView(ChallengeModel, config.db.session, endpoint="challenge-admin"))
config.admin.add_view(ModelView(FoodConsumption, config.db.session))
config.admin.add_view(ModelView(Food, config.db.session))
config.admin.add_view(ModelView(Indicator, config.db.session))
config.admin.add_view(ModelView(New, config.db.session))

@app.route('/test/')
def test_page():
    return '<h1>Testing the Flask Application Factory Pattern</h1>'

# Run the app if this file is the entry point
#if __name__ == '__main__':
#    connex_app.run(port=8080, debug=True)
