FROM node:lts-alpine

EXPOSE 8080

WORKDIR /app

COPY . .

RUN npm install

CMD ["npm", "start"]

