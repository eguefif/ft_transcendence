

all:
	@cp ./.env ./django/transcendence/transcendence/
	docker compose up

clean:
	@cp ./.env ./django/transcendence/transcendence/
	docker compose down
	docker compose up --build

removeAll:
	@cp ./.env ./django/transcendence/transcendence/
	docker compose down
	docker image rm ft_transcendence-nginx postgres

migrate:
	docker exec django python3 ./manage.py makemigrations
	docker exec django python3 ./manage.py migrate

install:
	cd ./django && pip -m venv venv && pip install -r requirements.txt
	docker compose up --build
	docker exec django python3 ./manage.py makemigrations
	docker exec django python3 ./manage.py migrate
	cp ./.env ./django/transcendence/transcendence/
	docker compose down
	docker compose up --build

.PHONY: all clean fclean
