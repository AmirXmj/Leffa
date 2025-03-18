# *Leffa*: Learning Flow Fields in Attention for Controllable Person Image Generation

[📚 Paper](https://arxiv.org/abs/2412.08486) - [🤖 Code](https://github.com/franciszzj/Leffa) - [🔥 Demo](https://huggingface.co/spaces/franciszzj/Leffa) - [🤗 Model](https://huggingface.co/franciszzj/Leffa)

Star ⭐ us if you like it!

## News
- 09/Jan/2025. Inference defaults to float16, generating an image in 6 seconds (on A100).
- 02/Jan/2025. Update the mask generator to improve results. Add ref unet acceleration, boosting prediction speed by 30%. Include more controls in Advanced Options to enhance user experience. Enable intermediate result output for easier development. Enjoy using it!
- 18/Dec/2024. Thanks to @[StartHua](https://github.com/StartHua) for integrating Leffa into ComfyUI! Here is the [repo](https://github.com/StartHua/Comfyui_leffa)!
- 16/Dec/2024. The virtual try-on [model](https://huggingface.co/franciszzj/Leffa/blob/main/virtual_tryon_dc.pth) trained on DressCode is released.
- 12/Dec/2024. The HuggingFace [demo](https://huggingface.co/spaces/franciszzj/Leffa) and [models](https://huggingface.co/franciszzj/Leffa) (virtual try-on model trained on VITON-HD and pose transfer model trained on DeepFashion) are released.
- 11/Dec/2024. The [arXiv](https://arxiv.org/abs/2412.08486) version of the paper is released.


*[Leffa](https://en.wiktionary.org/wiki/leffa)* is a unified framework for controllable person image generation that enables precise manipulation of both appearance (i.e., virtual try-on) and pose (i.e., pose transfer).

<div align="center">
  <img src="https://huggingface.co/franciszzj/Leffa/resolve/main/assets/teaser.png" width="100%" height="100%"/>
</div>

## Abstract
Controllable person image generation aims to generate a person image conditioned on reference images, allowing precise control over the person's appearance or pose. However, prior methods often distort fine-grained textural details from the reference image, despite achieving high overall image quality. We attribute these distortions to inadequate attention to corresponding regions in the reference image. To address this, we thereby propose **le**arning **f**low **f**ields in **a**ttention (***Leffa***), which explicitly guides the target query to attend to the correct reference key in the attention layer during training. Specifically, it is realized via a regularization loss on top of the attention map within a diffusion-based baseline. Our extensive experiments show that *Leffa* achieves state-of-the-art performance in controlling appearance (virtual try-on) and pose (pose transfer), significantly reducing fine-grained detail distortion while maintaining high image quality. Additionally, we show that our loss is model-agnostic and can be used to improve the performance of other diffusion models.

## Method
An overview of our *Leffa* training pipeline for controllable person image generation. The left is our diffusion-based baseline; the right is our *Leffa* loss. Note that Isrc and Itgt are the same image during training.

<div align="center">
  <img src="https://huggingface.co/franciszzj/Leffa/resolve/main/assets/leffa.png" width="100%" height="100%"/>
</div>

## Visualization
Qualitative visual results comparison with other methods. The input person image for the pose transfer is generated using our method in the virtual try-on. The visualization results demonstrate that our method not only generates high-quality images but also greatly reduces the distortion of fine-grained details.

<div align="center">
  <img src="https://huggingface.co/franciszzj/Leffa/resolve/main/assets/vis_result.png" width="100%" height="100%"/>
</div>

## Installation
Create a conda environment and install requirements:
```shell
conda create -n leffa python==3.10
conda activate leffa
cd Leffa
pip install -r requirements.txt
```

## Gradio App
Run locally:
```shell
python app.py
```

## Evaluation
We use this [code](https://github.com/franciszzj/VtonEval) for metric evaluation.

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=franciszzj/Leffa&type=Date)](https://star-history.com/#franciszzj/Leffa&Date)

## Acknowledgement
Our code is based on [Diffusers](https://github.com/huggingface/diffusers) and [Transformers](https://github.com/huggingface/transformers).
We use [SCHP](https://github.com/GoGoDuck912/Self-Correction-Human-Parsing/tree/master) and [DensePose](https://github.com/facebookresearch/DensePose) to generate masks and densepose in our [Demo](https://huggingface.co/spaces/franciszzj/Leffa).
We also referred to the code of [IDM-VTON](https://github.com/yisol/IDM-VTON) and [CatVTON](https://github.com/Zheng-Chong/CatVTON).

## Citation
If you find our work helpful or inspiring, please feel free to cite it.
```
@article{zhou2024learning,
  title={Learning Flow Fields in Attention for Controllable Person Image Generation}, 
  author={Zhou, Zijian and Liu, Shikun and Han, Xiao and Liu, Haozhe and Ng, Kam Woh and Xie, Tian and Cong, Yuren and Li, Hang and Xu, Mengmeng and Pérez-Rúa, Juan-Manuel and Patel, Aditya and Xiang, Tao and Shi, Miaojing and He, Sen},
  journal={arXiv preprint arXiv:2412.08486},
  year={2024},
}
```

# Leffa Virtual Try-On

A virtual try-on application using the Leffa model to digitally fit garments onto people.

## Overview

This application allows users to upload an image of a person and an image of a garment, then generates a realistic image of the person wearing the garment. It consists of:

1. **Model Service**: A FastAPI server that exposes the Leffa model's functionality via a REST API
2. **Frontend**: A React application that provides a user-friendly interface
3. **Tests**: End-to-end tests using Puppeteer and Jest

## Requirements

- Docker and Docker Compose
- NVIDIA GPU with CUDA support (for model inference)
- NVIDIA Container Toolkit (for GPU access in Docker)
- 16GB+ RAM recommended

## Setup

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd Leffa
   ```

2. Download the model weights:
   ```bash
   # Create directory for model weights
   mkdir -p model_weights
   
   # Download the model weights from HuggingFace or your preferred source
   # Example (you'll need git-lfs installed):
   git clone https://huggingface.co/patrickjohncyh/leffa.git model_weights
   ```

3. Create a `.env` file in the root directory with the following content:
   ```
   MODEL_PATH=/app/model_weights
   CUDA_VISIBLE_DEVICES=0
   ```

## Running the Application

1. Start the services:
   ```bash
   docker-compose up -d
   ```

2. Access the application:
   - Frontend: http://localhost:3000
   - API: http://localhost:8000/docs

3. To stop the services:
   ```bash
   docker-compose down
   ```

## Running Tests

Run the end-to-end tests using:

```bash
docker-compose --profile testing up leffa-tests
```

Test results, including screenshots, will be saved to the `tests/results` directory.

### Test Assets

For running Puppeteer tests, you'll need sample images. Use the provided scripts to download test assets:

**Linux/macOS:**
```bash
bash scripts/download-test-assets.sh
```

**Windows:**
```powershell
powershell -ExecutionPolicy Bypass -File scripts/download-test-assets.ps1
```

This will download sample human and garment images to the `tests/test-assets` directory.

## API Endpoints

The model service exposes the following endpoints:

- `POST /tryon`: Process a try-on request
  - Request body (multipart/form-data):
    - `human_image`: Image of the person
    - `garment_image`: Image of the garment
    - `guidance_scale` (optional): Guidance scale (default: 2.5)
    - `inference_steps` (optional): Number of inference steps (default: 50)
    - `seed` (optional): Random seed (default: random)
  - Response: The generated image

- `GET /health`: Check the service health

## Project Structure

```
Leffa/
├── docker-compose.yml      # Docker Compose configuration
├── .env                    # Environment variables
├── model/                  # Model service
│   ├── Dockerfile          # Docker configuration for the model service
│   ├── main.py             # FastAPI application
│   └── ...                 # Model code
├── frontend/               # React frontend
│   ├── Dockerfile          # Docker configuration for the frontend
│   ├── nginx.conf          # Nginx configuration
│   └── ...                 # React application code
├── tests/                  # End-to-end tests
│   ├── Dockerfile          # Docker configuration for tests
│   ├── tryon.test.js       # Puppeteer test suite
│   └── ...                 # Test configuration and assets
└── model_weights/          # Model weights (gitignored)
```

## Development

### Frontend Development

To develop the frontend locally:

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. The frontend will be available at http://localhost:3000 and will proxy API requests to the backend at http://localhost:8000.

### API Development

To develop the API locally:

1. Create a Python virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   cd model
   pip install -r requirements.txt
   ```

3. Start the FastAPI server:
   ```bash
   cd model
   uvicorn main:app --reload
   ```

4. The API will be available at http://localhost:8000.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Leffa: Latent Embedding for Virtual Try-On](https://github.com/patrickjohncyh/Leffa) by Patrick John et al.
- This application structure follows best practices for containerized full-stack applications.