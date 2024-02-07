

all:
	docker compose up

clean:
	docker compose down
	docker compose up --build

rmvol:
	docker volume rm postgres-vol

removeAll:
	docker compose down
	docker image rm ft_transcendence-nginx postgres

migrate:
	docker exec django python3 ./manage.py makemigrations
	docker exec django python3 ./manage.py migrate

install:
	if [ -d "./django/venv/" ]; then \
		cd ./django && pip install -r requirements.txt; \
		cd ../;\
		docker compose up --build; \
		docker exec django python3 ./manage.py makemigrations;\
		docker exec django python3 ./manage.py migrate;\
		docker compose down;\
		docker compose up --build;\
	else; \
		echo "Create a venv in ./django with python3 -m venv venv"; \
	fi

.PHONY: all clean fclean
