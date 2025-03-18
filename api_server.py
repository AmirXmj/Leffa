import os
from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
import uvicorn
import logging
from PIL import Image
import io
import uuid
import shutil
import base64
from pathlib import Path

# Get port from environment variable
PORT = int(os.getenv("PORT", "9000"))

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("leffa-api")

# Create FastAPI app
app = FastAPI(title="Leffa Model API")

# Create output directory if it doesn't exist
output_dir = Path("./output")
output_dir.mkdir(exist_ok=True)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "Leffa model server is running"}

@app.get("/")
async def root():
    return {"message": "Welcome to Leffa virtual try-on API. Use /tryon endpoint to try on garments."}

@app.post("/tryon")
async def try_on(
    human_image: UploadFile = File(...),
    garment_image: UploadFile = File(...),
):
    try:
        # Generate a unique filename for the output
        output_filename = f"tryon_{uuid.uuid4()}.jpg"
        output_path = output_dir / output_filename
        
        # Read and process the images
        human_img = await process_image(human_image)
        garment_img = await process_image(garment_image)
        
        # Save the input images for debugging
        human_img.save(output_dir / f"human_{output_filename}")
        garment_img.save(output_dir / f"garment_{output_filename}")
        
        # TODO: In a real implementation, we would call the Leffa model to do the actual try-on
        # For now, we'll just create a simple composite as a placeholder
        try_on_result = create_simple_tryon(human_img, garment_img)
        
        # Save the result
        try_on_result.save(output_path)
        
        # Convert the image to base64 for direct display in the UI
        with open(output_path, "rb") as img_file:
            img_data = base64.b64encode(img_file.read()).decode()
        
        return {
            "message": "Try-on completed successfully",
            "output_file": str(output_path),
            "image_data": f"data:image/jpeg;base64,{img_data}"
        }
        
    except Exception as e:
        logger.error(f"Error in try_on endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing images: {str(e)}")

async def process_image(uploaded_file: UploadFile) -> Image.Image:
    """Process an uploaded image file into a PIL Image."""
    image_data = await uploaded_file.read()
    return Image.open(io.BytesIO(image_data))

def create_simple_tryon(human_img: Image.Image, garment_img: Image.Image) -> Image.Image:
    """Create a simple composite of human and garment as a placeholder."""
    # Resize garment to be proportional to the human
    garment_width = human_img.width // 2
    garment_height = int(garment_img.height * (garment_width / garment_img.width))
    garment_img = garment_img.resize((garment_width, garment_height))
    
    # Create a new image
    result = human_img.copy()
    
    # Paste the garment in the middle of the human image
    paste_x = (human_img.width - garment_width) // 2
    paste_y = human_img.height // 3  # Position it around the upper body
    
    # For simple demonstration, we'll just paste the garment
    # A real try-on model would use more sophisticated processing
    result.paste(garment_img, (paste_x, paste_y), garment_img if garment_img.mode == 'RGBA' else None)
    
    return result

if __name__ == "__main__":
    logger.info(f"Starting Leffa API server on port {PORT}")
    uvicorn.run(app, host="0.0.0.0", port=PORT)
