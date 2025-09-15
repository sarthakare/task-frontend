"use client";
import { useEffect, useState, useRef } from "react";
import { websocketAPI } from "@/lib/api-service";

export default function WebSocketDemo() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<string>("Disconnected");
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Initialize WebSocket connection
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    const ws = websocketAPI.createConnection(
      (data) => setMessages(prev => [...prev, data]),
      (error) => {
        setConnectionStatus("Error");
        setMessages(prev => [...prev, "WebSocket error occurred"]);
        console.error("WebSocket error:", error);
      }
    );
    wsRef.current = ws;

    ws.onopen = () => {
      setConnectionStatus("Connected");
      setMessages(prev => [...prev, "Connected to WebSocket server"]);
    };

    ws.onclose = () => {
      setConnectionStatus("Disconnected");
      setMessages(prev => [...prev, "Disconnected from WebSocket server"]);
    };
  };

  const sendMessage = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && input.trim()) {
      wsRef.current.send(input);
      setInput("");
    } else {
      setMessages(prev => [...prev, "Cannot send message: WebSocket not connected"]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const reconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    connectWebSocket();
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">WebSocket Demo</h2>
        
        {/* Connection Status */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600">Status:</span>
            <span className={`px-2 py-1 rounded text-sm font-medium ${
              connectionStatus === "Connected" 
                ? "bg-green-100 text-green-800" 
                : connectionStatus === "Disconnected"
                ? "bg-gray-100 text-gray-800"
                : "bg-red-100 text-red-800"
            }`}>
              {connectionStatus}
            </span>
          </div>
          <button
            onClick={reconnect}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
          >
            Reconnect
          </button>
        </div>

        {/* Messages Display */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium text-gray-700">Messages</h3>
            <button
              onClick={clearMessages}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
            >
              Clear
            </button>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto border">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-center">No messages yet...</p>
            ) : (
              <div className="space-y-2">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded text-sm ${
                      msg.includes("Connected") || msg.includes("Message received")
                        ? "bg-blue-100 text-blue-800"
                        : msg.includes("Disconnected") || msg.includes("Error")
                        ? "bg-red-100 text-red-800"
                        : "bg-white text-gray-800 border"
                    }`}
                  >
                    {msg}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Input Section */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={connectionStatus !== "Connected"}
          />
          <button
            onClick={sendMessage}
            disabled={connectionStatus !== "Connected" || !input.trim()}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-1">Instructions:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Type a message and click &quot;Send&quot; or press Enter</li>
            <li>• The server will echo back your message</li>
            <li>• Use &quot;Reconnect&quot; if the connection is lost</li>
            <li>• Check the status indicator for connection state</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
