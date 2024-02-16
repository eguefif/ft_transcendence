import time
import pyotp
import qrcode

def get_new_otp_key():
    return pyotp.random_base32()

def get_key_uri(key, username):
    return pyotp.totp.TOTP(key).provisioning_uri(name=username, issuer_name='transcendence')

def get_current_code(key):
    return pyotp.TOTP(key).now()
