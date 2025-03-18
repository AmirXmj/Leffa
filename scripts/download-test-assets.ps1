# PowerShell script to download sample test images for Leffa virtual try-on tests

# Create directory if it doesn't exist
$testAssetsDir = "tests\test-assets"
if (-not (Test-Path $testAssetsDir)) {
    New-Item -Path $testAssetsDir -ItemType Directory -Force | Out-Null
    Write-Host "Created directory: $testAssetsDir"
}

# Download sample human image
Write-Host "Downloading sample human image..."
$humanImageUrl = "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?cs=srgb&dl=pexels-chloe-1043471.jpg&fm=jpg"
$humanImagePath = Join-Path $testAssetsDir "human.jpg"
$webClient = New-Object System.Net.WebClient
$webClient.DownloadFile($humanImageUrl, $humanImagePath)

# Download sample garment image
Write-Host "Downloading sample garment image..."
$garmentImageUrl = "https://images.pexels.com/photos/19090/pexels-photo.jpg?cs=srgb&dl=pexels-web-donut-19090.jpg&fm=jpg"
$garmentImagePath = Join-Path $testAssetsDir "garment.jpg"
$webClient.DownloadFile($garmentImageUrl, $garmentImagePath)

Write-Host "Test assets downloaded successfully."
Write-Host "Human image: $humanImagePath"
Write-Host "Garment image: $garmentImagePath" 