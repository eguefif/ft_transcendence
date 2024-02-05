
path=$(shell pwd)/

all:
	docker compose up

clean:
	docker compose down
	docker compose up --build

removeAll:
	docker compose down
	docker image rm ft_transcendence-nginx postgres


.PHONY: all clean fclean
