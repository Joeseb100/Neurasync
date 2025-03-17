#!/bin/bash

# Simple script to run the Neurasync application with all components
echo "Starting Neurasync application..."

# Check if required Python packages are installed
pip install streamlit flask flask-cors google-generativeai pillow requests &

# Start the main React application in the background
echo "Starting main application..."
npm run dev &
MAIN_PID=$!

# Wait for the main application to start
sleep 5

# Start the Streamlit emotion detection module
echo "Starting emotion detection module..."
./start_emotion_detection.sh &
STREAMLIT_PID=$!

# Function to handle cleanup on exit
cleanup() {
    echo "Shutting down Neurasync..."
    kill $MAIN_PID 2>/dev/null
    kill $STREAMLIT_PID 2>/dev/null
    exit 0
}

# Register the cleanup function for various signals
trap cleanup SIGINT SIGTERM

# Keep the script running
echo "Neurasync is running. Press Ctrl+C to stop."
wait