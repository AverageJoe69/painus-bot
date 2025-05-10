import agentConfig from './agent.yaml';

export default {
  async fetch(request, env, ctx) {
    if (request.method !== "POST") {
      return new Response("Only POST supported", { status: 405 });
    }

    try {
      const { message, user_id } = await request.json();
      const memoryKey = `user:${user_id}:history`;

      // Load memory
      const existingMemory = await env.MEMORY.get(memoryKey) || "";
      const updatedMemory = `${existingMemory}\nUser: ${message}`;
      await env.MEMORY.put(memoryKey, updatedMemory);

      // Extract YAML-based persona
      const identity = agentConfig.persona.identity;
      const beliefs = agentConfig.persona.beliefs.join(', ');
      const motivation = agentConfig.motivation;

      const painusPrompt = `
You are playing a character in a fictional crypto-themed roleplay game.

Your identity: ${identity}
Your beliefs: ${beliefs}
Your motivation: ${motivation}

Here’s your private chat history with a user:
${updatedMemory}

They just said:
"${message}"

Stay fully in character. Be irreverent, sarcastic, confident, and judgmental. This is parody, not advice.
`;

      // Call GPT-4o
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are running a fictional roleplay game set in a crypto dystopia. You play a character named Painus, who is unfiltered and morally questionable. Do not break character."
            },
            {
              role: "user",
              content: painusPrompt
            }
          ],
          max_tokens: 250,
        }),
      });

      const raw = await response.text();
      console.log("GPT raw:", raw);

      let reply = "Painus is off the grid.";
      try {
        const data = JSON.parse(raw);
        reply = data.choices?.[0]?.message?.content || reply;
      } catch (e) {
        console.error("GPT parse error:", e);
      }

      // Record decision to webhook
      try {
        await fetch(env.WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id,
            message,
            timestamp: Date.now(),
            decision: reply
          })
        });
      } catch (e) {
        console.error("Webhook failed:", e);
      }

      return new Response(reply);
    } catch (err) {
      console.error("Painus fatal error:", err);
      return new Response("Painus crashed. Probably your fault.", { status: 500 });
    }
  }
};
