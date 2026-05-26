FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Add build-time argument for API URL
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Copy package files first for better caching
COPY qlgs/package*.json ./
RUN npm install
# Copy the rest
COPY qlgs/ ./
# Build and export static files
RUN npm run build

# Stage 2: Build Backend (Spring Boot)
FROM maven:3.9-eclipse-temurin-17 AS backend-builder
WORKDIR /app/backend

# Copy the backend project files
COPY tutormanagement/pom.xml ./
# Download dependencies first for caching
RUN mvn dependency:go-offline -B

COPY tutormanagement/src ./src

# Copy built frontend to Spring Boot's static resources
# This allows the JAR to serve the frontend directly
COPY --from=frontend-builder /app/frontend/out ./src/main/resources/static

# Build the final JAR
RUN mvn clean package -DskipTests -B

# Stage 3: Runner
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy the JAR from the builder stage
COPY --from=backend-builder /app/backend/target/*.jar app.jar

# Copy existing uploads to the final image
COPY tutormanagement/uploads ./uploads

# Render provides the port via the PORT environment variable
ENV SERVER_PORT=8080

EXPOSE 8080

# Start the application
# We use the PORT environment variable if provided by Render
ENTRYPOINT ["sh", "-c", "java -jar app.jar --server.port=${PORT:-8080}"]
