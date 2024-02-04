FROM nginx:latest


ADD ./conf/default.conf /etc/nginx/nginx.conf
#COPY ./tools/entry-point.sh /
#RUN chmod +x /entry-point.sh
COPY ./html/* /var/www/html

EXPOSE 443

#ENTRYPOINT ["/entry-point.sh"]
CMD ["nginx", "-g", "daemon off;"]
