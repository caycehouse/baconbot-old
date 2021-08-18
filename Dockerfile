FROM node:16

WORKDIR /app

COPY package.json .
RUN npm install && \
        npm install pm2 -g
COPY . .
CMD ["pm2-runtime", "index.js"]
