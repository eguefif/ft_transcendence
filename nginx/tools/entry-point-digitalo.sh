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

cd /var/www/dev/

sed -i '1s/\/\///' ./scripts/modules/modalConnection.js

npm install
npm run build

nginx -g "daemon off;"
