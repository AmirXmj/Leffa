FROM nvidia/cuda:11.8.0-cudnn8-runtime-ubuntu22.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
ENV PATH="/app/venv/bin:$PATH"

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-dev \
    python3-venv \
    git \
    wget \
    curl \
    ffmpeg \
    libsm6 \
    libxext6 \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy requirements
COPY requirements.txt /app/
RUN pip3 install --no-cache-dir --upgrade pip && \
    python3 -m venv /app/venv && \
    . /app/venv/bin/activate && \
    pip3 install --no-cache-dir -r requirements.txt

# Create directory structure for model checkpoints
RUN mkdir -p /app/ckpts

# Download model checkpoints if not mounted
RUN pip3 install --no-cache-dir huggingface_hub && \
    python3 -c "from huggingface_hub import snapshot_download; \
    import os; \
    if not os.path.exists('/app/ckpts/virtual_tryon.pth'): \
        print('Downloading model weights...'); \
        snapshot_download(repo_id='franciszzj/Leffa', local_dir='/app/ckpts'); \
        print('Download completed.')"

# Copy application code
COPY api /app/api
COPY leffa /app/leffa
COPY leffa_utils /app/leffa_utils

# Set the working directory to the app directory
WORKDIR /app/api

# Expose port
EXPOSE 8000

# Set health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run the FastAPI server
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"] 