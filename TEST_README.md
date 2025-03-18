# Leffa Virtual Try-On Testing

This directory contains scripts for testing the Leffa Virtual Try-On application using Puppeteer, a Node.js library for automating browser interactions.

## Prerequisites

- Node.js (v14 or later)
- Python 3.8 or later
- pip (for Python package management)

## Setup

1. Install Node.js dependencies:
   ```bash
   npm install
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Download test images (if not already present):
   ```bash
   npm run download-images
   ```

## Running Tests

### 1. Test Mode (Simplified)

For quick testing without downloading the full model:

```bash
npm test
```

This will:
1. Start the Leffa app in test mode using `python simple_ui.py --test`
2. Launch a browser with Puppeteer
3. Navigate to the app
4. Upload test images
5. Click the "Generate Try-On" button
6. Wait for processing
7. Check if the output file was created
8. Take a screenshot of the final state

### 2. Full Test (with actual model)

For comprehensive testing with the actual model:

```bash
# First, make sure the Python environment is set up
pip install -r requirements.txt

# Then run the test without the --test flag
node test-leffa.js
```

Note: This requires downloading the model files from HuggingFace, which may take some time.

## Test Files

- `test-leffa.js`: Main Puppeteer test script
- `download-test-images.js`: Script to download test images from HuggingFace
- `simple_ui.py`: Simplified Gradio UI for the Leffa app (supports test mode)
- `human.jpg`: Test image of a person
- `garment.jpg`: Test image of a garment

## Output

The test will generate:
- `output_tryon.jpg`: The generated try-on image
- `leffa_test_result.png`: Screenshot of the final state of the app

## Troubleshooting

1. **App fails to start:**
   - Check if Python and required packages are installed
   - Try running with the `--test` flag: `python simple_ui.py --test`

2. **Images don't upload:**
   - Make sure test images are in the correct location
   - Run `npm run download-images` to download test images

3. **Browser doesn't launch:**
   - Check if Puppeteer is installed: `npm install puppeteer`
   - Try running in non-headless mode (already configured in test script)

4. **Processing takes too long:**
   - Use test mode for faster results: `python simple_ui.py --test`
   - Adjust timeout values in the test script if needed

## Notes

- Test mode uses a mock implementation that blends the images instead of using the actual model
- The actual model requires significant resources and may take several minutes to process an image
- For best results with the actual model, use a machine with a GPU 