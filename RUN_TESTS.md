# How to Run Tests - Passport Screening Application

## Prerequisites
- Java 8 or higher installed
- Maven installed and configured
- MongoDB running (local or MongoDB Atlas)
- Tesseract installed (for OCR tests)

## Running Tests from Command Line

### 1. Run All Tests
```bash
mvn test
```

### 2. Run Single Test Class
```bash
mvn test -Dtest=SanctionsServiceTest
```

### 3. Run Specific Test Method
```bash
mvn test -Dtest=SanctionsServiceTest#testNameFoundInSanctionsList
```

### 4. Run All Tests with Detailed Output
```bash
mvn test -X
```

### 5. Run Tests and Generate Coverage Report
```bash
mvn test jacoco:report
# View report at: target/site/jacoco/index.html
```

### 6. Run Tests Skipping Slow Tests
```bash
mvn test -DskipSlowTests=true
```

## Running Tests from IDE

### IntelliJ IDEA
1. Open the test file: `src/test/java/com/passport/screening/service/SanctionsServiceTest.java`
2. Right-click on the class name → "Run 'SanctionsServiceTest'"
3. Or right-click on a specific test method → "Run 'testNameFoundInSanctionsList'"
4. View results in the Run window

### Eclipse
1. Open the test file
2. Right-click → "Run As" → "JUnit Test"
3. View results in JUnit view

### VS Code with Extension Pack for Java
1. Open the test file
2. Click "Run Test" above the test class or method
3. View results in Test Explorer

## Test Case Execution Details

### SanctionsServiceTest
Tests the sanctions matching logic with mocked MongoDB repository.

**Test Cases:**
1. `testEmptyNameCheckReturnsNotSanctioned` - Validates empty string returns not sanctioned
2. `testNullNameCheckReturnsNotSanctioned` - Validates null input returns not sanctioned
3. `testNameFoundInSanctionsList` - Tests matching "ABD AL-KHALIQ AL-HOUTHI" in database
4. `testPanchalAnkitMukeshNameMatching` - Tests matching "PANCHALANKITMUKESH" against "PANCHAL ANKIT MUKESH"
5. `testPartialNameMatching` - Tests partial name matching logic
6. `testNoMatchReturnsFalse` - Validates unmatched name returns not sanctioned
7. `testNormalizedNameComparison` - Tests normalized name comparison without spaces

### Running Individual Tests
```bash
# Test empty name validation
mvn test -Dtest=SanctionsServiceTest#testEmptyNameCheckReturnsNotSanctioned

# Test PANCHAL ANKIT MUKESH matching
mvn test -Dtest=SanctionsServiceTest#testPanchalAnkitMukeshNameMatching

# Test normalized name comparison
mvn test -Dtest=SanctionsServiceTest#testNormalizedNameComparison
```

## Integration Tests

### OCRServiceTest
Tests OCR name extraction from passport PDFs.

```bash
mvn test -Dtest=OCRServiceTest
```

### ScreeningControllerIntegrationTest
Tests the complete screening endpoint.

```bash
mvn test -Dtest=ScreeningControllerIntegrationTest
```

## Test Configuration

### application-test.yml
Tests use a separate test configuration file:
```yaml
spring:
  data:
    mongodb:
      uri: mongodb://localhost:27017/passport_screening_test
```

To use MongoDB Atlas for testing:
```yaml
spring:
  data:
    mongodb:
      uri: mongodb+srv://username:password@cluster.mongodb.net/passport_screening_test
```

## Maven Test Goals

### Skip Tests During Build
```bash
mvn clean install -DskipTests
```

### Run Only Integration Tests
```bash
mvn verify
```

### Run Tests with Specific Profile
```bash
mvn test -Ptest-profile
```

### Generate Test Reports
```bash
mvn surefire-report:report
# View at: target/site/surefire-report.html
```

## Troubleshooting

### Tests Fail with MongoDB Connection Error
1. Ensure MongoDB is running on localhost:27017
2. Or update `application-test.yml` with correct MongoDB URI
3. Or use `-Dspring.data.mongodb.uri=...` to override:
   ```bash
   mvn test -Dspring.data.mongodb.uri=mongodb://localhost:27017/passport_screening_test
   ```

### Tesseract Not Found (OCR Tests Fail)
1. Install Tesseract:
   - Windows: `choco install tesseract`
   - macOS: `brew install tesseract`
   - Linux: `sudo apt-get install tesseract-ocr`
2. Set TESSDATA_PREFIX environment variable

### Tests Timeout
Increase timeout in pom.xml:
```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <configuration>
        <skipTests>false</skipTests>
        <argLine>-Xmx1024m</argLine>
        <systemPropertyVariables>
            <timeout.seconds>60</timeout.seconds>
        </systemPropertyVariables>
    </configuration>
</plugin>
```

## Continuous Integration

### GitHub Actions
See `.github/workflows/ci-cd.yml` for automated test execution on push/PR.

### Running in Docker
```bash
docker build -t passport-screening .
docker run -e MONGO_URI=mongodb://mongo:27017 passport-screening mvn test
```

## Best Practices

1. **Run tests before committing:**
   ```bash
   mvn clean test
   ```

2. **Run tests with coverage:**
   ```bash
   mvn clean test jacoco:report
   ```

3. **Run specific test suite:**
   ```bash
   mvn test -Dtest=SanctionsServiceTest,OCRServiceTest
   ```

4. **Use test profiles for different environments:**
   ```bash
   mvn test -Plocal-mongodb    # Local MongoDB
   mvn test -Patlas-mongodb    # MongoDB Atlas
