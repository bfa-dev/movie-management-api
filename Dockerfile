FROM node:21.7.3

WORKDIR /app

COPY package*.json ./

RUN rm -rf /application/node_modules

RUN npm install

COPY . .

RUN npm run build

EXPOSE 8080

CMD ["npm", "run", "start"]