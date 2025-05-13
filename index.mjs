export default {
  async fetch(request) {
    console.log("✅ Telegram ping received:");
    console.log("Method:", request.method);
    console.log("URL:", request.url);

    try {
      const body = await request.text();
      console.log("Body:", body);
    } catch (e) {
      console.log("No body or failed to read.");
    }

    return new Response("pong", {
      status: 200,
      headers: { "Content-Type": "text/plain" }
    });
  }
}
