mv ./django/Docker .django/.Docker-dev
mv ./django/.Docker-deploy ./django/Docker

mv ./nginx/Docker ./nginx/.Docker-dev
mv ./nginx/.Docker-deploy ./nginx/Docker

mv ./docker-compose.yml ./.docker-compose-dev.yml
mv ./.docker-compose-deploy.yml ./.docker-compose.yml

docker-compose up --build -d
