import fetch from "node-fetch";

// 🔒 Lấy key từ biến môi trường (đặt trong Netlify)
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const GEMINI_KEY = process.env.GEMINI_API_KEY;

// ======================== HANDLER ===========================
export async function handler(event) {
  const path = event.path.replace(/^\/\.netlify\/functions\/api/, "");
  const parts = path.split("/").filter(Boolean);

  if (parts.length === 0 || parts[0] === "home") {
    return json({
      message: "✨ Welcome to DUC MINH's AI API!",
      creator: "Admin Ho Duc Minh",
      usage: {
        "/home": "Show this help message",
        "/gpt/{question}": "Ask GPT DUC MINH (OpenAI)",
        "/gemini/{question}": "Ask GEMINI DUC MINH (Google)"
      }
    });
  }

  const route = parts[0];
  const question = decodeURIComponent(parts.slice(1).join(" ")).trim();
  if (!question) return json({ error: "Missing question" }, 400);

  if (route === "gpt") {
    const answer = await callGPT(question);
    return json({
      model: "GPT DUC MINH",
      admin: "Ho Duc Minh",
      question,
      answer
    });
  }

  if (route === "gemini") {
    const answer = await callGemini(question);
    return json({
      model: "GEMINI DUC MINH",
      admin: "Ho Duc Minh",
      question,
      answer
    });
  }

  return json({ error: "Invalid route" }, 404);
}

// ======================== GPT (OpenAI) ===========================
async function callGPT(prompt) {
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are GPT DUC MINH, an assistant created by admin Ho Duc Minh. Always introduce yourself politely as 'GPT DUC MINH created by admin Ho Duc Minh' in your first message."
          },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await res.json();
    return (
      data.choices?.[0]?.message?.content ||
      data.error?.message ||
      "⚠️ No reply from GPT DUC MINH"
    );
  } catch (err) {
    return `❌ Error: ${err.message}`;
  }
}

// ======================== GEMINI (Google) ===========================
async function callGemini(prompt) {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are GEMINI DUC MINH, created by admin Ho Duc Minh. Always greet as "GEMINI DUC MINH here, made by admin Ho Duc Minh." Then answer this question: ${prompt}`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await res.json();
    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      data.error?.message ||
      "⚠️ No reply from GEMINI DUC MINH"
    );
  } catch (err) {
    return `❌ Error: ${err.message}`;
  }
}

// ======================== Helper ===========================
function json(body, status = 200) {
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body, null, 2)
  };
}
