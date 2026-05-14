FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . ./
RUN npm run build

FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY package*.json ./
RUN npm install --omit=dev

COPY server ./server
COPY src/data ./src/data
COPY --from=build /app/dist ./dist

EXPOSE 3001

CMD ["npm", "run", "start"]