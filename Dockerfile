FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN apk add --no-cache git

RUN npm install --force

# Copier et installer le SDK local
#COPY ./qalqul/sdk-call /app/sdk

#RUN cd /app/sdk && npm install .

COPY . .

ENV VITE_API_URL=https://preprod-api-dashboard.harx.ai/api
ENV VITE_ZOHO_API_URL=https://preprod-api-dashboard.harx.ai/api/zoho
ENV VITE_GOOGLE_API_KEY=AIzaSyCHEKiraViKIrgvloZI-ZBIJqtDMeBuQD0
ENV VITE_BACKEND_URL_COMPANY=https://preprod-api-companysearchwizard.harx.ai/api
ENV VITE_BACKEND_URL_GIGS=https://preprod-api-gigsmanual.harx.ai/api
ENV TWILIO_ACCOUNT_SID=AC8a453959a6cb01cbbd1c819b00c5782f
ENV VITE_BACKEND_URL_INTEGRATIONS=https://preprod-api-dash-integrations.harx.ai/api
ENV TWILIO_AUTH_TOKEN=7ade91a170bff98bc625543287ee62c8
ENV VITE_QIANKUN=true
ENV VITE_API_URL_CALL=https://preprod-api-dash-calls.harx.ai
ENV VITE_QALQUL_API_KEY=k0HDn140xJM6WGoAMmX2U.17084ed7cc245f6d9f707538ebd90d60
ENV QALQUL_API=https://digital-works.qalqul.io/discovery/v1/calls
ENV QALQUL_KEY=k0HDn140xJM6WGoAMmX2U.17084ed7cc245f6d9f707538ebd90d60
ENV VITE_QALQUL_USERNAME=Agent.1
ENV VITE_QALQUL_PASSWORD=ewyaHtvzDPRdXrZL

ENV VITE_BACKEND_KNOWLEDGEBASE_BACKEND=https://preprod-api-knowledge-base.harx.ai
ENV VITE_MATCHING_API_URL=https://preprod-api-matching.harx.ai/api
ENV VITE_API_URL_GIGS=https://preprod-api-gigsmanual.harx.ai/api
ENV VITE_ZOHO_API_URL=https://preprod-api-dashboard.harx.ai/api/zoho
ENV VITE_BACKEND_URL_GIGS=https://preprod-api-gigsmanual.harx.ai/api/gigs

# WebSocket URL for Speech-to-Text
#ENV VITE_WS_URL=ws://38.242.208.242:5006
ENV VITE_WS_URL=wss://preprod-api-dash-calls.harx.ai/speech-to-text
ENV VITE_API_URL_AI_MESSAGES=https://preprod-api-messages-service.harx.ai/api
ENV VITE_ENV=-no-test
ENV VITE_TELNYX_LOGIN_TOKEN=your_login_token_here
ENV VITE_TELNYX_CALLER_ID=your_caller_id_here
ENV VITE_TELNYX_USERNAME=oumaimakarouma82533
ENV VITE_TELNYX_PASSWORD=TnPun5Hd

RUN npm run build

RUN npm install -g serve

EXPOSE 5180

CMD ["serve", "-s", "dist", "-l", "5180"]
