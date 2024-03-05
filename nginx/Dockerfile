FROM nginx:1.25.3-bookworm

RUN apt-get update && apt-get upgrade -y
RUN apt-get install -y openssl

ADD ./conf/conf-eval.conf /etc/nginx/nginx.conf
COPY ./tools/entry-point-eval.sh /entry-point.sh
RUN chmod +x /entry-point.sh
COPY ./www/build /var/www/build

ENTRYPOINT ["/entry-point.sh"]
