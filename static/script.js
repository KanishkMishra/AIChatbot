console.log("SCRIPT LOADED");

// configure speech recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition()
recognition.lang = "en-US";
recognition.continuous = true;   
recognition.interimResults = false; 

// Prevent bot from being spammed
let messageSent = false;
let typingId;

async function sendMessage() {
    console.log("sendMessage CALLED");

    if (messageSent) {
        document.getElementById(typingId).innerHTML = "Please wait. Bot is typing...";
        return;
    }

    const input = document.getElementById("input");
    const chat = document.getElementById("chat");
    const fileInput = document.getElementById("myfile")
    
    const file = fileInput.files[0];
    const message = input.value.trim();
    if (!message && !file) return;

    // show user message immediately
    if (message)
        chat.innerHTML += `<p class="user"><b>You:</b> ${message}</p>`;

    if (file)
        chat.innerHTML += `<p class="user"><b>File:</b> ${file.name}</p>`;
    
    messageSent = true;
    typingId = "typing-" + Date.now();
    chat.innerHTML += `<p id="${typingId}" class="bot">Bot is typing...</p>`;

    chat.scrollTop = chat.scrollHeight;
    
    const formData = new FormData();
    formData.append("message", message);
    if (file)
        formData.append("file", file);

    await new Promise(resolve => setTimeout(resolve, 10));

    const res = await fetch("/chat", {
        method: "POST",
        body: formData
    });

    let data;

    try {
        data = await res.json();
        const formatted = marked.parse(data.response);
        console.log(formatted);
        document.getElementById(typingId).innerHTML =
            `<b>Bot:</b> ${formatted}`;
        messageSent = false;
        speak(data.response);
    } catch {
        document.getElementById(typingId).innerHTML =
            `<span style="color:red;">Server error (not JSON)</span>`;
        return;
        messageSent = false;
    }

    if (!res.ok) {
        document.getElementById(typingId).innerHTML =
            `<span style="color:red;">${data.response}</span>`;
        return;
    }

    input.value = "";
    fileInput.value = "";
}

// Start speech recognition 
function listen() {
    console.log("listening");
    recognition.start();
    document.getElementById("listen").textContent = "Listening...";
}

recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    console.log("Heard:", transcript);

    // automatically send message
    document.getElementById("input").value = transcript;
    sendMessage();
}

recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
};

recognition.onend = () => {
    console.log("Recognition ended");
    document.getElementById("listen").textContent = "Audio Input"
};

// text to speech
function speak(text) {
    console.log("Speaking:", text);

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.onstart = () => console.log("Speech started");
    utterance.onend = () => console.log("Speech ended");
    utterance.onerror = (e) => console.error("Speech error:", e);

    window.speechSynthesis.speak(utterance);
}

// Pressing enter sends message
document.getElementById("input").addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        e.preventDefault();  
        sendMessage();
    }
});