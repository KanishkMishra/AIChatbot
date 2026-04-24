from flask import Flask, render_template, request, jsonify
import os
import base64
from dotenv import load_dotenv
from google import genai

load_dotenv()

app = Flask(__name__)

# Configure Gemini
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
chat_history = []

# Query Gemini
def get_response(user_message, file=None):
    contents = []

    if user_message:
        contents.append({"text": user_message})

    if file and file.filename:
        file_bytes = file.read()

        if len(file_bytes) > 5 * 1024 * 1024:
            return "File too large. Please upload a smaller file."
        contents.append({
            "text": "Summarize this document."
        })
        
        contents.append({
            "inline_data": {
                "mime_type": file.mimetype,
                "data": base64.b64encode(file_bytes).decode("utf-8")
            }
        })

    if not contents:
        return "Please enter a message or upload a file."

    print("Sending to Gemini...")

    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=contents
    )

    print("Received response")


    return response.text if response.text else "No response from model."

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