#!/bin/bash

sleep 2

cd /usr/src/app
python3 ./manage.py makemigrations
python3 ./manage.py migrate
python3 daphne transcendence.asgi:transcendence  -b 0.0.0.0 -p 8000
