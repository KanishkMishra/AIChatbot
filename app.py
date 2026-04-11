from flask import Flask, render_template, request, jsonify
import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

app = Flask(__name__)

# Configure Gemini
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
chat_history = []

# Query Gemini
def get_response(user_message):
    
    chat_history.append(f"User: {user_message}")

    prompt = "\n".join(chat_history[-5:])  # keep last 5 messages as context
    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=prompt
    )
    
    chat_history.append(f"Bot: {response.text}")

    return response.text

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    user_message = request.json["message"]
    response = get_response(user_message)
    return jsonify({"response": response})

if __name__ == "__main__":
    app.run(debug=True)