# Leffa Tests

This directory contains end-to-end tests for the Leffa virtual try-on application.

## Test Assets

The `test-assets` directory contains sample images used for testing the virtual try-on functionality:

- `human.jpg`: A sample human image for testing
- `garment.jpg`: A sample garment image for testing

### Downloading Test Assets

If the test assets are not present, you can download them using the provided scripts:

**Linux/macOS:**
```bash
bash scripts/download-test-assets.sh
```

**Windows:**
```powershell
powershell -ExecutionPolicy Bypass -File scripts/download-test-assets.ps1
```

## Running Tests

To run the tests:

```bash
docker-compose --profile testing up leffa-tests
```

Test results, including screenshots, will be saved to the `tests/results` directory.

## Test Structure

- `e2e/`: Contains end-to-end tests using Puppeteer
- `test-assets/`: Contains sample images for testing
- `results/`: Contains test results and screenshots (created during test runs)

## Writing New Tests

When writing new tests:

1. Use the sample images in `test-assets/` or add new ones as needed
2. Follow the existing test patterns in the `e2e/` directory
3. Make sure to clean up any test artifacts in the `afterAll` or `afterEach` blocks

## Structure

- `tryon.test.js` - The main test suite for the virtual try-on functionality
- `jest.config.js` - Jest configuration
- `jest.setup.js` - Setup file for Jest with global configurations
- `test-assets/` - Test images for the test suite
- `results/` - Generated test results (screenshots, etc.)

## Requirements

- Node.js 16+
- npm or yarn

## Running Tests Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run tests:
   ```bash
   npm test
   ```

## Running Tests in Docker

The tests can also be run in Docker using the provided Dockerfile:

1. Build the Docker image:
   ```bash
   docker build -t leffa-tests .
   ```

2. Run the tests in Docker:
   ```bash
   docker run -e FRONTEND_URL=http://leffa-frontend:3000 --network leffa-network leffa-tests
   ```

## Environment Variables

- `FRONTEND_URL` - URL of the frontend application (default: http://leffa-frontend)
- `WAIT_TIMEOUT` - Timeout for waiting on page elements (default: 30000ms)

## Test Output

- Screenshots are saved to the `results` directory
- JUnit XML report is saved to `results/junit.xml` 