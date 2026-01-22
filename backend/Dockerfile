# ---------- STAGE 1: Build ----------
FROM maven:3.8.8-eclipse-temurin-8 AS builder

WORKDIR /app

# Copy pom.xml first (for dependency caching)
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy source code
COPY src ./src

# Build jar
RUN mvn clean package -DskipTests

# ---------- STAGE 2: Run ----------
FROM adoptopenjdk:8-jdk-hotspot

# Install Tesseract OCR
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libtesseract-dev \
    libsm6 \
    libxext6 \
    libxrender-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy JAR from builder stage
COPY --from=builder /app/target/passport-screening-1.0.0.jar app.jar

# Tesseract data path
ENV TESSDATA_PREFIX=/usr/share/tesseract-ocr/4.00/tessdata

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/api/screening/health || exit 1

ENTRYPOINT ["java", "-Xms256m", "-Xmx350m", "-jar", "app.jar"]
