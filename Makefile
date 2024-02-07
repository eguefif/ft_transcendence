all: 
	cp .env ./django/transcendence/transcendence
	docker compose up;\

down:
	docker compose down

install: checks
	cd ./django && pip install -r requirements.txt; \
	cd ../;\
	cp .env ./django/transcendence/transcendence
	docker compose up --build

rebuild:
	docker compose down
	docker rm nginx django postgres
	docker rmi nginx-transcendence postgres django-transcendence
	cp .env ./django/transcendence/transcendence
	docker compose up --build

rmvol:
	docker volume rm postgres-vol

rmnetwork:
	docker network rm transcendence-net

rmcontainer:
	docker rm nginx django postgres

removeAll:
	docker compose down
	docker rmi nginx-transcendence postgres django-transcendence

migrate:
	docker exec django python3 ./manage.py makemigrations
	docker exec django python3 ./manage.py migrate

checks:
	@if [ ! -d "./django/venv/" ]; then \
		echo "Before installing, you need to create a venv.In the directory ./django, execute python3 -m venv venv"; \
		exit 1;\
	fi
	@if [ -z "${VIRTUAL_ENV}" ]; then\
		echo "You need to activate the python virtual env. Type: source ./django/venv/bin/activate"; \
		exit 1; \
	fi
	@if [ ! -f "./.env" ]; then \
		echo "You need the .env file before installing"; \
		exit 1;\
	fi

.PHONY: all rebuild rmvol removeAll migrate install rmcontainer checks rmnetwork down
