const fs = require('fs');
const https = require('https');
const path = require('path');

// Sample image URLs
const humanImageUrl = 'https://huggingface.co/franciszzj/Leffa/resolve/main/examples/person1/01350_00.jpg';
const garmentImageUrl = 'https://huggingface.co/franciszzj/Leffa/resolve/main/examples/garment/00113_00.jpg';

// Target file paths
const humanImagePath = path.join(__dirname, 'human.jpg');
const garmentImagePath = path.join(__dirname, 'garment.jpg');

// Helper function to download a file
function downloadFile(url, targetPath) {
    return new Promise((resolve, reject) => {
        console.log(`Downloading ${url} to ${targetPath}...`);

        // Create a write stream to save the file
        const file = fs.createWriteStream(targetPath);

        // Request the file
        https.get(url, (response) => {
            // Check for successful response
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download file, status code: ${response.statusCode}`));
                return;
            }

            // Pipe the response to the file
            response.pipe(file);

            // Handle file completion
            file.on('finish', () => {
                file.close();
                console.log(`Download completed: ${targetPath}`);
                resolve();
            });
        }).on('error', (err) => {
            // Handle download errors
            fs.unlink(targetPath, () => {}); // Delete the file if there was an error
            reject(err);
        });

        // Handle file errors
        file.on('error', (err) => {
            fs.unlink(targetPath, () => {}); // Delete the file if there was an error
            reject(err);
        });
    });
}

// Main function to download test images
async function downloadTestImages() {
    try {
        // Download human image if it doesn't exist
        if (!fs.existsSync(humanImagePath)) {
            await downloadFile(humanImageUrl, humanImagePath);
        } else {
            console.log(`Human image already exists at ${humanImagePath}`);
        }

        // Download garment image if it doesn't exist
        if (!fs.existsSync(garmentImagePath)) {
            await downloadFile(garmentImageUrl, garmentImagePath);
        } else {
            console.log(`Garment image already exists at ${garmentImagePath}`);
        }

        console.log('All test images downloaded successfully!');
    } catch (error) {
        console.error('Error downloading test images:', error);
    }
}

// Run the download function
downloadTestImages();