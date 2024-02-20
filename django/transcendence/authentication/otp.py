import time
import pyotp
import qrcode
import qrcode.image.svg

def get_new_otp_key():
    return pyotp.random_base32()

def get_key_uri(key, username):
    return pyotp.totp.TOTP(key).provisioning_uri(name=username, issuer_name='transcendence')

def get_current_code(key):
    return pyotp.TOTP(key).now()

def get_key_qr_code(key, username):
    uri = get_key_uri(key, username)
    factory = qrcode.image.svg.SvgPathImage
    return qrcode.make(uri, image_factory=factory).to_string()

