FROM node:16

WORKDIR /app

COPY package.json .
RUN npm install && \
        npm install pm2 -g
COPY . .
RUN npm run build
CMD ["pm2-runtime", "dist/bot.js"]
