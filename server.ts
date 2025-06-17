import irc from "npm:irc";
import { Application, send } from "https://deno.land/x/oak@v12.6.0/mod.ts";
import { WebSocketServer } from "https://deno.land/x/websocket@v0.1.4/mod.ts";

const app = new Application();
const wss = new WebSocketServer(3001); // WS on a separate port (or proxy it later)

const client = new irc.Client("brockman.news", "web-listener", {
  channels: ["#all"],
});

// Serve static files from ./public
app.use(async (ctx) => {
  await send(ctx, ctx.request.url.pathname, {
    root: `${Deno.cwd()}/public`,
    index: "index.html",
  });
});

// Broadcast IRC messages to all connected WebSocket clients
client.addListener("message#all", (from: string, message: string) => {
  const payload = JSON.stringify({ from, message });
  for (const client of wss.clients) {
    client.send(payload);
  }
});

console.log("HTTP server running on http://localhost:3000");
console.log("WebSocket server running on ws://localhost:3001");
await app.listen({ port: 3000 });
