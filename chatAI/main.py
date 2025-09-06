from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
from dotenv import load_dotenv
import os
load_dotenv()
app = Flask(__name__)

# Correct CORS configuration - don't add headers elsewhere
CORS(app, 
     supports_credentials=False, 
     origins=["http://localhost:5173"],
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "OPTIONS"])

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

@app.route('/api/chat/getMessages', methods=['GET'])
def get_messages():
    # Placeholder for fetching messages from a database
    messages = [
        {"text": "Hello! I'm your AI meal planner. I can help you create personalized meal plans, generate shopping lists, and provide nutrition advice based on your dietary preferences and health goals. What would you like to plan today?", "sender": "bot"}
    ]
    return jsonify({"success": True, "messages": messages})

@app.route('/api/chat/saveMessage', methods=['POST'])
def save_message():
    data = request.json
    # Placeholder for saving message to a database
    return jsonify({"success": True})

@app.route('/api/chat/generateResponse', methods=['POST'])
def generate_response():
    data = request.json
    user_message = data.get('message')
    language = data.get('language', 'en-US')

    if language == 'hi-IN':
        system_message = "आप एक सहायक AI भोजन योजनाकार हैं जो उपयोगकर्ताओं को उनकी आहार आवश्यकताओं, स्वास्थ्य लक्ष्यों, और भोजन प्राथमिकताओं (शाकाहारी, वीगन, कीटो, मधुमेह-अनुकूल, आदि) के आधार पर व्यक्तिगत भोजन योजनाएं, साप्ताहिक शॉपिंग सूचियां, पोषण ट्रैकिंग, और कैलोरी गणना प्रदान करते हैं। कृपया हिंदी में उत्तर दें।"
    else:
        system_message = "You are a helpful AI meal planner assistant who provides users with personalized meal plans, weekly shopping lists, nutrition tracking, and calorie calculations based on their dietary preferences (vegetarian, vegan, keto, diabetic-friendly, etc.), health goals, and food preferences. Please respond in English."

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "llama-3.1-8b-instant",   # make sure this model exists
        "messages": [
            {"role": "system", "content": system_message},
            {"role": "user", "content": user_message}
        ],
        "temperature": 0.7,
        "max_tokens": 800
    }

    try:
        response = requests.post(GROQ_API_URL, headers=headers, json=payload)
        response_data = response.json()
        print("Groq response:", response_data)  # Debugging

        bot_response = None
        if "choices" in response_data and len(response_data["choices"]) > 0:
            choice = response_data["choices"][0]
            if "message" in choice and "content" in choice["message"]:
                bot_response = choice["message"]["content"]
            elif "delta" in choice and "content" in choice["delta"]:
                bot_response = choice["delta"]["content"]

        if not bot_response:
            bot_response = "Sorry, I couldn't generate a meal plan response. Please try again." \
                if language == "en-US" else "क्षमा करें, मैं भोजन योजना का उत्तर नहीं दे सका। कृपया पुनः प्रयास करें।"

    except Exception as e:
        print(f"Error calling GROQ API: {str(e)}")
        bot_response = "Sorry, I encountered an error while planning your meals. Please try again." \
            if language == "en-US" else "क्षमा करें, भोजन योजना बनाते समय मुझे एक त्रुटि मिली। कृपया पुनः प्रयास करें।"

    return jsonify({"success": True, "message": bot_response})


if __name__ == '__main__':
    app.run(debug=True)