FROM python:latest

RUN apt-get update && apt-get upgrade -y

COPY ./requirements.txt /
RUN pip install --upgrade pip
RUN pip install -r requirements.txt
RUN rm /requirements.txt

RUN mkdir -p /var/src
RUN mkdir -p /var/src/app
COPY ./transcendence /var/src/app/

COPY ./tools/entry-point-deploy.sh /entry-point.sh
RUN chmod +x /entry-point.sh
COPY ./transcendence/static/media/default/avatar.png /

EXPOSE 8000

CMD ["./entry-point.sh"]
