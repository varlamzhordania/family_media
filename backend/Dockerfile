# Use the official slim Python image
FROM python:3.12-slim

# Set working directory
WORKDIR /home/family/backend

# Environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies and clean cache in a single layer
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip
RUN pip install --no-cache-dir --upgrade pip

# Copy only requirements first for caching
COPY ./requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install additional packages
RUN pip install --no-cache-dir 'Twisted[tls,http2]' --no-binary :all:


# Copy project code
COPY . .