# Neurasync: AI-powered Mental Wellness Platform

Neurasync is an AI-powered wellness platform using facial emotion recognition and an AI chatbot to track and manage user stress levels.

## Features

- **Emotion Detection**: Uses webcam to analyze facial expressions and detect emotions
- **Stress Tracking**: Monitors stress levels over time
- **AI Chatbot**: Provides therapeutic conversations with Manassu, the AI companion
- **Personalized Recommendations**: Offers tailored suggestions based on detected emotions

## Components

### Main Web Application

The main Neurasync platform is a full-stack JavaScript application with:

- React/TypeScript frontend with modern UI components
- Node.js/Express backend
- In-memory storage for data persistence
- Gemini API integration for AI chatbot functionality with OpenAI fallback

### Streamlit Webcam Interface

A complementary Python-based Streamlit application that offers:

- Webcam-based emotion detection
- Direct interaction with the Gemini AI
- Stress level visualization
- Custom recommendations based on emotional state

## Architecture

Neurasync follows a modular architecture:

1. **Frontend**: React with shadcn/ui components
2. **Backend**: Express.js API server
3. **AI Services**: Gemini and OpenAI integration
4. **Emotion Analysis**: Vertex AI Vision (with Streamlit webcam interface)
5. **Data Storage**: In-memory storage with typed schemas