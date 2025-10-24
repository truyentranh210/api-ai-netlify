import fetch from "node-fetch";

// 🔑 KEY CỦA HAI AI (thay vào đây)
const OPENAI_KEY = "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";
const GEMINI_KEY = "AIzaSyDOS3THCnDvlTIF_hUyD1M-uPZMmSyWxbE";

export async function handler(event) {
  const path = event.path;
  const parts = path.split("/").filter(Boolean);

  // Trang /home
  if (parts.length === 0 || parts[0] === "home") {
    return json({
      message: "✨ Welcome to AI API!",
      usage: {
        "/home": "Show this help message",
        "/gpt/{question}": "Ask OpenAI GPT model",
        "/gemini/{question}": "Ask Google Gemini model"
      }
    });
  }

  const route = parts[0];
  const question = decodeURIComponent(parts.slice(1).join(" "));

  if (!question) return json({ error: "Missing question" }, 400);

  if (route === "gpt") {
    const answer = await callGPT(question);
    return json({ model: "GPT", question, answer });
  }

  if (route === "gemini") {
    const answer = await callGemini(question);
    return json({ model: "Gemini", question, answer });
  }

  return json({ error: "Invalid route" }, 404);
}

// ==========================
// 🔹 OPENAI GPT
// ==========================
async function callGPT(prompt) {
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }]
      })
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || data.error?.message || "⚠️ No reply from GPT";
  } catch (err) {
    return `❌ Error: ${err.message}`;
  }
}

// ==========================
// 🔹 GOOGLE GEMINI
// ==========================
async function callGemini(prompt) {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );
    const data = await res.json();
    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      data.error?.message ||
      "⚠️ No reply from Gemini"
    );
  } catch (err) {
    return `❌ Error: ${err.message}`;
  }
}

// ==========================
// 🔹 JSON Response helper
// ==========================
function json(body, status = 200) {
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  };
}
