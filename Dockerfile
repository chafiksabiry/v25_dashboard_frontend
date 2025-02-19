FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV VITE_API_URL=http://38.242.208.242:5005/api
ENV VITE_BACKEND_URL_COMPANY=http://38.242.208.242:5001/api
ENV VITE_BACKEND_URL_GIGS=http://38.242.208.242:5003/api

RUN npm run build

RUN npm install -g serve

EXPOSE 5180

CMD ["serve", "-s", "dist", "-l", "5180"]
