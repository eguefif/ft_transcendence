cp .env ./django/transcendence/transcendence

mv ./django/Dockerfile ./django/.Dockerfile-dev
mv ./django/.Dockerfile-deploy ./django/Dockerfile

mv ./nginx/Dockerfile ./nginx/.Dockerfile-dev
mv ./nginx/.Dockerfile-deploy ./nginx/Dockerfile-dev

mv ./docker-compose.yml ./.docker-compose-dev.yml
mv ./.docker-compose-deploy.yml ./docker-compose.yml

docker-compose up --build -d

mv ./django/.Dockerfile-dev .django/Dockerfile
mv ./django/Dockerfile ./django/.Dockerfile-deploy

mv ./nginx/Docker ./nginx/.Dockerfile-deploy
mv ./nginx/.Docker-dev ./nginx/Dockerfile

mv ./serverPong/Docker ./nginx/.Dockerfile-deploy
mv ./serverPong/.Docker-dev ./nginx/Dockerfile

mv ./docker-compose.yml ./.docker-compose-deploy.yml
mv ./.docker-compose-dev.yml ./docker-compose.yml
