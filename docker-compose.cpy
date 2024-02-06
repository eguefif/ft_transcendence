version: '3'
services:
  nginx:
    container_name: nginx
    build: ./nginx/
    env_file:
      - .env
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - django
    networks:
      - transcendence-net
    volumes:
      - nginx-vol:/var/www/
    restart: on-failure

  django:
    container_name: django
    build: ./django
    env_file:
      - .env
    expose:
      - 8000
    depends_on:
      - postgres
    networks:
      - transcendence-net
    volumes:
      - django-vol:/usr/src/app

  postgres:
    image: postgres:latest
    container_name: postgres
    env_file:
      - .env
    volumes:
      - postgres-vol:/var/lib/postgresql/data
    networks:
      - transcendence-net
    restart: unless-stopped

volumes:
  postgres-vol:
    name: postgres-vol
  nginx-vol:
    name: nginx-vol
    driver: local
    driver_opts:
      type: none
      o: bind
      device: ./nginx/www
  django-vol:
    name: django-vol
    driver: local
    driver_opts:
      type: none
      o: bind
      device: ./django/transcendence

networks:
  transcendence-net:
    name: transcendence-net
    driver: bridge
