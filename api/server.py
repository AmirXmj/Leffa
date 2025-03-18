import os
import io
import base64
import logging
from typing import Optional
from pathlib import Path
import tempfile

import numpy as np
from PIL import Image
from fastapi import FastAPI, File, Form, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="Leffa Virtual Try-On API", 
              description="API for virtual try-on using the Leffa model",
              version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Global variables for model and transform
leffa_model = None
leffa_transform = None
leffa_inference = None

class TryOnRequest(BaseModel):
    human_image: str  # Base64 encoded image
    garment_image: str  # Base64 encoded image
    guidance_scale: float = 2.5
    num_inference_steps: int = 30
    seed: int = 42
    ref_acceleration: bool = False

class TryOnResponse(BaseModel):
    result_image: str  # Base64 encoded output image
    processing_time: float

def decode_base64_image(encoded_image):
    """Decode a base64 image to a PIL Image"""
    try:
        image_data = base64.b64decode(encoded_image.split(',')[1] if ',' in encoded_image else encoded_image)
        return Image.open(io.BytesIO(image_data))
    except Exception as e:
        logger.error(f"Error decoding base64 image: {e}")
        raise HTTPException(status_code=400, detail="Invalid image data")

def encode_pil_to_base64(image):
    """Encode a PIL Image to base64"""
    buffered = io.BytesIO()
    image.save(buffered, format="JPEG")
    return base64.b64encode(buffered.getvalue()).decode("utf-8")

def save_uploaded_file(upload_file: UploadFile) -> str:
    """Save an uploaded file and return the path"""
    temp_dir = tempfile.mkdtemp()
    content = upload_file.file.read()
    file_path = os.path.join(temp_dir, upload_file.filename)
    with open(file_path, 'wb') as f:
        f.write(content)
    return file_path

def load_model():
    """Load the Leffa model"""
    global leffa_model, leffa_transform, leffa_inference
    
    if leffa_model is not None:
        return
    
    try:
        import time
        import torch
        from leffa.model import LeffaModel
        from leffa.inference import LeffaInference
        from leffa.transform import LeffaTransform
        from leffa_utils.utils import resize_and_center
        
        start_time = time.time()
        logger.info("Loading Leffa model...")
        
        # Check for CUDA
        device = "cuda" if torch.cuda.is_available() else "cpu"
        dtype = "float16" if device == "cuda" else "float32"
        logger.info(f"Using device: {device}, dtype: {dtype}")
        
        # Load model
        leffa_model = LeffaModel(
            pretrained_model_name_or_path="/app/ckpts/stable-diffusion-inpainting",
            pretrained_model="/app/ckpts/virtual_tryon.pth",
            dtype=dtype,
        )
        leffa_inference = LeffaInference(model=leffa_model)
        leffa_transform = LeffaTransform()
        
        logger.info(f"Model loaded in {time.time() - start_time:.2f} seconds")
    except Exception as e:
        logger.error(f"Error loading model: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to load model: {str(e)}")

def virtual_try_on(human_image, garment_image, guidance_scale=2.5, num_inference_steps=30, seed=42, ref_acceleration=False):
    """Run virtual try-on inference"""
    import time
    from leffa_utils.utils import resize_and_center
    
    start_time = time.time()
    
    try:
        # Resize images to the expected input size
        human_image = resize_and_center(human_image, 768, 1024)
        garment_image = resize_and_center(garment_image, 768, 1024)
        
        # Create a default mask and densepose (simple version without SCHP and DensePose)
        mask = Image.fromarray(np.ones_like(np.array(human_image)) * 255)
        densepose = Image.fromarray(np.ones_like(np.array(human_image)))
        
        # Transform inputs
        data = {
            "src_image": [human_image],
            "ref_image": [garment_image],
            "mask": [mask],
            "densepose": [densepose],
        }
        data = leffa_transform(data)
        
        # Run inference
        logger.info("Running inference...")
        output = leffa_inference(
            data,
            ref_acceleration=ref_acceleration,
            num_inference_steps=num_inference_steps,
            guidance_scale=guidance_scale,
            seed=seed,
        )
        
        # Get the generated image
        gen_image = output["generated_image"][0]
        processing_time = time.time() - start_time
        
        logger.info(f"Processing completed in {processing_time:.2f} seconds")
        return gen_image, processing_time
    except Exception as e:
        logger.error(f"Error during virtual try-on: {e}")
        raise HTTPException(status_code=500, detail=f"Error during virtual try-on: {str(e)}")

@app.on_event("startup")
async def startup_event():
    """Load model on startup"""
    load_model()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "model_loaded": leffa_model is not None}

@app.post("/try-on", response_model=TryOnResponse)
async def try_on(request: TryOnRequest):
    """Process a virtual try-on request with base64 encoded images"""
    try:
        # Decode images
        human_image = decode_base64_image(request.human_image)
        garment_image = decode_base64_image(request.garment_image)
        
        # Run virtual try-on
        result_image, processing_time = virtual_try_on(
            human_image, 
            garment_image,
            guidance_scale=request.guidance_scale,
            num_inference_steps=request.num_inference_steps,
            seed=request.seed,
            ref_acceleration=request.ref_acceleration
        )
        
        # Encode result image
        result_base64 = encode_pil_to_base64(result_image)
        
        return TryOnResponse(
            result_image=f"data:image/jpeg;base64,{result_base64}",
            processing_time=processing_time
        )
    except Exception as e:
        logger.error(f"Error processing try-on request: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/try-on/upload")
async def try_on_upload(
    human_image: UploadFile = File(...),
    garment_image: UploadFile = File(...),
    guidance_scale: float = Form(2.5),
    num_inference_steps: int = Form(30),
    seed: int = Form(42),
    ref_acceleration: bool = Form(False)
):
    """Process a virtual try-on request with uploaded files"""
    try:
        # Save uploaded files
        human_path = save_uploaded_file(human_image)
        garment_path = save_uploaded_file(garment_image)
        
        # Load images
        human_img = Image.open(human_path)
        garment_img = Image.open(garment_path)
        
        # Run virtual try-on
        result_image, processing_time = virtual_try_on(
            human_img, 
            garment_img,
            guidance_scale=guidance_scale,
            num_inference_steps=num_inference_steps,
            seed=seed,
            ref_acceleration=ref_acceleration
        )
        
        # Clean up temporary files
        os.remove(human_path)
        os.remove(garment_path)
        
        # Encode result image
        result_base64 = encode_pil_to_base64(result_image)
        
        return {
            "result_image": f"data:image/jpeg;base64,{result_base64}",
            "processing_time": processing_time
        }
    except Exception as e:
        logger.error(f"Error processing try-on upload: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=False) 