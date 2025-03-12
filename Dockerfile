FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV VITE_API_URL=https://api-dashboard.harx.ai/api
ENV VITE_BACKEND_URL_COMPANY=https://api-companysearchwizard.harx.ai/api
ENV VITE_BACKEND_URL_GIGS=https://api-gigsmanual.harx.ai/api
ENV TWILIO_ACCOUNT_SID=AC8a453959a6cb01cbbd1c819b00c5782f
ENV VITE_BACKEND_URL_INTEGRATIONS=https://api-integration.harx.ai/api
ENV TWILIO_AUTH_TOKEN=7ade91a170bff98bc625543287ee62c8
ENV VITE_QIANKUN=true

RUN npm run build

RUN npm install -g serve

EXPOSE 5180

CMD ["serve", "-s", "dist", "-l", "5180"]
