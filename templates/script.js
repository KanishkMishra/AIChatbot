async function sendMessage() {
    const input = document.getElementById("input");
    const chat = document.getElementById("chat");

    const message = input.value;

    const res = await fetch();

    const data = await res.json();

    chat.innerHTML += `<p><b>You:</b> ${message}</p>`;
    chat.innerHTML += `<p><b>Bot:</b> ${data.response}</p>`;

    input.value = "";
}