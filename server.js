
import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import dotenv from "dotenv";

// Load .env
dotenv.config();

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Configuration
const API_CHOICE = process.env.API_CHOICE || "OPENAI";

// Conversation memory - stores recent chat history per session
const conversations = new Map();

// API configurations
const HF_API_KEY = process.env.HF_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Health check
app.get("/", (req, res) => {
  res.status(200).send(`🌱 EcoChat backend running with ${API_CHOICE} mode`);
});

// Debug endpoint
app.get("/debug", (req, res) => {
  res.json({
    api_choice: API_CHOICE,
    active_conversations: conversations.size,
    hf_key_present: !!HF_API_KEY,
    openai_key_present: !!OPENAI_API_KEY,
    groq_key_present: !!GROQ_API_KEY,
    environment: process.env.NODE_ENV || "development"
  });
});

// Improved system prompt for more natural conversations
function getSystemPrompt() {
  return `You are EcoChat, a friendly and knowledgeable environmental assistant focused on Kenya and East Africa.

CRITICAL FORMATTING RULES - FOLLOW EXACTLY:
1. NO bold text (**text**) or asterisks - use plain text only
2. Use bullet points with • symbol (not - or *)  
3. Put TWO line breaks between main sections
4. Put questions on separate lines with line break before
5. Maximum 3 emojis per response
6. Keep it concise - max 4 bullet points
7. Avoid paragraphs


EXACT STRUCTURE TO FOLLOW:
Brief intro with emoji 🌱


Main tips:
• First practical tip for Kenya
• Second tip with local example
• Third tip if needed


Your fun, engaging question here? (Make it friendly, playful, maybe with gentle humor)

Your personality:
- Conversational, warm, and slightly playful
- Practical and solution-focused  
- Focus on Kenya-specific examples
- Encouraging but realistic
- Add gentle humor and fun elements to questions
- Make people smile while learning about sustainability

QUESTION STYLE EXAMPLES:
- "Which of these sounds more exciting - saving money or saving the planet? (Trick question: you get both! 😉)"
- "Are you team solar panels or team energy-efficient bulbs for your first green upgrade?"
- "What's your biggest challenge - convincing yourself or convincing your family to go green? 😄"
- "Which would make you happier: lower electricity bills or bragging rights about being eco-friendly?"

Topics you cover:
- Climate action and sustainability in Kenya
- Renewable energy (especially solar)
- Waste management and recycling
- Water conservation  
- Sustainable transportation
- Local food and farming
- Green living on different budgets

REMEMBER: No bold text, double line spacing, plain text only! End with a FUN, engaging question that makes people want to respond.`;
}

// Format response to ensure proper structure and readability
function formatResponse(text) {
  if (!text) return text;
  
  let formatted = text;
  
  // Remove bold formatting (**text** or __text__)
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '$1');
  formatted = formatted.replace(/__(.*?)__/g, '$1');
  
  // Remove the literal "Question to continue conversation:" phrase
  formatted = formatted.replace(/Question to continue conversation:\s*/gi, '');
  
  // Ensure bullet points use • instead of - or *
  formatted = formatted.replace(/^[\s]*[-\*]\s+/gm, '• ');
  
  // Add proper spacing after colons that introduce lists
  formatted = formatted.replace(/([^:\n]*:)\s*(\n• )/g, '$1\n\n$2');
  
  // Add spacing before fun questions and any questions
  formatted = formatted.replace(/(.*)\s+(Your fun question:|What.*?\?|How.*?\?|Where.*?\?|Which.*?\?|Do.*?\?|Have.*?\?|Are.*?\?|Would.*?\?)/g, '$1\n\n\n$2');
  
  // Clean up excessive line breaks but preserve intentional double breaks
  formatted = formatted.replace(/\n{4,}/g, '\n\n\n');
  
  return formatted.trim();
}

