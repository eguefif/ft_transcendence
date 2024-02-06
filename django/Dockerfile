FROM python:latest

RUN apt-get update && apt-get upgrade
#RUN apt-get install -y python-psycopg2

COPY ./requirements.txt /
RUN pip install --upgrade pip 
RUN pip install -r requirements.txt
RUN rm /requirements.txt

COPY ./tools/entry-point.sh /
RUN chmod +x /entry-point.sh
RUN mkdir -p /usr/src
RUN mkdir -p /usr/src/app

expose 8000

WORKDIR /usr/src/app/
CMD ["python3", "./manage.py", "runserver", "0.0.0.0:8000"]
