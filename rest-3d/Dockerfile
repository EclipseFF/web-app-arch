FROM node:20.5.1-alpine
COPY package.json .

RUN npm install

COPY . .

EXPOSE 5173

RUN npm run dev