async function sendMessage() {
    const input = document.getElementById("input");
    const chat = document.getElementById("chat");

    const message = input.value;

    const res = await fetch("/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ message })
    });

    let data;

    try {
        data = await res.json();
    } catch (err) {
        chat.innerHTML += `<p style="color:red;">Server error (not JSON)</p>`;
        return;
    }

    chat.innerHTML += `<p><b>You:</b> ${message}</p>`;
    chat.innerHTML += `<p><b>Bot:</b> ${data.response}</p>`;

    input.value = "";
}