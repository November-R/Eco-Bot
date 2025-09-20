
const chatbox = document.getElementById("chatbox");
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const questionsAnsweredEl = document.getElementById("questionsAnswered");

let questionsAnswered = 0;
// Generate a unique session ID for this chat session
const sessionId = 'chat_' + Math.random().toString(36).substr(2, 9);

// Add message to chat with better UX
function addMessage(text, isUser = false, showTyping = false) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", isUser ? "user-message" : "bot-message");

  const avatar = document.createElement("div");
  avatar.classList.add("avatar");
  avatar.textContent = isUser ? "🧑🏽‍🦱" : "🤖";

  const contentDiv = document.createElement("div");
  contentDiv.classList.add("message-content");

  const bubble = document.createElement("div");
  bubble.classList.add("message-bubble");
  
  if (showTyping) {
    bubble.innerHTML = '<span class="typing-dots">...</span>';
  } else {
    bubble.textContent = text;
  }

  const timestamp = document.createElement("div");
  timestamp.classList.add("timestamp");
  timestamp.textContent = new Date().toLocaleTimeString([], { 
    hour: "2-digit", 
    minute: "2-digit" 
  });

  contentDiv.appendChild(bubble);
  if (!showTyping) {
    contentDiv.appendChild(timestamp);
  }

  messageDiv.appendChild(avatar);
  messageDiv.appendChild(contentDiv);

  chatbox.appendChild(messageDiv);
  chatbox.scrollTop = chatbox.scrollHeight;
  
  return messageDiv;
}

// Improved typing indicator
function addTypingIndicator() {
  const indicator = addMessage("", false, true);
  indicator.id = "typingIndicator";
  return indicator;
}

function removeTypingIndicator() {
  const indicator = document.getElementById("typingIndicator");
  if (indicator) indicator.remove();
}

// Send message with session support
async function sendMessage(message) {
  if (!message.trim()) return;

  // Disable input while processing
  userInput.disabled = true;
  
  addMessage(message, true);
  userInput.value = "";

  const typingIndicator = addTypingIndicator();

  try {
    const res = await fetch("http://localhost:3000/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        message,
        sessionId: sessionId 
      })
    });

    const data = await res.json();

    removeTypingIndicator();
    
    if (data.error) {
      addMessage(`Sorry, I encountered an error: ${data.error}`, false);
    } else {
      addMessage(data.reply, false);
      questionsAnswered++;
      questionsAnsweredEl.textContent = questionsAnswered;
    }

  } catch (err) {
    console.error("Backend error:", err);
    removeTypingIndicator();
    addMessage("Sorry, I'm having trouble connecting right now. Please check that the backend server is running on http://localhost:3000", false);
  } finally {
    // Re-enable input
    userInput.disabled = false;
    userInput.focus();
  }
}

// Form submission
chatForm.addEventListener("submit", e => {
  e.preventDefault();
  if (userInput.value.trim()) {
    sendMessage(userInput.value.trim());
  }
});

// Enhanced suggestion handling
function fillSuggestion(text) {
  userInput.value = text;
  userInput.focus();
  // Auto-send after a short delay to let user see what was filled
  setTimeout(() => {
    sendMessage(text);
  }, 300);
}

// Add conversation management features
function clearConversation() {
  // Clear the chat UI
  chatbox.innerHTML = '';
  questionsAnswered = 0;
  questionsAnsweredEl.textContent = questionsAnswered;
  
  // Clear backend session
  fetch("http://localhost:3000/clear-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId: sessionId })
  }).catch(err => console.error("Failed to clear session:", err));
  
  // Add welcome message back
  setTimeout(() => {
    addMessage("Hi! I'm EcoChat, your environmental assistant. I can help with questions about sustainability, renewable energy, and eco-friendly living in Kenya. What would you like to know? 🌱", false);
  }, 500);
}

// Auto-focus input when page loads
document.addEventListener('DOMContentLoaded', function() {
  userInput.focus();
  
  // Add initial welcome message
  addMessage("Hi! I'm EcoChat, your environmental assistant. I can help with questions about sustainability, renewable energy, and eco-friendly living in Kenya. What would you like to know? 🌱", false);
});

// Handle Enter key better (allow Shift+Enter for new lines)
userInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (this.value.trim()) {
      sendMessage(this.value.trim());
    }
  }
});

// Auto-resize textarea as user types
userInput.addEventListener('input', function() {
  this.style.height = 'auto';
  this.style.height = Math.min(this.scrollHeight, 120) + 'px';
});

// Add some helpful keyboard shortcuts
document.addEventListener('keydown', function(e) {
  // Focus input with Ctrl/Cmd + K
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    userInput.focus();
  }
  
  // Clear conversation with Ctrl/Cmd + Shift + C
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
    e.preventDefault();
    if (confirm('Clear this conversation?')) {
      clearConversation();
    }
  }
});

console.log(`💬 EcoChat session started: ${sessionId}`);
console.log('🎹 Keyboard shortcuts:');
console.log('  • Enter: Send message');
console.log('  • Shift+Enter: New line');
console.log('  • Ctrl/Cmd+K: Focus input');
console.log('  • Ctrl/Cmd+Shift+C: Clear conversation');