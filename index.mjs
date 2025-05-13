export default {
  async fetch(request) {
    console.log("🌐 Incoming request:", request.method, new URL(request.url).pathname);

    if (request.method === "POST") {
      const body = await request.json();
      console.log("📨 Payload:", JSON.stringify(body));

      return new Response("pong", { status: 200 });
    }

    return new Response("Not found", { status: 404 });
  }
};
