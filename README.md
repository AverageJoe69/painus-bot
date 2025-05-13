# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


NOTES FOR GPT:

# PAINUS Telegram Bot

**Painus** is a Telegram bot built with Cloudflare Workers and OpenAI, acting as a personality-driven crypto game host. This project includes:

* GPT-4o personality simulation via OpenAI API
* Telegram integration via Webhook
* Sepolia testnet wallet for sending ETH
* KV namespace memory

---

## Prerequisites

### Secrets Required in Cloudflare Workers

* `OPENAI_API_KEY` — from [OpenAI](https://platform.openai.com/account/api-keys)
* `TELEGRAM_BOT_TOKEN` — from [BotFather](https://t.me/botfather) on Telegram
* `INFURA_KEY` — from [Infura](https://infura.io/) (project for Sepolia access)
* `WALLET_PRIVATE_KEY` — private key to Sepolia ETH wallet (for controlled token transfers)
* `WEBHOOK_URL` — usually `https://your-worker-subdomain.workers.dev`

### Environment Setup

1. Clone the repo.
2. Run `npm install`.
3. Add your secrets to Cloudflare:

```bash
wrangler secret put OPENAI_API_KEY
wrangler secret put TELEGRAM_BOT_TOKEN
wrangler secret put INFURA_KEY
wrangler secret put WALLET_PRIVATE_KEY
wrangler secret put WEBHOOK_URL
```

4. Ensure `worker.js` is your build entry point:

```js
// vite.config.js
lib: {
  entry: 'src/worker.js',
  formats: ['es'],
  fileName: () => 'worker.js'
}
```

5. Deploy with:

```bash
BUILD_TARGET=worker npx vite build
wrangler deploy
```

6. Set Telegram webhook:

```bash
curl -X POST \
  "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook" \
  -d "url=https://your-worker-subdomain.workers.dev"
```

---

## Triggering ETH Transfer (Sepolia)

To manually send ETH from the bot wallet:

```bash
curl -X POST https://your-worker-subdomain.workers.dev/send-eth \
  -H "Content-Type: application/json" \
  -d '{"to":"0xAddressHere","amount":"0.001"}'
```

---

## Notes

* GPT context is retained per user using Cloudflare KV.
* ETH sending is only enabled via a separate POST route for now.
* Be careful with rate limits and CPU time on the free Worker tier.

---

## File Structure

```
- src/
  - worker.js       # Main logic for bot replies and transactions
- vite.config.js     # Vite build config
- wrangler.toml      # Cloudflare config
```

---

## Status

Painus is LIVE on Telegram and actively responding via Webhook.

---

## To-Do

* Game state progression (e.g., player count-based messages)
* Dynamic ETH incentive logic
* Anti-rug justification logic

---

## Contact

Project lead: Joe Conway


---

# 🧠 Painus Bot — Production Deployment Notes (May 2025)

✅ This bot is now deployed using **Cloudflare Workers** with `index.mjs` as the entry file.  
❌ Do **NOT** use `vite build` — it's no longer part of the deployment flow.

---

## 🔧 How to Deploy

1. Make sure your `wrangler.toml` points to the correct Worker file:
   ```toml
   main = "index.mjs"
Add secrets to Cloudflare:

bash
Copy
Edit
wrangler secret put TELEGRAM_BOT_TOKEN
wrangler secret put OPENAI_API_KEY
wrangler secret put INFURA_KEY
wrangler secret put WALLET_PRIVATE_KEY
Deploy (no build needed):

bash
Copy
Edit
wrangler deploy
✅ Webhook Setup for Telegram
bash
Copy
Edit
curl -F "url=https://painus-telegram-bot.YOUR_SUBDOMAIN.workers.dev" \
  https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook
🧠 Bot Behavior
Replies via GPT-4o (OpenAI)

Sends ETH via Sepolia (Infura + ethers.js)

Tracks users with Cloudflare KV

No frontend build required

📁 Final Project Structure
bash
Copy
Edit
index.mjs           # Main deployed Worker file
wrangler.toml       # Config points to index.mjs
README.md           # You're reading it
csharp
Copy
Edit

#### 3. Save the file.

#### 4. Commit & Push:
```bash
git add README.md
git commit -m "📄 Appended production deployment notes to README"
git push
Let me know once that's done and Painus will be fully Git-preserved and bulletproof. 







