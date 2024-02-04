#!/bin/bash
if [ ! -d "/etc/ssl/certs" ]; then
	mkdir /etc/ssl/certs
fi
cd /etc/ssl/certs
if [ ! -f "/etc/ssl/certs/eguefif_42_fr.cert" ]; then
	# Create the crt and the private key. crt is a request file to create certificate for a specific website
	openssl req -new -newkey rsa:2048 -nodes -out eguefif_42_fr.csr -keyout eguefif_42_fr.key -subj "/C=CA/ST=Quebec/L=Quebec/O=42 Quebec/OU=Student/CN=eguefif.42.fr"
	# create the crt from the last two files
	openssl x509 -req -days 365 -in eguefif_42_fr.csr -signkey eguefif_42_fr.key -out eguefif_42_fr.crt
fi

nginx -g "daemon off;"
