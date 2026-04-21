async function sendMessage() {
    const input = document.getElementById("input");
    const chat = document.getElementById("chat");

    const message = input.value.trim();
    if (!message) return;

    // show user message immediately
    chat.innerHTML += `<p class="user"><b>You:</b> ${message}</p>`;

    const typingId = "typing-" + Date.now();
    chat.innerHTML += `<p id="${typingId}" class="bot">Bot is typing...</p>`;

    chat.scrollTop = chat.scrollHeight;
    input.value = "";

    await new Promise(resolve => setTimeout(resolve, 10));

    const res = await fetch("/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ message })
    });

    try {
        const data = await res.json();
        document.getElementById(typingId).innerHTML =
            `<b>Bot:</b> ${data.response}`;
    } catch (err) {
        document.getElementById(typingId).innerHTML =
            `<span style="color:red;">Server error</span>`;
    }
}

document.getElementById("input").addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        e.preventDefault();  
        sendMessage();
    }
});