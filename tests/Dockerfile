FROM node:18-slim

# Install dependencies for Puppeteer
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libxss1 \
    libnss3 \
    libatk-bridge2.0-0 \
    libcups2 \
    libxkbcommon0 \
    libgtk-3-0 \
    libasound2 \
    libdrm2 \
    libgbm1 \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy test files
COPY . .

# Create directory for results
RUN mkdir -p /app/results

# Set default command to run tests
CMD ["npm", "test"] 