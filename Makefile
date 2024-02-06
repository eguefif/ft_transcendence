
path=$(shell pwd)/

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


.PHONY: all clean fclean
