FROM nginx:1.25.3-bookworm

RUN apt-get update && apt-get upgrade
RUN apt-get install -y openssl

ADD ./conf/default.conf /etc/nginx/nginx.conf
COPY ./tools/entry-point.sh /
RUN chmod +x /entry-point.sh
COPY ./www /var/www/


ENTRYPOINT ["/entry-point.sh"]
