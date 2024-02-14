FROM python:latest

RUN apt-get update && apt-get upgrade
RUN apt-get -y install vim

COPY ./requirements.txt /
RUN pip install --upgrade pip 
RUN pip install -r requirements.txt
RUN rm /requirements.txt

RUN mkdir -p /var/src
RUN mkdir -p /var/src/app

COPY ./tools/entry-point.sh /
RUN chmod +x /entry-point.sh

expose 8000

CMD ["./entry-point.sh"]
#CMD ["tail", "-f", "/dev/null"]
