from flask import render_template, request, url_for, redirect, current_app, render_template_string
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import login_user, login_required, logout_user, current_user
from flask_mail import Message
from auth.user import UserController
from models.user import User
from config import db, mail
import uuid
from auth import bp


@bp.route('/signup/', methods=['GET'])
def signup():
    error = request.args.get('error')
    return render_template('auth/signup.html', error=error)

@bp.route('/signup/', methods=['POST'])
def signup_post():
    # code to validate and add user to database goes here
    _mail = request.form.get('mail')
    password = request.form.get('password')
    password_confirmation = request.form.get('passwordConfirmation')

    user = User.query.filter_by(mail=_mail).first() # if this returns a user, then the email already exists in database
    
    if user: # if a user is found, we want to redirect back to signup page so user can try again
        return redirect(url_for('auth.signup', error='mail_exist'))
    elif(password_confirmation != password):
        return redirect(url_for('auth.signup', error='password_mismatch'))
    else:  
        user_controller = UserController()
        user_controller.register_user(_mail, password)
        
    return redirect(url_for('auth.signin', comment='from_signup'))


@bp.route('/remove', methods=['GET', 'POST'])
@login_required
def remove():
    current_user.remove()
    db.session.commit()
    return redirect(url_for('auth.signin'))

@bp.route('/signin/', methods=['GET'])
def signin():
    comment = request.args.get('comment')
    error = request.args.get('error')
    token = request.args.get('token')
    if(token is not None):
        # on est dans le cas d'une activation de compte
        user = User.verify_activate_token(token)
        if(user is None):
            print('Invalid token')
            return redirect(url_for('auth.signin'))
        user.activated = True
        db.session.commit()
        return redirect(url_for('auth.signin', comment='from_activate_account'))
    return render_template('auth/signin.html', error=error, comment=comment)


@bp.route('/signin/<token>', methods=['GET'])
def signin_verify_token(token):
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
    user = User.verify_activate_token(token)
    if user is None:
        print('Invalid token')
        return redirect(url_for('auth.signin'))
    user.activated = True
    db.session.commit()
    return redirect(url_for('auth.signin', comment='from_activate_account'))

@bp.route('/signin/', methods=['POST'])
def signin_post():
    if request.form.get('recovery') is not None:
        # forgot password
        return redirect(url_for('auth.forgot'))
    # login code goes here
    _mail = request.form.get('mail')
    password = request.form.get('password')

    user = User.query.filter_by(mail=_mail).first()

    # check if the user actually exists
    # take the user-supplied password, hash it, and compare it to the hashed password in the database
    if not user or not check_password_hash(user.password, password):
        #flash('Please check your login details and try again.')
        return redirect(url_for('auth.signin', error='issue')) # if the user doesn't exist or password is wrong, reload the page
    if user :
        if not user.activated:
            return redirect(url_for('auth.signin', error='not_activated')) # if the user doesn't exist or password is wrong, reload the page

    login_user(user, remember=True)
    # if the above check passes, then we know the user has the right credentials
    return redirect(url_for('main.index'))


    
    
def send_reset_email(user):
    token = user.get_reset_token()
    msg = Message('Password Reset Request',
        sender='no-reply.carbonion@carbonion.net',
        recipients=[user.mail])
    msg.body = f"""To reset your password follow this link:
{"https://carbonion.net"+url_for('auth.reset', token=token)}
If you ignore this email no changes will be made
"""
    mail.send(msg)
 

@bp.route('/forgot_password', methods=['GET','POST'])
def forgot():
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
    if request.method == 'POST':
        print("coucou ici")
        _mail = request.form.get('mail')
        if _mail != '':
            user = User.query.filter_by(mail = _mail).first()
            send_reset_email(user)
            print('user::',user)
            print('an email has been sent to your email with reset instructions')
            return redirect(url_for('auth.signin'))
    return render_template('auth/recovery.html')


@bp.route('/reset_password/<token>', methods=['GET','POST'])
def reset(token):
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
    user = User.verify_reset_token(token)
    if user is None:
        print('Invalid token')
        return redirect(url_for('auth.forgot'))
    if request.method == 'POST':
        user.password = generate_password_hash(request.form.get('password'), method='sha256')
        db.session.commit()
        return redirect(url_for('auth.signin', comment='from_reset_password'))
    return render_template('auth/reset_password.html')


@bp.route('/signout/')
@login_required
def signout():
    logout_user()
    return redirect(url_for('main.index'))



