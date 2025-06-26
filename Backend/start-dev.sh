#!/bin/bash
# Development server startup script

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is required but not installed."
    exit 1
fi

# Check if pip is available
if ! command -v pip &> /dev/null; then
    echo "pip is required but not installed."
    exit 1
fi

# Install dependencies if requirements.txt exists and is newer than last install
if [ -f "requirements.txt" ]; then
    echo "Installing Python dependencies..."
    pip install -r requirements.txt
fi

# Copy environment file if it doesn't exist
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "Please update .env with your Google Cloud credentials"
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Warning: .env file not found. Using default environment variables."
fi

# Start the development server
echo "Starting FastAPI development server..."
echo "API will be available at http://localhost:8000"
echo "API docs will be available at http://localhost:8000/docs"

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
