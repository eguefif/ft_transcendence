#!/bin/bash

sleep 2

python3 ./manage.py makemigrations
python3 ./manage.py migrate
