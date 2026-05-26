# Stage 1: Build Frontend (Next.js)
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend
COPY qlgs/package*.json ./
RUN npm install
COPY qlgs/ ./
RUN npm run build

# Stage 2: Build Backend (Spring Boot)
FROM maven:3.9-eclipse-temurin-17 AS backend-builder
WORKDIR /app/backend
COPY tutormanagement/pom.xml ./
RUN mvn dependency:go-offline -B
COPY tutormanagement/src ./src
RUN mvn clean package -DskipTests -B

# Stage 3: Runner
FROM eclipse-temurin:17-jre-jammy
# Install Node.js
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy Backend
COPY --from=backend-builder /app/backend/target/*.jar app.jar
COPY tutormanagement/uploads ./uploads

# Copy Frontend
COPY --from=frontend-builder /app/frontend/package*.json ./
COPY --from=frontend-builder /app/frontend/.next ./.next
COPY --from=frontend-builder /app/frontend/public ./public
COPY --from=frontend-builder /app/frontend/node_modules ./node_modules

# Create start script
RUN echo '#!/bin/bash \n\
java -jar app.jar --server.port=8080 & \n\
npm start -- -p ${PORT:-3000}' > start.sh
RUN chmod +x start.sh

# Render uses the PORT environment variable, defaults to 3000 for Frontend
EXPOSE 3000

CMD ["./start.sh"]
