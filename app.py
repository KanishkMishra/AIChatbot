from flask import Flask, render_template, request, jsonify
import os
import base64
from dotenv import load_dotenv
from google import genai
from datetime import datetime

load_dotenv()

app = Flask(__name__)

# Configure Gemini
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
chat_history = []

# Query Gemini
def get_response(user_message, file=None):
    if user_message:
        chat_history.append({
            "role": "user",
            "parts": [
                {"text": f"[{datetime.now().astimezone().strftime('%H:%M:%S')} {datetime.now().astimezone().tzinfo}] - {user_message}"}
            ]
        })

    if file and file.filename:
        file_bytes = file.read()

        if len(file_bytes) > 5 * 1024 * 1024:
            return "File too large. Please upload a smaller file."
        
        chat_history.append({
            "role": "user",
            "parts": [
                {"text": "Summarize this document."},
                {
                    "inline_data": {
                        "mime_type": file.mimetype,
                        "data": base64.b64encode(file_bytes).decode("utf-8")
                    }
                }
            ]
        })

    if not user_message and not (file and file.filename):
        return "Please enter a message or upload a file."

    recent_history = chat_history[-100:]

    print("Sending to Gemini...")

    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=recent_history
    )

    print("Received response")

    bot_reply = response.text if response.text else "No response from model."

    # Add bot reply to history
    chat_history.append({
        "role": "model",
        "parts": [
            {"text": bot_reply}
        ]
    })

    return bot_reply

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    print("CHAT ROUTE HIT")
    print("METHOD:", request.method)
    print("FORM:", request.form)
    
    try:
        user_message = request.form.get("message")
        file = request.files.get("file")

        print("Message:", user_message)
        print("File:", file)

        response = get_response(user_message, file)
        return jsonify({"response": response})

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"response": "Server error"}), 500

if __name__ == "__main__":
    app.run(debug=True)