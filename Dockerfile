FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --include=dev
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/locales ./dist/locales
COPY --from=builder /app/languages.json ./languages.json

EXPOSE 3000
CMD ["npm", "start"]
