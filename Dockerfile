FROM openjdk:17-jdk-slim

WORKDIR /app

# Install Tesseract OCR
RUN apt-get update && \
    apt-get install -y tesseract-ocr && \
    rm -rf /var/lib/apt/lists/*

COPY target/passport-screening-1.0.0.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java","-jar","app.jar"]
