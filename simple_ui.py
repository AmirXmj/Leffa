import os
import sys
import argparse
import gradio as gr
from pathlib import Path

# Check if we're in testing mode
def is_testing_mode():
    return "--test" in sys.argv

# Parse command line arguments
def parse_args():
    parser = argparse.ArgumentParser(description="Leffa Virtual Try-On Simple UI")
    parser.add_argument("--test", action="store_true", help="Run in test mode with simplified processing")
    parser.add_argument("--port", type=int, default=7860, help="Port to run the Gradio app on")
    return parser.parse_args()

# This is a simplified mock function for testing
def mock_virtual_tryon(human_image, garment_image):
    """Mock function that simply combines the images for testing purposes"""
    from PIL import Image
    import numpy as np
    import time
    
    print("Running mock virtual try-on...")
    
    # Ensure the images are PIL Images
    if isinstance(human_image, str):
        human_image = Image.open(human_image)
    if isinstance(garment_image, str):
        garment_image = Image.open(garment_image)
    
    # Resize images
    human_image = human_image.resize((512, 512))
    garment_image = garment_image.resize((512, 512))
    
    # Simulate processing time
    time.sleep(3)
    
    # Simple compositing (for testing only)
    human_array = np.array(human_image)
    garment_array = np.array(garment_image)
    
    # Create a simple blend (50% human, 50% garment)
    blended = (human_array * 0.7 + garment_array * 0.3).astype(np.uint8)
    result = Image.fromarray(blended)
    
    # Save the output
    output_path = "./output_tryon.jpg"
    result.save(output_path)
    print(f"Mock try-on image saved to {output_path}")
    
    return result

def virtual_tryon(human_image, garment_image, save_output=True):
    """
    Perform virtual try-on with the Leffa model
    """
    try:
        # If in test mode, use the mock function
        if is_testing_mode():
            return mock_virtual_tryon(human_image, garment_image)
        
        # Import required modules
        from leffa.model import LeffaModel
        from leffa.inference import LeffaInference
        from leffa.transform import LeffaTransform
        from leffa_utils.utils import resize_and_center
        
        from PIL import Image
        import numpy as np
        
        # Check for CUDA availability
        import torch
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
        if isinstance(human_image, str):
            human_image = Image.open(human_image)
        if isinstance(garment_image, str):
            garment_image = Image.open(garment_image)
        
        # Resize images to the expected input size
        human_image = resize_and_center(human_image, 768, 1024)
        garment_image = resize_and_center(garment_image, 768, 1024)
        
        # Create a default mask (all white)
        mask = Image.fromarray(np.ones_like(np.array(human_image)) * 255)
        
        # Create a default densepose (all ones)
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
        print("Generating try-on image...")
        output = inference(
            data,
            ref_acceleration=False,
            num_inference_steps=30,
            guidance_scale=2.5,
            seed=42,
        )
        
        # Get the generated image
        gen_image = output["generated_image"][0]
        
        # Save the output if requested
        if save_output:
            output_path = "./output_tryon.jpg"
            gen_image.save(output_path)
            print(f"Try-on image saved to {output_path}")
            
        return gen_image
        
    except ImportError as e:
        print(f"Error: {e}")
        print("\nAdditional dependencies are required to run the full model.")
        print("Using mock implementation for testing purposes.")
        return mock_virtual_tryon(human_image, garment_image)
    except Exception as e:
        print(f"Error during virtual try-on: {e}")
        print("Using mock implementation as fallback.")
        return mock_virtual_tryon(human_image, garment_image)

def setup_models():
    """Download necessary models from HuggingFace if not already downloaded"""
    # Skip if in test mode
    if is_testing_mode():
        print("Running in test mode, skipping model download")
        return True
        
    if not os.path.exists("./ckpts"):
        print("Downloading models from HuggingFace (this may take some time)...")
        try:
            from huggingface_hub import snapshot_download
            snapshot_download(repo_id="franciszzj/Leffa", local_dir="./ckpts")
            print("Models downloaded successfully!")
        except Exception as e:
            print(f"Error downloading models: {e}")
            print("Please download models manually from https://huggingface.co/franciszzj/Leffa")
            return False
    return True

def tryon_ui(args):
    """Create a simple Gradio UI for virtual try-on"""
    # Check if models are available (unless in test mode)
    if not is_testing_mode():
        if not setup_models():
            print("Failed to set up models. Running in test mode.")
    
    def process_images(human, garment):
        result = virtual_tryon(human, garment)
        if result is None:
            return None
        return result
    
    # Create the Gradio interface
    with gr.Blocks(title="Leffa Virtual Try-On") as demo:
        gr.Markdown("# Leffa Virtual Try-On")
        gr.Markdown("Upload a person image and a garment image to see how the garment would look on the person.")
        
        with gr.Row():
            with gr.Column():
                human_input = gr.Image(label="Person Image", type="pil")
                garment_input = gr.Image(label="Garment Image", type="pil")
                try_on_button = gr.Button("Generate Try-On")
            
            with gr.Column():
                output_image = gr.Image(label="Try-On Result")
                
        try_on_button.click(
            fn=process_images,
            inputs=[human_input, garment_input],
            outputs=output_image
        )
        
        mode = "TEST MODE" if is_testing_mode() else "NORMAL MODE"
        gr.Markdown(f"Note: Running in {mode}")
    
    return demo

if __name__ == "__main__":
    args = parse_args()
    demo = tryon_ui(args)
    if demo:
        demo.launch(server_port=args.port) 