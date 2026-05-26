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

# Stage 3: Runner (All-in-one: SQL Server + Java + Node)
FROM mcr.microsoft.com/mssql/server:2022-latest
USER root

# Install Java 17 and Node.js
RUN apt-get update && apt-get install -y openjdk-17-jre-headless curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy Backend & SQL
COPY --from=backend-builder /app/backend/target/*.jar app.jar
COPY Database.sql ./Database.sql
COPY tutormanagement/uploads ./uploads

# Copy Frontend
COPY --from=frontend-builder /app/frontend/package*.json ./
COPY --from=frontend-builder /app/frontend/.next ./.next
COPY --from=frontend-builder /app/frontend/public ./public
COPY --from=frontend-builder /app/frontend/node_modules ./node_modules

# Create the startup and auto-setup script
RUN echo '#!/bin/bash \n\
# Start SQL Server in background \n\
/opt/mssql/bin/sqlservr & \n\
\n\
# Wait for SQL Server to be ready \n\
echo "Waiting for SQL Server to start..." \n\
for i in {1..60}; do \n\
    /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C -Q "SELECT 1" > /dev/null 2>&1 \n\
    if [ $? -eq 0 ]; then \n\
        echo "SQL Server is ready!" \n\
        break \n\
    fi \n\
    echo "Still waiting..." \n\
    sleep 2 \n\
done \n\
\n\
# Initialize Database from file \n\
echo "Initializing database..." \n\
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C -i Database.sql \n\
\n\
# Start Backend in background \n\
echo "Starting Backend..." \n\
java -jar app.jar --server.port=8080 & \n\
\n\
# Start Frontend in foreground \n\
echo "Starting Frontend..." \n\
npm start -- -p ${PORT:-3000}' > start.sh

RUN chmod +x start.sh

# Environment variables for SQL Server
ENV ACCEPT_EULA=Y
ENV MSSQL_SA_PASSWORD=root123

# Expose Frontend port
EXPOSE 3000

CMD ["./start.sh"]