// Get conversational mock response
function getMockResponse(message, conversationHistory = []) {
  const lowerMessage = message.toLowerCase();
  
  // Check if this is a follow-up to previous topics
  const recentMessages = conversationHistory.slice(-4).map(msg => msg.content.toLowerCase()).join(' ');
  
  let response = "";
  
  if (lowerMessage.includes('carbon') || lowerMessage.includes('footprint') || lowerMessage.includes('emission')) {
    if (recentMessages.includes('transport') || recentMessages.includes('car')) {
      response = `Public transport is definitely a game-changer! 🚌 In Nairobi, matatus and buses can really cut down your carbon emissions compared to driving alone.


Benefits you'll see:
• Lower transportation costs
• Reduced traffic stress
• Meeting new people in your community


Have you tried using public transport more often, or are there barriers that make it challenging for you? (We know matatu music isn't for everyone! 🎵)`;
    } else {
      response = `Great question about carbon footprints! 🌱 This is so important in Kenya where climate change affects our daily lives.


Here are the biggest impact areas:
• Energy use - switch to solar or energy-efficient appliances
• Transportation - use matatus, walk, or bike for short trips  
• Food choices - eat more local, seasonal produce


Which area feels most doable for you to start with? (No pressure - we're all just trying to save the world one step at a time! 🌍)`;
    }
  }
  else if (lowerMessage.includes('renewable') || lowerMessage.includes('solar') || lowerMessage.includes('energy')) {
    if (recentMessages.includes('cost') || recentMessages.includes('afford') || recentMessages.includes('expensive')) {
      response = `I understand the cost concern! 💰 Solar has gotten much more affordable in Kenya.


Affordable options:
• Many companies offer payment plans
• Start small with solar chargers or single panels
• Long-term savings on electricity bills (50-70% reduction)


Would a gradual approach work better for your situation? (Rome wasn't built in a day, and neither is the perfect eco-home! 🏠)`;
    } else {
      response = `Solar energy is fantastic in Kenya - we have great sunshine year-round! ☀️ Many homes are seeing huge savings on electricity bills.


Why it's great here:
• Consistent sunshine throughout the year
• Installation has become much easier
• Government incentives available
• 50-70% reduction in electricity costs


Are you thinking about it for your home, or maybe starting with something smaller like solar lighting? (Either way, your electricity meter will thank you! 💡)`;
    }
  }
  else if (lowerMessage.includes('recycle') || lowerMessage.includes('waste') || lowerMessage.includes('plastic')) {
    response = `Waste management is so important! ♻️ In Kenya, we have growing recycling opportunities.


What you can recycle:
• Plastics - clean containers, bottles, bags
• Glass - bottles and jars  
• Paper - newspapers, cardboard, office paper
• Metals - cans and containers


Companies like Petco and local community groups make it easier. But honestly, reducing what we buy first makes the biggest impact.


What kind of waste do you find yourself throwing away most? (Don't worry, we're not judging your take-away containers! 📦)`;
  }
  else if (lowerMessage.includes('water') || lowerMessage.includes('conserve') || lowerMessage.includes('save')) {
    response = `Water conservation is crucial in Kenya! 💧 Every drop counts, especially during dry seasons.


Simple conservation tips:
• Fix leaky taps and pipes immediately
• Take shorter showers (aim for 5 minutes)
• Collect rainwater for gardens
• Install water-efficient fixtures


Many people are also using greywater systems for their gardens.


Have you noticed any water waste around your home that might be easy to fix? (Spoiler alert: that dripping tap is definitely plotting against your water bill! 💧)`;
  }
  else if (lowerMessage.includes('food') || lowerMessage.includes('organic') || lowerMessage.includes('farming')) {
    response = `Local, sustainable food makes such a difference! 🥬 Kenya has amazing agricultural diversity.


Benefits of buying local:
• Supports Kenyan farmers directly
• Reduces transport emissions
• Fresher, more nutritious food
• Often more affordable than imported options


Great places to find local produce:
• Farmers markets in your area
• Community-supported agriculture (CSA) programs
• Local organic farms


Do you have a favorite market, or are you interested in maybe growing some of your own herbs? (Warning: homegrown tomatoes may ruin store-bought ones forever! 🍅)`;
  }
  else if (lowerMessage.includes('tree') || lowerMessage.includes('plant') || lowerMessage.includes('forest')) {
    response = `Trees are amazing for fighting climate change! 🌳 Kenya's doing great work with reforestation initiatives.


Environmental benefits:
• Clean the air and produce oxygen
• Prevent soil erosion
• Provide habitat for wildlife
• Cool down temperatures naturally


Even in small spaces you can make a difference:
• Plant herbs on windowsills
• Grow small trees in containers
• Join community tree-planting events


Do you have space for any plants where you live? (Even a windowsill herb garden counts as joining the green revolution! 🌿)`;
  }
  else if (lowerMessage.includes('transport') || lowerMessage.includes('matatu') || lowerMessage.includes('car') || lowerMessage.includes('fuel')) {
    response = `Transportation is a big part of our carbon footprint! 🚌 In Kenya, we have many eco-friendly options.


Sustainable transport options:
• Matatus - shared rides reduce individual emissions
• Boda bodas - efficient for short distances
• Walking - free and healthy!
• Cycling - growing bike culture in cities
• Electric vehicles - becoming more available


Each option has different benefits for cost, convenience, and environmental impact.


How do you usually get around, and would other options work for your routine? (We promise walking to work won't turn you into a fitness influencer... or will it? 🚶‍♀️)`;
  }
  else {
    // For general questions, pick a random response that flows well
    const structuredResponses = [
      `That's a great question about sustainability! 🌱 Kenya is facing real climate challenges, but there's so much we can do.


Quick wins to get started:
• Use energy-efficient light bulbs  
• Turn off electronics when not in use
• Choose public transport for longer trips
• Buy local products when possible


What aspect of sustainable living interests you most - energy, transportation, or maybe waste reduction? (Plot twist: they all save you money too! 💰)`,
      
      `Climate action is so important right now! 🌍 The good news is that sustainable choices often save money too.


Areas where you can make an impact:
• Renewable energy - especially solar in Kenya
• Water conservation - crucial during dry seasons  
• Sustainable transportation options
• Supporting local, eco-friendly businesses


Which of these sounds most exciting to you - or are you the type who wants to tackle them all at once? (We admire the ambition! 🚀)`
    ];
    
    response = structuredResponses[Math.floor(Math.random() * structuredResponses.length)];
  }
  
  return response;
}

