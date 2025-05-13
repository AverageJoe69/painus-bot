import { handleJoinAndChat } from "./game.js";
import { ethers } from "ethers";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // --- ETH Transfer Endpoint ---
    if (request.method === "POST" && url.pathname === "/send-eth") {
      try {
        const { to, amount } = await request.json();
        const provider = new ethers.JsonRpcProvider(`https://sepolia.infura.io/v3/${env.INFURA_KEY}`);
        const wallet = new ethers.Wallet(env.WALLET_PRIVATE_KEY, provider);

        const tx = await wallet.sendTransaction({
          to,
          value: ethers.parseEther(amount)
        });

        console.log("✅ ETH transaction sent:", tx.hash);

        return new Response(JSON.stringify({ txHash: tx.hash }), {
          headers: { "Content-Type": "application/json" }
        });
      } catch (err) {
        console.error("❌ ETH send error:", err);
        return new Response("Painus glitched sending ETH.", { status: 500 });
      }
    }

    // --- Telegram Webhook Handler ---
    if (request.method === "POST" && url.pathname === "/") {
      try {
        console.log("📩 Got POST / from Telegram");

        const { message } = await request.json();

        if (!message || !message.chat || !message.text) {
          console.warn("📭 No usable Telegram message found");
          return new Response("OK", { status: 200 });
        }

        const chatId = message.chat.id;
        const userMessage = message.text;

        console.log(`📨 From ${chatId}: ${userMessage}`);

        const handled = await handleJoinAndChat(chatId, userMessage, env);

        if (handled === true) {
          console.log("✅ Message handled by game.js logic");
          return new Response("OK");
        }

        console.log("🟡 Message not handled by game.js");

        return new Response("OK");
      } catch (err) {
        console.error("🔥 Telegram Handler Error:", err);
        return new Response("Painus glitched. Try again later.", { status: 500 });
      }
    }

    // --- Fallback route ---
    return new Response("Not found", { status: 404 });
  }
};
