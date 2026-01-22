# Java 8 compatible Docker image for Passport Screening Backend
FROM adoptopenjdk:8-jdk-hotspot

# Install Tesseract OCR
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libtesseract-dev \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy JAR file
COPY /target/passport-screening-1.0.0.jar app.jar

# Set Tesseract environment
ENV TESSDATA_PREFIX=/usr/share/tesseract-ocr/4.00/tessdata

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/api/screening/health || exit 1

# Run application
ENTRYPOINT ["java", "-Xms256m", "-Xmx350m", "-jar", "app.jar"]
