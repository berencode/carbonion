#from flask import Flask
#from app.extensions import db
from flask import render_template
from flask_login import LoginManager
import config

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

from challenge import bp as challenge_bp
app.register_blueprint(challenge_bp, url_prefix='/challenge')

@app.route('/test/')
def test_page():
    return '<h1>Testing the Flask Application Factory Pattern</h1>'

# Run the app if this file is the entry point
#if __name__ == '__main__':
#    connex_app.run(port=8080, debug=True)
