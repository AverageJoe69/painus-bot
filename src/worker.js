import { ethers } from "ethers";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // ETH Transfer Endpoint
    if (request.method === "POST" && url.pathname === "/send-eth") {
      try {
        const { to, amount } = await request.json();

        const provider = new ethers.JsonRpcProvider(`https://sepolia.infura.io/v3/${env.INFURA_KEY}`);
        const wallet = new ethers.Wallet(env.WALLET_PRIVATE_KEY, provider);

        const tx = await wallet.sendTransaction({
          to,
          value: ethers.parseEther(amount)
        });

        return new Response(JSON.stringify({ txHash: tx.hash }), {
          headers: { "Content-Type": "application/json" }
        });
      } catch (err) {
        console.error("ETH send error:", err);
        return new Response("Painus glitched sending ETH.", { status: 500 });
      }
    }

    // Telegram Webhook Handler (POST to /)
    if (request.method === "POST" && url.pathname === "/") {
      try {
        const { message } = await request.json();

        if (!message || !message.chat || !message.text) {
          return new Response("No message to process", { status: 200 });
        }

        const chatId = message.chat.id;
        const userMessage = message.text;

        const gptResponse = await fetch("https://api.openai.com/v1/chat/completions", {
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
                content: userMessage
              }
            ],
            max_tokens: 250
          })
        });

        const data = await gptResponse.json();
        const reply = data.choices?.[0]?.message?.content || "Painus glitched. Say something alpha.";

        await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: reply
          })
        });

        return new Response("OK", { status: 200 });
      } catch (err) {
        console.error("Telegram Handler Error:", err);
        return new Response("Painus glitched. Try again later.", { status: 500 });
      }
    }

    // Unsupported route
