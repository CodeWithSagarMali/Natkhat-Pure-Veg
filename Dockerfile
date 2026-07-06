# Multi-stage Dockerfile for Pure Veg Hotel Management System

# Stage 1: Build Frontend
FROM node:24-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Serve Backend & Static Frontend
FROM node:24-alpine
WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production
COPY backend/ ./backend/
COPY --from=frontend-builder /app/frontend/dist ./backend/public

EXPOSE 3001
ENV NODE_ENV=production
WORKDIR /app/backend
CMD ["node", "server.js"]
