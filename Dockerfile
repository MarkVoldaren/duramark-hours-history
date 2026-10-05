FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY app/index.html app/styles.css app/app.js /usr/share/nginx/html/
