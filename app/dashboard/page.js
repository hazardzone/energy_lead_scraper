"use client";
import { useEffect, useState } from "react";
import LeadTable from "@/components/LeadTable";
import StatsCards from "@/components/StatsCards";
import { io } from "socket.io-client";

export default function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [isScraping, setIsScraping] = useState(false);
  const [socket, setSocket] = useState(null);
  const [error, setError] = useState(null);

  const triggerScrape = () => {
    setIsScraping(true);
    setError(null); // Reset error state
    socket.emit("scrape-leads", { keyword: "particulier", city: "Paris" });
  };

  const stopScraping = () => {
    setIsScraping(false);
    socket.emit("stop-scraping");
  };

  useEffect(() => {
    // Initialize Socket.IO connection
    const newSocket = io("http://localhost:3001", {
      path: "/api/socket",
      transports: ["websocket"], // Force WebSocket transport
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Connected to WebSocket server");
    });

    newSocket.on("scrape-results", (data) => {
      console.log("Received scrape results:", data);
      setLeads(Array.isArray(data) ? data : []);
      setIsScraping(false);
    });

    newSocket.on("scrape-error", (errorMessage) => {
      console.log("Received scrape error:", errorMessage);
      setError(errorMessage);
      setIsScraping(false);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("❌ Disconnected from WebSocket server", reason);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="flex gap-4 mb-6">
        <button
          onClick={triggerScrape}
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={isScraping}
        >
          {isScraping ? "Scraping..." : "Start Scraping"}
        </button>
        {isScraping && (
          <button
            onClick={stopScraping}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Stop Scraping
          </button>
        )}
      </div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-6">
          {error}
        </div>
      )}
      <StatsCards leads={leads} />
      <LeadTable leads={leads} />
    </div>
  );
}