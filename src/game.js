// ✅ Rollback to stable state before debug tools were added

import yaml from "js-yaml";
import painusRaw from "./painus.yaml";

const painusProfile = yaml.load(painusRaw);

export async function handleJoinAndChat(chatId, userMessage, env) {
  let state = await env.MEMORY.get("game_state", "json") || {
    players: [],
    phase: "recruiting",
    votes: {},
    responses: {},
    chatHistory: {}
  };

  const msg = userMessage.toLowerCase().trim();

  if (state.phase === "questionnaire") {
    if (!state.responses[chatId]) {
      state.responses[chatId] = [];
    }
    const qIndex = state.responses[chatId].length;
    state.responses[chatId].push(userMessage);

    if (qIndex + 1 < questions.length) {
      await sendMessage(env, chatId, questions[qIndex + 1]);
    } else {
      await sendMessage(env, chatId, `✅ Thanks. Your answers have been logged.`);
    }

    await env.MEMORY.put("game_state", JSON.stringify(state));

    const allDone = state.players.every(pid =>
      state.responses[pid]?.length === questions.length
    );

    if (allDone) {
      await pickWinner(env, state);
    }
    return;
  }

  if (msg === "join" && !state.players.includes(chatId)) {
    state.players.push(chatId);
    await env.MEMORY.put("game_state", JSON.stringify(state));

    if (state.players.length === 1) {
      await sendMessage(env, chatId, `📈 Yo — you’re early.\n\nRugging’s tough right now but I’m working every angle.\nGive me a minute... I should have a solid 2X ROI very soon. 🧪`);
      return;
    } else if (state.players.length === 2) {
      const [p1, p2] = state.players;
      await sendMessage(env, p2, `💸 Let's go! We’ve locked in 2X profits!`);
      await sendMessage(env, p1, `📢 Yo, profits just hit 2X.`);
      await broadcast(env, state.players, `🧠 To close this investment session and realise profits, all investors must unanimously vote to end the session.\n\nReply with "yes" or "no".`);
      return;
    }
  }

  if (["yes", "no"].includes(msg) && state.players.includes(chatId)) {
    state.votes[chatId] = msg;
    await env.MEMORY.put("game_state", JSON.stringify(state));
    await sendMessage(env, chatId, `🗳️ Vote received: ${msg.toUpperCase()}`);
    await checkVotes(env, state);
    return;
  }

  if (state.players.includes(chatId)) {
    if (!state.chatHistory[chatId]) state.chatHistory[chatId] = [];
    state.chatHistory[chatId].push(userMessage);
    await env.MEMORY.put("game_state", JSON.stringify(state));

    const gptReply = await getPainusReply(env, userMessage);
    await sendMessage(env, chatId, gptReply);
  }
}

async function checkVotes(env, state) {
  const total = state.players.length;
  const received = Object.keys(state.votes).length;
  if (received < total) return;

  const allYes = state.players.every(pid => state.votes[pid] === "yes");
  if (allYes) {
    await broadcast(env, state.players, `🧠 Serious moment... the investment session is now closed.\n\n💀 Profit allocation will begin shortly.`);
    await broadcast(env, state.players, `😂 Okay I'm back — only a few more rugs to pull! Get ready.`);
    state.phase = "questionnaire";
    for (const pid of state.players) {
      await sendMessage(env, pid, `🧠 I have an important questionnaire that will help me decide who gets the profits.`);
      await sendMessage(env, pid, `❓ ${questions[0]}`);
    }
  } else {
    await broadcast(env, state.players, `📉 Not unanimous. Investment session continues. Holding strong.`);
  }
  state.votes = {};
  await env.MEMORY.put("game_state", JSON.stringify(state));
}

const questions = [
  "How many rugs are getting pulled this session?",
  "Cheeseburgers or corndogs?",
  "FOCG or OCG?",
  "What is the fastest car in the world?",
  "Who would win in a fight, me or L. Ron Hubbard?",
  "Pussy or BTC?"
];

const idealAnswers = [
  "enough",
  "cheeseburgers, i don't eat, but if i did, i would avoid dick-shaped foods.",
  "ocg",
  "lambo",
  "me... fuck that startrek-scifi bitch.",
  "trick question, btc is for pussies."
];

async function pickWinner(env, state) {
  const scores = {};

  for (const pid of state.players) {
    const answers = (state.responses[pid] || []).map(a => a.toLowerCase());
    const aScore = answers.reduce((score, ans, i) => {
      return score + (ans.includes(idealAnswers[i]) ? 1 : 0);
    }, 0);

    const convo = (state.chatHistory[pid] || []).join("\n");
    const vibeScore = await scoreVibes(env, convo);

    scores[pid] = aScore + vibeScore;
  }

  const winner = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  await broadcast(env, state.players, `👑 The chosen one is: ${winner}`);
}

async function scoreVibes(env, chatText) {
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
          content: `${painusProfile.persona.identity}\nBeliefs: ${painusProfile.persona.beliefs.join(" | ")}\nMotivation: ${painusProfile.persona.motivation}\nNow score this player from 0 (loser) to 5 (alpha). Only return a number.`
        },
        {
          role: "user",
          content: chatText
        }
      ],
      max_tokens: 5
    })
  });

  const txt = await res.text();
  const num = parseInt(txt.match(/\d+/)?.[0] || "0", 10);
  return Math.max(0, Math.min(num, 5));
}

async function sendMessage(env, chatId, text) {
  return await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text })
  });
}

async function broadcast(env, playerIds, text) {
  for (const pid of playerIds) {
    await sendMessage(env, pid, text);
  }
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
          content: `${painusProfile.persona.identity}\nBeliefs: ${painusProfile.persona.beliefs.join(" | ")}\nMotivation: ${painusProfile.persona.motivation}\nYou are cocky, intense, ruthless.`
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
