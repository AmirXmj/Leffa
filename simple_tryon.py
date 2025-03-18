import os
import argparse
import sys
from pathlib import Path
from huggingface_hub import snapshot_download
import torch

def setup_models():
    """Download necessary models from HuggingFace if not already downloaded"""
    if not os.path.exists("./ckpts"):
        print("Downloading models from HuggingFace (this may take some time)...")
        try:
            snapshot_download(repo_id="franciszzj/Leffa", local_dir="./ckpts")
            print("Models downloaded successfully!")
        except Exception as e:
            print(f"Error downloading models: {e}")
            print("Please download models manually from https://huggingface.co/franciszzj/Leffa")
            sys.exit(1)

def virtual_tryon(human_path, garment_path, output_path):
    """
    Perform virtual try-on with the Leffa model
    
    Args:
        human_path: Path to the human image
        garment_path: Path to the garment image
        output_path: Path to save the output image
    """
    try:
        # Import only after ensuring models are downloaded
        from leffa.model import LeffaModel
        from leffa.inference import LeffaInference
        from leffa.transform import LeffaTransform
        from leffa_utils.utils import resize_and_center
        
        from PIL import Image
        import numpy as np
        
        # Check for CUDA availability
        device = "cuda" if torch.cuda.is_available() else "cpu"
        dtype = "float16" if device == "cuda" else "float32"
        print(f"Using device: {device}, dtype: {dtype}")
        
        # Load the model
        print("Loading Leffa model...")
        model = LeffaModel(
            pretrained_model_name_or_path="./ckpts/stable-diffusion-inpainting",
            pretrained_model="./ckpts/virtual_tryon.pth",
            dtype=dtype,
        )
        inference = LeffaInference(model=model)
        
        # Load and preprocess images
        print("Processing images...")
        human_image = Image.open(human_path)
        garment_image = Image.open(garment_path)
        
        # Resize images to the expected input size
        human_image = resize_and_center(human_image, 768, 1024)
        garment_image = resize_and_center(garment_image, 768, 1024)
        
        # Create a default mask (all white)
        mask = Image.fromarray(np.ones_like(np.array(human_image)) * 255)
        
        # Create a default densepose (all ones)
        # Note: This is a simplified approach, actual results will be better with proper DensePose
        densepose = Image.fromarray(np.ones_like(np.array(human_image)))
        
        # Transform inputs
        transform = LeffaTransform()
        data = {
            "src_image": [human_image],
            "ref_image": [garment_image],
            "mask": [mask],
            "densepose": [densepose],
        }
        data = transform(data)
        
        # Run inference
        print("Generating try-on image (this may take a few minutes)...")
        output = inference(
            data,
            ref_acceleration=False,
            num_inference_steps=30,
            guidance_scale=2.5,
            seed=42,
        )
        
        # Save the generated image
        gen_image = output["generated_image"][0]
        gen_image.save(output_path)
        print(f"Try-on image saved to {output_path}")
        
    except ImportError as e:
        print(f"Error: {e}")
        print("\nAdditional dependencies are required to run the full model.")
        print("You need to install:")
        print("1. SCHP for human parsing: https://github.com/GoGoDuck912/Self-Correction-Human-Parsing")
        print("2. DensePose: https://github.com/facebookresearch/DensePose")
        print("\nAlternatively, you can use the hosted demo at: https://huggingface.co/spaces/franciszzj/Leffa")
        sys.exit(1)
    except Exception as e:
        print(f"Error during virtual try-on: {e}")
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="Simple Leffa Virtual Try-On")
    parser.add_argument("--human", default="./human.jpg", help="Path to human image (default: ./human.jpg)")
    parser.add_argument("--garment", default="./garment.jpg", help="Path to garment image (default: ./garment.jpg)")
    parser.add_argument("--output", default="./output_tryon.jpg", help="Path to save output image (default: ./output_tryon.jpg)")
    args = parser.parse_args()
    
    # Check if input files exist
    if not os.path.exists(args.human):
        print(f"Error: Human image not found at {args.human}")
        sys.exit(1)
    
    if not os.path.exists(args.garment):
        print(f"Error: Garment image not found at {args.garment}")
        sys.exit(1)
    
    # Ensure output directory exists
    output_dir = os.path.dirname(os.path.abspath(args.output))
    os.makedirs(output_dir, exist_ok=True)
    
    # Setup models
    setup_models()
    
    # Perform virtual try-on
    virtual_tryon(args.human, args.garment, args.output)

if __name__ == "__main__":
    main() 