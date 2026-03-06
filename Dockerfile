# Stage 1: Build frontend
FROM node:22-alpine AS frontend-build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Build backend
FROM node:22-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci
COPY backend/ .
RUN npm run build

# Stage 3: Production
FROM node:22-alpine
WORKDIR /app

COPY --from=backend-build /app/backend/package.json /app/backend/package-lock.json ./
RUN npm ci --omit=dev

COPY --from=backend-build /app/backend/dist ./dist
COPY --from=frontend-build /app/dist ./public

EXPOSE 3000
CMD ["node", "dist/main.js"]
