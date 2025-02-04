import { Server } from "socket.io";

export default function handler(req, res) {
  if (res.socket.server.io) {
    console.log("⚡ WebSocket server is already running");
    res.end();
    return;
  }

  console.log("🚀 Initializing WebSocket server...");

  const io = new Server(res.socket.server, {
    path: "/api/socket",
  });

  io.on("connection", (socket) => {
    console.log("✅ A client connected!");

    socket.on("scrape-leads", async ({ keyword, city }) => {
      console.log(`🕵️ Scraping leads for: ${keyword} in ${city}`);
      // Simulate scraping (replace with your actual scraper logic)
      const leads = [{ name: "Test Lead", phone: "1234567890", address: "123 Test St" }];
      socket.emit("scrape-results", leads);
    });

    socket.on("disconnect", () => {
      console.log("❌ A client disconnected");
    });
  });

  res.socket.server.io = io;
  res.end();
}