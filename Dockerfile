ARG NODE_ENV=development
ARG APP_PORT=3000

# =================================
# Development Stage
# =================================
FROM node:20-alpine AS development
ENV NODE_ENV=${NODE_ENV}
ENV PORT=${APP_PORT}

# Añadir node_modules/.bin al PATH para encontrar 'nest'
ENV PATH /app/node_modules/.bin:$PATH

WORKDIR /app
COPY package*.json ./
# Usar 'npm install' para asegurar que las devDependencies se instalen
RUN npm install
COPY . .
EXPOSE ${APP_PORT}
CMD ["npm", "run", "start:dev"]

# =================================
# Builder Stage
# =================================
FROM node:20-alpine AS builder
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
# 'npm install' es mejor aquí también para asegurar un build consistente
RUN npm install
COPY . .
RUN npm run build

# =================================
# Production Stage
# =================================
FROM node:20-alpine AS production
ENV NODE_ENV=production
ENV PORT=${APP_PORT}
WORKDIR /app
COPY package*.json ./
# Instalar solo dependencias de producción para una imagen más ligera
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
# Crear un usuario no-root para seguridad
RUN addgroup -g 1001 nodejs && adduser -S nestjs -u 1001
USER nestjs
EXPOSE ${APP_PORT}
CMD ["node", "dist/main"]
