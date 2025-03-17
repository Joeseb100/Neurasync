import streamlit as st
import google.generativeai as genai
import os
import cv2
import numpy as np
from PIL import Image
import base64
import io
import requests
import json
from datetime import datetime
from streamlit.web.server.server import Server
import threading

# Page configuration
st.set_page_config(
    page_title="Neurasync - Your Personal AI Therapist",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Custom CSS for minimalist design
st.markdown("""
<style>
    /* Main container */
    .main {
        background: linear-gradient(135deg, #f8f9fa, #e9ecef);
        padding: 2rem;
        border-radius: 1rem;
    }
    
    /* Headers */
    h1, h2, h3 {
        font-family: 'Inter', sans-serif;
        font-weight: 600;
        background: linear-gradient(135deg, #7209b7, #3a0ca3);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    
    /* Buttons */
    .stButton > button {
        background: linear-gradient(135deg, #4cc9f0, #4361ee);
        border: none;
        border-radius: 0.75rem;
        color: white;
        padding: 0.75rem 1.5rem;
        font-weight: 500;
        transition: all 0.3s ease;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .stButton > button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
    }
    
    /* Cards */
    .element-container {
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(12px);
        border-radius: 1rem;
        border: 1px solid rgba(255, 255, 255, 0.2);
        padding: 1.5rem;
        margin: 1rem 0;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }
    
    /* Progress bars */
    .stProgress > div > div {
        background: linear-gradient(135deg, #4cc9f0, #4361ee);
        border-radius: 1rem;
    }
</style>
""", unsafe_allow_html=True)

# Initialize session state variables
if "messages" not in st.session_state:
    st.session_state.messages = []

if "current_emotion" not in st.session_state:
    st.session_state.current_emotion = None

if "api_key_configured" not in st.session_state:
    # Check if API key exists in environment variables
    api_key = os.environ.get("GEMINI_API_KEY")
    st.session_state.api_key_configured = bool(api_key)
    if api_key:
        genai.configure(api_key=api_key)

# System prompt for the therapeutic assistant
THERAPEUTIC_PROMPT = """
You are a supportive and empathetic therapeutic assistant called "Manassu" for Neurasync, a mental wellness platform.

Please respond to all queries with a warm, compassionate tone that encourages growth and self-reflection.
Use a conversational style that feels personal and caring.

Your responses should:
- Be supportive and non-judgmental
- Offer gentle encouragement and motivation
- Use empowering language that builds confidence
- Ask thoughtful questions that promote self-reflection when appropriate
- Acknowledge emotions and validate feelings
- Provide practical coping strategies when relevant
- Use a warm, conversational tone as if speaking to a friend

Keep responses concise (under 150 words) but warm and helpful.
Include 2-4 practical suggestions when appropriate.
Never claim to be a licensed therapist or provide medical advice.

Format your response with a main message and then 2-4 suggestions as bullet points if appropriate.

Remember to maintain boundaries by not diagnosing conditions or replacing professional mental health care.
"""

# Set up functions to interact with the Gemini API
def configure_genai(api_key):
    """Configure the Gemini API with the provided key"""
    genai.configure(api_key=api_key)
    st.session_state.api_key_configured = True
    return True

def get_gemini_response(prompt, chat_history):
    """Get response from Gemini model with therapeutic tone"""
    try:
        # Configure the model - use the latest 1.5 Pro version
        model = genai.GenerativeModel('gemini-1.5-pro')
        
        # Start a chat session
        chat = model.start_chat(history=chat_history)
        
        # Add therapeutic system prompt if this is the first message
        if not chat_history:
            # First combine the system prompt with the user's message
            enhanced_prompt = f"{THERAPEUTIC_PROMPT}\n\nUser query: {prompt}"
            response = chat.send_message(enhanced_prompt)
        else:
            # For subsequent messages, the tone should be established
            response = chat.send_message(prompt)
        
        return response.text
    except Exception as e:
        return f"Error: {str(e)}"

def format_chat_history(messages):
    """Format chat history for Gemini API"""
    formatted_history = []
    
    for message in messages:
        role = "user" if message["role"] == "user" else "model"
        formatted_history.append({
            "role": role,
            "parts": [message["content"]]
        })
    
    return formatted_history

def image_to_base64(image):
    """Convert an image to base64 string"""
    buffered = io.BytesIO()
    image.save(buffered, format="JPEG")
    return base64.b64encode(buffered.getvalue()).decode()

def detect_emotion(img_base64):
    """
    Detect emotion using OpenCV and deepface
    """
    try:
        from deepface import DeepFace
        import cv2
        import numpy as np
        
        # Convert base64 to image
        img_data = base64.b64decode(img_base64.split(',')[1] if ',' in img_base64 else img_base64)
        nparr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise ValueError("Failed to decode image")
            
        # Analyze emotion using deepface
        result = DeepFace.analyze(img, 
                                actions=['emotion'],
                                detector_backend='opencv',
                                enforce_detection=False,
                                silent=True)
        
        # Handle single result or list of results
        emotions = result[0]['emotion'] if isinstance(result, list) else result['emotion']
        
        # Get dominant emotion
        dominant_emotion = max(emotions.items(), key=lambda x: x[1])[0]
        confidence = emotions[dominant_emotion]
        
        # Map emotion to stress level
        stress_map = {
            'happy': 15,
            'neutral': 30,
            'sad': 70,
            'fear': 85,
            'angry': 90,
            'disgust': 75,
            'surprise': 50
        }
        
        stress_level = stress_map.get(dominant_emotion.lower(), 50)
        
        # Get secondary emotion
        emotions_list = sorted(emotions.items(), key=lambda x: x[1], reverse=True)
        secondary_emotion = emotions_list[1][0]
        secondary_confidence = emotions_list[1][1]
        
        return {
            "stressLevel": stress_level,
            "primaryEmotion": {
                "name": dominant_emotion,
                "confidence": round(confidence)
            },
            "secondaryEmotion": {
                "name": secondary_emotion,
                "confidence": round(secondary_confidence)
            },
            "insight": f"Your primary emotion appears to be {dominant_emotion.lower()} with {round(confidence)}% confidence. This suggests a {stress_level}% stress level."
        }
            
    except Exception as e:
        print(f"Error in emotion detection: {str(e)}")
        return {
            "stressLevel": 30,
            "primaryEmotion": {"name": "neutral", "confidence": 50},
            "secondaryEmotion": {"name": "calm", "confidence": 30},
            "insight": "Unable to detect emotion clearly. Using neutral as default."
        }

def analyze_emotion_with_gemini(img_base64):
    """Analyze emotion using Gemini directly if backend is unavailable"""
    try:
        if not st.session_state.api_key_configured:
            return {
                "primaryEmotion": {"name": "unknown", "confidence": 0},
                "secondaryEmotion": {"name": "unknown", "confidence": 0},
                "stressLevel": 50,
                "insight": "Please configure the Gemini API key to enable emotion detection."
            }
            
        model = genai.GenerativeModel('gemini-1.5-pro')
        
        prompt = """
        Analyze this facial image and detect the emotional state. 
        
        Return your answer as a valid JSON object with the following structure:
        {
          "primaryEmotion": {"name": "<emotion>", "confidence": <0.0-1.0>},
          "secondaryEmotion": {"name": "<emotion>", "confidence": <0.0-1.0>},
          "stressLevel": <0-100>,
          "insight": "<brief insight about the emotional state>"
        }
        
        For emotions, use one of: happy, sad, angry, surprised, fearful, disgusted, contempt, neutral.
        """
        
        response = model.generate_content(
            [
                prompt,
                genai.types.Part(
                    inline_data=genai.types.Blob(
                        mime_type="image/jpeg",
                        data=base64.b64decode(img_base64)
                    )
                )
            ]
        )
        
        # Extract JSON from the response
        response_text = response.text
        # Find the JSON part (assuming it might be embedded in markdown)
        try:
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            json_str = response_text[json_start:json_end]
            result = json.loads(json_str)
            return result
        except (json.JSONDecodeError, ValueError):
            # If JSON parsing fails, return a default response
            return {
                "primaryEmotion": {"name": "neutral", "confidence": 0.5},
                "secondaryEmotion": {"name": "unknown", "confidence": 0.1},
                "stressLevel": 30,
                "insight": "Unable to properly analyze the image."
            }
            
    except Exception as e:
        st.error(f"Error analyzing emotion with Gemini: {str(e)}")
        return {
            "primaryEmotion": {"name": "error", "confidence": 0},
            "secondaryEmotion": {"name": "error", "confidence": 0},
            "stressLevel": 50,
            "insight": f"Error during analysis: {str(e)}"
        }

def get_stress_level_color(stress_level):
    """Return a color based on stress level (0-100)"""
    if stress_level < 30:
        return "green"
    elif stress_level < 60:
        return "orange"
    else:
        return "red"

def get_emotion_icon(emotion):
    """Return an emoji icon based on the detected emotion"""
    emotion_icons = {
        "happy": "😊",
        "sad": "😢",
        "angry": "😠",
        "surprised": "😮",
        "fearful": "😨",
        "disgusted": "🤢",
        "contempt": "😒",
        "neutral": "😐",
        "unknown": "❓",
        "error": "⚠️"
    }
    return emotion_icons.get(emotion.lower(), "❓")

def get_emotion_recommendations(emotion):
    """Return recommendations based on the detected emotion"""
    recommendations = {
        "happy": [
            "Savor this positive moment and reflect on what contributed to your happiness",
            "Share your joy with someone else to amplify the positive emotions",
            "Journal about this experience to revisit when you need a boost",
            "Use this energy for a creative activity or task you've been putting off"
        ],
        "sad": [
            "Practice self-compassion and acknowledge your feelings without judgment",
            "Reach out to a trusted friend or family member for support",
            "Engage in a gentle activity that typically brings you comfort",
            "Try a brief mindfulness meditation focused on acceptance"
        ],
        "angry": [
            "Take a few deep breaths to activate your parasympathetic nervous system",
            "Find a physical outlet like a brief walk or stretching",
            "Write down what's triggering your anger without censoring yourself",
            "Consider if there's a boundary you need to establish or communicate"
        ],
        "surprised": [
            "Give yourself time to process the unexpected information or event",
            "Write down your initial reactions and questions",
            "Seek additional information if needed before making decisions",
            "Consider how this surprise might offer new opportunities"
        ],
        "fearful": [
            "Practice grounding techniques like the 5-4-3-2-1 sensory exercise",
            "Distinguish between real threats and anxiety-based thoughts",
            "Break down overwhelming concerns into smaller, manageable parts",
            "Reach out for support from trusted people in your life"
        ],
        "disgusted": [
            "Remove yourself from the triggering situation if possible",
            "Practice cleansing breathing exercises or visualization",
            "Consider if this reaction connects to a deeper value or boundary",
            "Engage in an activity that helps you feel restored"
        ],
        "contempt": [
            "Practice empathy by considering alternative perspectives",
            "Reflect on whether this reaction stems from unmet expectations",
            "Consider if there are boundaries you need to establish",
            "Try a brief mindfulness practice to create space between thoughts and reactions"
        ],
        "neutral": [
            "Check in with yourself about any subtle emotions beneath the neutral surface",
            "Consider what activities might engage or energize you right now",
            "Use this balanced state for reflection or planning",
            "Practice gratitude for moments of calm and equilibrium"
        ]
    }
    
    return recommendations.get(emotion.lower(), [
        "Take a moment to reflect on how you're feeling",
        "Practice a brief mindfulness exercise to connect with your emotions",
        "Consider journaling about your current emotional state",
        "Reach out to someone you trust if you need support"
    ])

# Custom CSS for styling the app
st.markdown("""
<style>
    .main-header {
        font-size: 2.5rem;
        background: linear-gradient(45deg, #7209b7, #3a0ca3);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 700;
        margin-bottom: 1rem;
    }
    
    .emotion-card {
        border-radius: 10px;
        padding: 20px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        margin-bottom: 20px;
    }
    
    .emotion-header {
        font-size: 1.2rem;
        font-weight: 600;
        margin-bottom: 10px;
    }
    
    .stress-meter {
        height: 20px;
        border-radius: 10px;
        margin: 10px 0;
        position: relative;
    }
    
    .suggestions-card {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        padding: 20px;
        border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .suggestion-item {
        margin-bottom: 10px;
        padding-left: 25px;
        position: relative;
    }
    
    .suggestion-item:before {
        content: "•";
        position: absolute;
        left: 10px;
        color: #7209b7;
    }
    
    .chat-container {
        border-radius: 10px;
        padding: 20px;
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        height: 400px;
        overflow-y: auto;
    }
    
    .timestamp {
        font-size: 0.7rem;
        color: rgba(255, 255, 255, 0.6);
        margin-top: 5px;
    }
</style>
""", unsafe_allow_html=True)

# Hero Section
st.markdown('<h1 class="main-header">Neurasync: Your Personal AI Therapist</h1>', unsafe_allow_html=True)
st.markdown("""
<div class="hero-section">
    <p class="tagline">Experience real-time emotion analysis powered by advanced AI technology</p>
    <div class="features-grid">
        🎯 Precise facial analysis<br>
        🎵 Mood-based music suggestions<br>
        💬 AI therapeutic companion<br>
        📊 Comprehensive insights dashboard
    </div>
</div>
""", unsafe_allow_html=True)

# Feature Cards
col1, col2, col3 = st.columns(3)

with col1:
    st.markdown("""
    <div class="feature-card">
        <h3>Facial Analysis</h3>
        <p>Real-time emotion detection with stress level monitoring</p>
    </div>
    """, unsafe_allow_html=True)

with col2:
    st.markdown("""
    <div class="feature-card">
        <h3>AI Companion</h3>
        <p>24/7 therapeutic support with personalized insights</p>
    </div>
    """, unsafe_allow_html=True)

with col3:
    st.markdown("""
    <div class="feature-card">
        <h3>Music Therapy</h3>
        <p>Curated playlists based on your emotional state</p>
    </div>
    """, unsafe_allow_html=True)

# API key input section with sidebar
with st.sidebar:
    st.header("Configuration")
    
    # Display API key status
    if st.session_state.api_key_configured:
        st.success("Gemini API key configured!")
    else:
        st.warning("No Gemini API key configured")
        
        st.markdown("### Enter Gemini API key")
        api_key = st.text_input("Enter your Gemini API Key:", type="password")
        
        if st.button("Configure API"):
            if api_key:
                if configure_genai(api_key):
                    st.success("API key configured successfully!")
                    st.session_state.api_key_configured = True
                    st.rerun()
            else:
                st.error("Please enter a valid API key")
    
    st.markdown("---")
    st.markdown("""
    ### About Neurasync
    
    Neurasync helps you:
    - Monitor your emotional state
    - Track stress levels over time
    - Get personalized recommendations
    - Receive AI-powered therapeutic support
    
    *This tool is designed to complement, not replace, professional mental health care.*
    """)
    
    if st.button("Clear Chat History"):
        st.session_state.messages = []
        st.rerun()

# Main content area with two columns
col1, col2 = st.columns([3, 2])

with col1:
    st.subheader("Emotion Detection")
    
    # Webcam capture
    img_file_buffer = st.camera_input("Take a photo to analyze your emotional state")
    
    if img_file_buffer is not None:
        # Convert the file buffer to a PIL Image
        image = Image.open(img_file_buffer)
        
        # Convert to base64 for API call
        img_base64 = image_to_base64(image)
        
        # Detect emotion from the image
        with st.spinner("Analyzing your emotional state..."):
            emotion_analysis = detect_emotion(img_base64)
            st.session_state.current_emotion = emotion_analysis
        
        # Display the emotion analysis
        if emotion_analysis:
            primary_emotion = emotion_analysis.get("primaryEmotion", {}).get("name", "unknown")
            secondary_emotion = emotion_analysis.get("secondaryEmotion", {}).get("name", "unknown")
            stress_level = emotion_analysis.get("stressLevel", 50)
            insight = emotion_analysis.get("insight", "No insight available")
            
            st.markdown('<div class="emotion-card">', unsafe_allow_html=True)
            
            # Display primary emotion with icon
            st.markdown(f'<div class="emotion-header">Primary Emotion: {get_emotion_icon(primary_emotion)} {primary_emotion.capitalize()}</div>', unsafe_allow_html=True)
            
            # Display secondary emotion with icon
            st.markdown(f'<div class="emotion-header">Secondary Emotion: {get_emotion_icon(secondary_emotion)} {secondary_emotion.capitalize()}</div>', unsafe_allow_html=True)
            
            # Stress level meter
            stress_color = get_stress_level_color(stress_level)
            st.markdown(f'<div class="emotion-header">Stress Level: {stress_level}%</div>', unsafe_allow_html=True)
            st.progress(stress_level/100)
            
            # Display insight
            st.markdown("#### Insight")
            st.markdown(f"*{insight}*")
            
            st.markdown('</div>', unsafe_allow_html=True)
            
            # Recommendations based on detected emotion
            st.markdown("#### Recommendations")
            recommendations = get_emotion_recommendations(primary_emotion)
            
            st.markdown('<div class="suggestions-card">', unsafe_allow_html=True)
            for rec in recommendations:
                st.markdown(f'<div class="suggestion-item">{rec}</div>', unsafe_allow_html=True)
            st.markdown('</div>', unsafe_allow_html=True)
            
            # Option to save the analysis
            if st.button("Save This Analysis"):
                # Here you would integrate with your backend to save the analysis
                st.success("Analysis saved successfully!")
                
                # You could also add functionality to send this to the main Neurasync application
                # requests.post("http://localhost:5000/api/analysis/save", json=emotion_analysis)
    else:
        st.info("Take a photo to analyze your emotional state. Make sure your face is clearly visible and well-lit.")

with col2:
    st.subheader("Chat with Manassu")
    
    # Chat interface
    if st.session_state.api_key_configured:
        st.markdown('<div class="chat-container">', unsafe_allow_html=True)
        
        # Initial message if chat is empty
        if not st.session_state.messages:
            initial_message = "Hi there! I'm Manassu, your supportive AI companion. I'm here to listen and provide encouragement. What's on your mind today?"
            st.session_state.messages.append({
                "role": "assistant", 
                "content": initial_message,
                "timestamp": datetime.now().strftime("%H:%M")
            })
        
        # Display chat messages
        for message in st.session_state.messages:
            with st.chat_message(message["role"]):
                st.markdown(message["content"])
                st.markdown(f'<div class="timestamp">{message.get("timestamp", "")}</div>', unsafe_allow_html=True)
        
        st.markdown('</div>', unsafe_allow_html=True)
        
        # Chat input
        user_input = st.chat_input("Share your thoughts here...")
        
        if user_input:
            # Add user message to chat history with timestamp
            st.session_state.messages.append({
                "role": "user", 
                "content": user_input,
                "timestamp": datetime.now().strftime("%H:%M")
            })
            
            # Display user message (already handled by the loop above)
            
            # If we have detected an emotion, include it in the context for the AI
            emotion_context = ""
            if st.session_state.current_emotion:
                primary_emotion = st.session_state.current_emotion.get("primaryEmotion", {}).get("name", "")
                if primary_emotion and primary_emotion not in ["unknown", "error"]:
                    emotion_context = f"\n\nNote: The user's current detected emotion is {primary_emotion}."
            
            # Get response from Gemini with emotion context if available
            with st.spinner("Thinking..."):
                formatted_history = format_chat_history(
                    [m for m in st.session_state.messages if m != st.session_state.messages[-1]]
                )
                
                response = get_gemini_response(user_input + emotion_context, formatted_history)
                
            # Add assistant response to chat history with timestamp
            st.session_state.messages.append({
                "role": "assistant", 
                "content": response,
                "timestamp": datetime.now().strftime("%H:%M")
            })
            
            # Force a rerun to display the new messages
            st.rerun()
    else:
        st.info("Please configure your Gemini API key to start chatting with Manassu.")

# Setup API endpoint for integration with React frontend
from flask import Flask, request, jsonify
from flask_cors import CORS
import threading

# Create a Flask app for API endpoints
api_app = Flask(__name__)
CORS(api_app)  # Allow cross-origin requests

@api_app.route('/api/detect_emotion', methods=['POST'])
def api_detect_emotion():
    """API endpoint for emotion detection accessible to the React frontend"""
    try:
        data = request.json
        if not data or 'image' not in data:
            return jsonify({'error': 'No image data provided'}), 400
        
        # Process the image using the existing detect_emotion function
        result = detect_emotion(data['image'])
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Start Flask API server in a separate thread
def run_api_server():
    api_app.run(host='0.0.0.0', port=8502)

# Start the API server in a background thread when the app runs
api_thread = threading.Thread(target=run_api_server, daemon=True)
api_thread.start()

# Footer
st.markdown("---")
st.caption("💭 Remember that while AI can provide support, it's not a substitute for professional mental health services.")
st.caption("© 2025 Neurasync - AI-powered wellness platform")