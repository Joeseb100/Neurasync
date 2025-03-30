#!/bin/bash

# Export environment variables from Replit secrets
export GEMINI_API_KEY=$GEMINI_API_KEY
export OPENAI_API_KEY=$OPENAI_API_KEY

# Run the Streamlit app
streamlit run streamlit_app.py