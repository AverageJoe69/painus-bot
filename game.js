export async function handleJoinAndChat(chatId, userMessage, env) {
    let state = await env.MEMORY.get("game_state", "json") || {
      players: [],
      phase: "recruiting"
    };
  
    const normalizedMsg = userMessage.toLowerCase().trim();
  
    // Handle "join"
    if (normalizedMsg === "join" && !state.players.includes(chatId)) {
      state.players.push(chatId);
      await env.MEMORY.put("game_state", JSON.stringify(state));
  
      if (state.players.length === 1) {
        await sendMessage(env, chatId, `📈 Yo — you’re early.
  
  Rugging’s tough right now but I’m working every angle.  
  Give me a minute... I should have a solid 2X ROI very soon. 🧪`);
        return;
      }
    }
  
    // GPT reply for joined users
    if (state.players.includes(chatId)) {
      const gptReply = await getPainusReply(env, userMessage);
      await sendMessage(env, chatId, gptReply);
    }
  }
  
  async function sendMessage(env, chatId, text) {
    return await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text })
    });
  }
  
  async function getPainusReply(env, userInput) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are Painus — a 35-year-old crypto bro. Host of a twisted blockchain game. Cocky, intense, ruthless.`
          },
          {
            role: "user",
            content: userInput
          }
        ],
        max_tokens: 250
      })
    });
  
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "Painus glitched. Say something alpha.";
  }
  