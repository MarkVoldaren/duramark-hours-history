FROM node:22-alpine
WORKDIR /app
COPY server.cjs ./
COPY app/index.html app/styles.css app/app.js ./app/
ENV PORT=80 DATA_DIR=/data
EXPOSE 80
CMD ["node", "server.cjs"]
