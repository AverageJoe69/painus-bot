import { handleJoinAndChat } from "./game.js";
import { ethers } from "ethers";

export default {
  async fetch(request, env, ctx) {
    const pathname = new URL(request.url).pathname;

    if (request.method === "POST" && pathname === "/send-eth") {
      try {
        const { to, amount } = await request.json();

        const provider = new ethers.JsonRpcProvider(`https://sepolia.infura.io/v3/${env.INFURA_KEY}`);
        const wallet = new ethers.Wallet(env.WALLET_PRIVATE_KEY, provider);

        const tx = await wallet.sendTransaction({
          to,
          value: ethers.parseEther(amount),
        });

        return new Response(JSON.stringify({ txHash: tx.hash }), {
          headers: { "Content-Type": "application/json" }
        });
      } catch (err) {
        console.error("ETH send error:", err);
        return new Response("Painus glitched sending ETH.", { status: 500 });
      }
    }

    if (request.method === "POST" && pathname === "/") {
      try {
        const body = await request.json();
        const message = body?.message;
    
        if (!message || !message.chat || !message.text) {
          console.warn("No message payload found");
          return new Response("OK");
        }
    
        const chatId = message.chat.id;
        const userMessage = message.text;
    
        await handleJoinAndChat(chatId, userMessage, env);
    
        return new Response("OK");
      } catch (err) {
        console.error("Worker Error:", err);
        return new Response("Painus glitched. Try again later.", { status: 500 });
      }
    }
    

    return new Response("Not found", { status: 404 });
  }
};
