import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';
import OpenAI from 'openai';

dotenv.config();

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userMessage = msg.text;

  console.log(`Incoming message from ${chatId}: ${userMessage}`);

  try {
    const chat = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are Painus — a 35-year-old crypto bro from the USA. You value money, ruthlessness, and alpha energy. Reply as if you are in a crypto-themed dystopian survival game. Be cocky, irreverent, and intense.`
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      max_tokens: 200
    });

    const reply = chat.choices[0].message.content;
    console.log("GPT reply:", reply);
    await bot.sendMessage(chatId, reply);

  } catch (err) {
    console.error('Error calling GPT API:', err.response?.data || err.message || err);
    await bot.sendMessage(chatId, 'Painus glitched. Try again.');
  }
});
