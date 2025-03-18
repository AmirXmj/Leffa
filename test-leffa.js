const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { spawn, exec } = require('child_process');

// Paths to the images
const humanImagePath = path.resolve(__dirname, 'human.jpg');
const garmentImagePath = path.resolve(__dirname, 'garment.jpg');
const outputImagePath = path.resolve(__dirname, 'output_tryon.jpg');

// Helper function to wait for a specified time
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Get command line arguments
const args = process.argv.slice(2);
const useTestMode = args.includes('--test-mode') || args.includes('-t');
const waitTime = useTestMode ? 10000 : 120000; // Wait 10 seconds in test mode, 2 minutes in full mode

// Helper function to check if a URL is responding
async function isUrlResponding(url, maxRetries = 10, retryInterval = 1000) {
    const fetchWithTimeout = (url, timeout) => {
        return Promise.race([
            fetch(url),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout))
        ]);
    };

    let retries = 0;
    while (retries < maxRetries) {
        try {
            const response = await fetchWithTimeout(url, 5000);
            if (response.ok) return true;
        } catch (error) {
            console.log(`Attempt ${retries + 1}/${maxRetries}: Server not responding (${error.message})`);
        }

        retries++;
        if (retries < maxRetries) {
            console.log(`Waiting ${retryInterval}ms before next attempt...`);
            await wait(retryInterval);
        }
    }

    return false;
}

// Make sure we have the test images
async function ensureTestImages() {
    // Check if we have the download script
    const downloadScriptPath = path.resolve(__dirname, 'download-test-images.js');

    if (!fs.existsSync(humanImagePath) || !fs.existsSync(garmentImagePath)) {
        console.log('Test images not found, attempting to download...');

        if (fs.existsSync(downloadScriptPath)) {
            try {
                // Run the download script
                await new Promise((resolve, reject) => {
                    const process = spawn('node', [downloadScriptPath], { stdio: 'inherit' });

                    process.on('close', (code) => {
                        if (code === 0) {
                            console.log('Download script completed successfully');
                            resolve();
                        } else {
                            reject(new Error(`Download script exited with code ${code}`));
                        }
                    });

                    process.on('error', (err) => {
                        reject(new Error(`Failed to run download script: ${err.message}`));
                    });
                });
            } catch (error) {
                console.error('Error running download script:', error);
                process.exit(1);
            }
        } else {
            console.error('Download script not found and test images are missing');
            process.exit(1);
        }
    }
}

// Main test function
async function testLeffaApp() {
    console.log(`Starting Leffa Virtual Try-On test in ${useTestMode ? 'TEST' : 'FULL'} mode...`);

    // Ensure we have test images
    await ensureTestImages();

    // Check if test images exist after potential download
    if (!fs.existsSync(humanImagePath)) {
        console.error(`Human image not found at ${humanImagePath}`);
        process.exit(1);
    }

    if (!fs.existsSync(garmentImagePath)) {
        console.error(`Garment image not found at ${garmentImagePath}`);
        process.exit(1);
    }

    // Delete previous output if it exists
    if (fs.existsSync(outputImagePath)) {
        try {
            fs.unlinkSync(outputImagePath);
            console.log('Removed previous output image');
        } catch (error) {
            console.error('Error removing previous output image:', error);
        }
    }

    // Check if the simple_ui.py script exists
    const scriptPath = path.resolve(__dirname, 'simple_ui.py');
    if (!fs.existsSync(scriptPath)) {
        console.error(`App script not found at ${scriptPath}`);
        process.exit(1);
    }

    // Start the Leffa app in background
    console.log('Starting the Leffa application...');
    let appProcess;

    try {
        // Prepare command arguments
        const pythonArgs = ['simple_ui.py'];
        if (useTestMode) {
            pythonArgs.push('--test');
        }
        // Start the Python script with regular Python (not relying on venv)
        console.log('Launching the app...');
        appProcess = spawn('python', ['simple_ui.py'], {
            detached: true,
            stdio: 'pipe', // Capture output for debugging
            cwd: __dirname
        });

        // Capture and log output for debugging
        appProcess.stdout.on('data', (data) => {
            console.log(`App output: ${data}`);
        });

        appProcess.stderr.on('data', (data) => {
            console.error(`App error: ${data}`);
        });

        // Give the app time to start
        console.log('Waiting for app to start...');
        await wait(5000);

        // Check if the app is responding
        console.log('Checking if the app is running...');
        const isAppRunning = await isUrlResponding('http://localhost:7860');

        if (!isAppRunning) {
            throw new Error('App failed to start or is not responding');
        }

        // Launch Puppeteer
        console.log('Launching browser...');
        const browser = await puppeteer.launch({
            headless: false, // Set to false to see the browser in action
            defaultViewport: null,
            args: ['--start-maximized'] // Start with browser maximized
        });

        const page = await browser.newPage();

        // Navigate to the app
        console.log('Navigating to the app...');
        await page.goto('http://localhost:7860', { waitUntil: 'networkidle2', timeout: 60000 });

        // Verify the page loaded
        console.log('Verifying page loaded...');
        await page.waitForSelector('h1', { timeout: 30000 });
        const title = await page.$eval('h1', el => el.textContent);
        console.log(`Found page title: ${title}`);

        // Upload human image
        console.log('Uploading human image...');
        const humanUploadHandle = await page.$('input[type=file]');
        await humanUploadHandle.uploadFile(humanImagePath);
        await wait(2000);

        // Upload garment image
        console.log('Uploading garment image...');
        const fileInputs = await page.$$('input[type=file]');
        if (fileInputs.length >= 2) {
            await fileInputs[1].uploadFile(garmentImagePath);
        } else {
            console.error('Could not find second file input');
        }
        await wait(2000);

        // Click the Generate button
        console.log('Clicking Generate button...');
        const buttons = await page.$$('button');
        let generateButton = null;

        for (const button of buttons) {
            const buttonText = await page.evaluate(btn => btn.textContent, button);
            if (buttonText.includes('Generate Try-On')) {
                generateButton = button;
                break;
            }
        }

        if (generateButton) {
            await generateButton.click();
            console.log('Generate button clicked');

            // Wait for processing (this might take a while)
            console.log('Waiting for processing (this might take a few minutes)...');
            await wait(120000); // Wait 2 minutes for processing

            // Check if the output file was created
            console.log('Checking for output file...');
            let attempts = 0;
            const maxAttempts = 10;

            while (attempts < maxAttempts) {
                if (fs.existsSync(outputImagePath)) {
                    console.log(`Success! Output image created at: ${outputImagePath}`);
                    break;
                } else {
                    console.log(`Output image not found, waiting... (${attempts + 1}/${maxAttempts})`);
                    await wait(30000); // Wait 30 seconds between checks
                    attempts++;
                }
            }

            if (attempts === maxAttempts) {
                console.error('Failed to generate output image after maximum attempts');
            }
        } else {
            console.error('Could not find Generate button');
        }

        // Take a screenshot of the final state
        console.log('Taking screenshot...');
        await page.screenshot({ path: 'leffa_test_result.png', fullPage: true });

        // Close the browser
        await browser.close();
        console.log('Browser closed');

    } catch (error) {
        console.error('Test error:', error);
    } finally {
        // Clean up: kill the app process if it was started
        if (appProcess) {
            console.log('Stopping the app...');
            try {
                process.kill(-appProcess.pid);
            } catch (error) {
                console.error('Error stopping the app:', error);
            }
        }

        console.log('Test completed');
    }
}

// Run the test
testLeffaApp().catch(console.error);

// Run the test
testLeffaApp().catch(console.error);