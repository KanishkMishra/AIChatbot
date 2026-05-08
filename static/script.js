console.log("SCRIPT LOADED");

async function sendMessage() {
    console.log("sendMessage CALLED");

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

    const typingId = "typing-" + Date.now();
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
    } catch {
        document.getElementById(typingId).innerHTML =
            `<span style="color:red;">Server error (not JSON)</span>`;
        return;
    }

    if (!res.ok) {
        document.getElementById(typingId).innerHTML =
            `<span style="color:red;">${data.response}</span>`;
        return;
    }

    input.value = "";
    fileInput.value = "";
}

document.getElementById("input").addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        e.preventDefault();  
        sendMessage();
    }
});