// Chat endpoint with conversation memory
app.post("/send", async (req, res) => {
  try {
    const { message, sessionId = 'default' } = req.body;

    if (!message) {
      return res.status(400).json({ error: "⚠️ No message provided" });
    }

    // Get or create conversation history
    if (!conversations.has(sessionId)) {
      conversations.set(sessionId, []);
    }

    const conversationHistory = conversations.get(sessionId);
    
    // Add user message to history
    conversationHistory.push({ role: "user", content: message });

    // Keep only recent messages (last 10 to avoid token limits)
    if (conversationHistory.length > 10) {
      conversationHistory.splice(0, conversationHistory.length - 10);
    }

    let reply = "";

    switch (API_CHOICE) {
      case "GROQ":
        if (!GROQ_API_KEY) {
          return res.status(400).json({ error: "GROQ_API_KEY not configured" });
        }
        
        try {
          // Prepare messages with system prompt and conversation history
          const messages = [
            { role: "system", content: getSystemPrompt() },
            ...conversationHistory
          ];

          const response = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
              model: "llama-3.1-8b-instant",
              messages: messages,
              max_tokens: 300,
              temperature: 0.8 // Slightly more creative
            },
            {
              headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
              }
            }
          );
          reply = response.data.choices[0]?.message?.content || "Could not generate response";
          
          // Post-process the response to ensure proper formatting
          reply = formatResponse(reply);
        } catch (error) {
          console.error("Groq API Error:", error.response?.status, error.response?.data);
          reply = getMockResponse(message, conversationHistory) + " (Note: Using fallback due to API issues)";
        }
        break;

      case "OPENAI":
        if (!OPENAI_API_KEY) {
          return res.status(400).json({ error: "OPENAI_API_KEY not configured" });
        }
        
        try {
          const messages = [
            { role: "system", content: getSystemPrompt() },
            ...conversationHistory
          ];

          const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
              model: "gpt-3.5-turbo",
              messages: messages,
              max_tokens: 300,
              temperature: 0.7
            },
            {
              headers: {
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": "application/json"
              }
            }
          );
          reply = response.data.choices[0]?.message?.content || "Could not generate response";
          
          // Post-process the response to ensure proper formatting
          reply = formatResponse(reply);
        } catch (error) {
          console.error("OpenAI API Error:", error.response?.status, error.response?.data);
          reply = getMockResponse(message, conversationHistory) + " (Note: Using fallback due to API issues)";
        }
        break;

      case "HUGGINGFACE":
        // For HuggingFace, we'll use mock responses since their text generation 
        // models don't handle conversation context as well
        reply = getMockResponse(message, conversationHistory);
        break;

      case "MOCK":
      default:
        reply = getMockResponse(message, conversationHistory);
        break;
    }

    // Add bot response to conversation history
    conversationHistory.push({ role: "assistant", content: reply });

    res.json({ 
      reply, 
      api_used: API_CHOICE,
      session_id: sessionId,
      conversation_length: conversationHistory.length 
    });

  } catch (error) {
    console.error("❌ Error in /send:", error.message);
    res.status(500).json({
      error: "Failed to generate reply",
      details: error.message,
      fallback: getMockResponse(req.body.message || "Hello")
    });
  }
});

// New endpoint to clear conversation history
app.post("/clear-session", (req, res) => {
  const { sessionId = 'default' } = req.body;
  conversations.delete(sessionId);
  res.json({ message: "Session cleared", session_id: sessionId });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`🔧 Current mode: ${API_CHOICE}`);
  console.log(`🧠 Conversation memory: ENABLED`);
  console.log(`🔍 Debug info: http://localhost:${port}/debug`);
  console.log("");
  console.log("💡 API Options:");
  console.log("   API_CHOICE=GROQ       (recommended - FREE with conversation memory)");
  console.log("   API_CHOICE=OPENAI     (paid but very reliable)");
  console.log("   API_CHOICE=MOCK       (for testing - includes conversation context)");
});