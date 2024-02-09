FROM python:latest

RUN apt-get update && apt-get upgrade

COPY ./requirements.txt /
RUN pip install --upgrade pip 
RUN pip install -r requirements.txt
RUN rm /requirements.txt

RUN mkdir -p /var/src
RUN mkdir -p /var/src/app
COPY ./serverPong/* /var/src/app/

expose 8000

WORKDIR /var/src/app
#CMD ["tail", "-f", "/dev/null"]
CMD ["python3 runServer.py"]
