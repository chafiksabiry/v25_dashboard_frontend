FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV VITE_API_URL=https://api-dashboard.harx.ai/api
ENV VITE_BACKEND_URL_COMPANY=https://api-companysearchwizard.harx.ai/api
ENV VITE_BACKEND_URL_GIGS=https://api-gigsmanual.harx.ai/api
ENV VITE_QIANKUN=true

RUN npm run build

RUN npm install -g serve

EXPOSE 5180

CMD ["serve", "-s", "dist", "-l", "5180"]
