#!/bin/bash
set -e

cd /var/src/app
python3 runServer.py
#tail -f /dev/null
