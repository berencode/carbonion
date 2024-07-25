from flask import current_app, url_for
from config import db, mail
from models.user import User
from flask_mail import Message
import uuid
from werkzeug.security import generate_password_hash, check_password_hash


class UserController:
    def register_user(self, _mail, password):
        # Register the user
        new_user = User(
            id=str(uuid.uuid4()),
            mail=_mail,
            password=generate_password_hash(password, method='sha256')
        )
        db.session.add(new_user)
        db.session.commit()

        # Send validation email
        self.send_validation_email(new_user)
    
    def send_validation_email(self, user):
        token = user.get_activate_token()
        msg = Message('Activation de votre compte Carbonion',
        sender='no-reply.carbonion@carbonion.net',
        recipients=[user.mail])
        msg.body = f"""Pour activer votre compte Carbonion, clickez sur le lien suivant :
            {"https://carbonion.net"+url_for('auth.signin', token=token)}
        """
        mail.send(msg)
        