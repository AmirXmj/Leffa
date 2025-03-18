#!/bin/bash
# Script to download sample test images for Leffa virtual try-on tests

# Create directory if it doesn't exist
mkdir -p tests/test-assets

# Download sample human image
echo "Downloading sample human image..."
curl -L "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?cs=srgb&dl=pexels-chloe-1043471.jpg&fm=jpg" -o tests/test-assets/human.jpg

# Download sample garment image
echo "Downloading sample garment image..."
curl -L "https://images.pexels.com/photos/19090/pexels-photo.jpg?cs=srgb&dl=pexels-web-donut-19090.jpg&fm=jpg" -o tests/test-assets/garment.jpg

echo "Test assets downloaded successfully."
echo "Human image: tests/test-assets/human.jpg"
echo "Garment image: tests/test-assets/garment.jpg" 