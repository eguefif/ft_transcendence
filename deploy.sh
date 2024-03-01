mv ./django/.Dockerfile-deploy ./django/Dockerfile
mv ./serverPong/.Dockerfile-deploy ./serverPong/Dockerfile
mv ./nginx/Dockerfile ./nginx/.Dockerfile-dev
mv ./.docker-compose-deploy.yml ./docker-compose.yml

docker-compose up --build -d
