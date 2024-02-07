#!/bin/bash

sleep 2

cd /usr/src/app
python3 ./manage.py makemigrations
python3 ./manage.py migrate
python3 ./manage.py runserver 0.0.0.0:8000
