#!/bin/bash

mkdir -p /var/django/media/default/
mkdir -p /var/django/media/images/
cp /avatar.png /var/django/media/default/

cd /var/src/app
python3 ./manage.py makemigrations
python3 ./manage.py migrate
daphne -b 0.0.0.0 -p 8000 transcendence.asgi:application
