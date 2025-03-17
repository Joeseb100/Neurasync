#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Starting Neurasync Emotion Detection Module                   ║"
echo "╚════════════════════════════════════════════════════════════════╝"

# Check if the main app is running
if ! curl -s http://localhost:5000 > /dev/null; then
  echo "⚠️  Main Neurasync application doesn't appear to be running."
  echo "   Please start the main application first with: npm run dev"
  echo "   Or use the 'Start application' workflow."
  echo ""
  echo "   Continue anyway? (y/n)"
  read -r continue_anyway
  
  if [[ "$continue_anyway" != "y" ]]; then
    echo "Exiting. Please start the main application first."
    exit 1
  fi
fi

echo "📷 Starting webcam-powered emotion detection module..."
echo "🔑 Using API keys from environment variables"

# Export environment variables from Replit secrets
export GEMINI_API_KEY=$GEMINI_API_KEY
export OPENAI_API_KEY=$OPENAI_API_KEY

# Run the Streamlit app
echo "🚀 Launching Streamlit application..."
echo "📊 Once started, the interface will be available at:"
echo "   https://$REPL_SLUG.$REPL_OWNER.repl.co/?port=8501"
echo ""
echo "⌛ Please wait while the application starts..."

streamlit run streamlit_app.py