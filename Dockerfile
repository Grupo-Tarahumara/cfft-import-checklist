
FROM node:20

WORKDIR /app

COPY package*.json ./
COPY pnpm-lock.yaml* ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3001

ENV PORT=3001

CMD ["npm", "run","start"]
