#!/bin/bash

for i in {1..30}
do
	if curl --silent http://django:8000/healthcheck/; then
		break
	fi
	sleep 1
done

if [ $i = 30 ]; then
	echo "connection with django failed: " $i
fi

if [ ! -d "/etc/ssl/certs" ]; then
	mkdir /etc/ssl/certs
fi
cd /etc/ssl/certs
if [ ! -f "/etc/ssl/certs/ft_transcendence.crt" ]; then
	# Create the crt and the private key. crt is a request file to create certificate for a specific website
	openssl req -new -newkey rsa:2048 -nodes -out ft_transcendence.csr -keyout ft_transcendence.key -subj "/C=CA/ST=Quebec/L=Quebec/O=42 Quebec/OU=Student/CN=$HOSTNAME"
	# create the crt from the last two files
	openssl x509 -req -days 365 -in ft_transcendence.csr -signkey ft_transcendence.key -out ft_transcendence.crt
fi

cd /var/www/dev/

sed -i '1s/\/\///' ./scripts/modules/modalConnection.js

npm install
npm run build

nginx -g "daemon off;"
