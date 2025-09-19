
const chatbox = document.getElementById("chatbox");
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const questionsAnsweredEl = document.getElementById("questionsAnswered");

let questionsAnswered = 0;

// Add message to chat
function addMessage(text, isUser = false) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", isUser ? "user-message" : "bot-message");

  const avatar = document.createElement("div");
  avatar.classList.add("avatar");
  avatar.textContent = isUser ? "🧑🏽‍🦱" : "🤖";

  const contentDiv = document.createElement("div");
  contentDiv.classList.add("message-content");

  const bubble = document.createElement("div");
  bubble.classList.add("message-bubble");
  bubble.textContent = text;

  const timestamp = document.createElement("div");
  timestamp.classList.add("timestamp");
  timestamp.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  contentDiv.appendChild(bubble);
  contentDiv.appendChild(timestamp);

  messageDiv.appendChild(avatar);
  messageDiv.appendChild(contentDiv);

  chatbox.appendChild(messageDiv);
  chatbox.scrollTop = chatbox.scrollHeight;
}

// Typing indicator
function addTypingIndicator() {
  const indicator = document.createElement("div");
  indicator.id = "typingIndicator";
  indicator.classList.add("message", "bot-message");

  indicator.innerHTML = `
    <div class="avatar">🤖</div>
    <div class="message-content">
      <div class="message-bubble">...</div>
    </div>
  `;

  chatbox.appendChild(indicator);
  chatbox.scrollTop = chatbox.scrollHeight;
}

function removeTypingIndicator() {
  const indicator = document.getElementById("typingIndicator");
  if (indicator) indicator.remove();
}

// Send message
async function sendMessage(message) {
  if (!message.trim()) return;

  addMessage(message, true);
  userInput.value = "";

  addTypingIndicator();

  try {
    const res = await fetch("http://localhost:5000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await res.json();

    removeTypingIndicator();
    addMessage(data.reply);

    questionsAnswered++;
    questionsAnsweredEl.textContent = questionsAnswered;
  } catch (err) {
    console.error("Backend error:", err);
    removeTypingIndicator();
    addMessage("Sorry, I'm having trouble connecting to my brain right now.");
  }
}

// Form submission
chatForm.addEventListener("submit", e => {
  e.preventDefault();
  sendMessage(userInput.value);
});

// Suggestion chip 
function fillSuggestion(text) {
  userInput.value = text;
  sendMessage(text);
}