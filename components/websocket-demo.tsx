"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useWebSocket } from "@/contexts/websocket-context";

interface ConnectedUser {
  user_id: number;
  user_name: string;
  user_role: string;
  user_department: string;
  connected_at: string;
}

interface UserInfo {
  user_id: number;
  user_name: string;
  user_role: string;
  user_department: string;
}



export default function WebSocketDemo() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [connectedUsers] = useState<ConnectedUser[]>([]);
  const [messageTarget, setMessageTarget] = useState<string>("all");
  const [targetId, setTargetId] = useState<string>("");
  const [currentUser] = useState<UserInfo | null>(null);
  
  // Use global WebSocket connection
  const { isConnected, connectionStatus, sendMessage: globalSendMessage, reconnect } = useWebSocket();

  useEffect(() => {
    // Request users list when connected
    if (isConnected) {
      globalSendMessage({ type: "get_users" });
    }
  }, [isConnected, globalSendMessage]);

  // Note: WebSocket connection is now handled globally by the WebSocketProvider
  // This demo page now uses the global connection

  const sendMessage = () => {
    if (isConnected && input.trim()) {
      // Send structured message data with targeting
      const messageData = {
        type: "message",
        content: input,
        target: messageTarget,
        target_id: targetId || undefined,
        timestamp: new Date().toISOString(),
        sender: currentUser?.user_name || "Anonymous"
      };
      globalSendMessage(messageData);
      setInput("");
    } else {
      setMessages(prev => [...prev, "Cannot send message: WebSocket not connected"]);
      toast.error("Cannot Send", { description: "WebSocket is not connected" });
    }
  };

  const sendDemoToast = (type: string) => {
    if (isConnected) {
      const demoData = {
        type: "demo",
        toast_type: type,
        title: `Demo ${type.charAt(0).toUpperCase() + type.slice(1)} Toast`,
        message: `This is a demo ${type} notification sent to ${messageTarget === "all" ? "all users" : `${messageTarget}${targetId ? `:${targetId}` : ""}`}`,
        target: messageTarget,
        target_id: targetId || undefined,
        timestamp: new Date().toISOString()
      };
      globalSendMessage(demoData);
    } else {
      toast.error("Cannot Send", { description: "WebSocket is not connected" });
    }
  };

  const refreshUsersList = () => {
    if (isConnected) {
      globalSendMessage({ type: "get_users" });
    }
  };

  const getTargetDisplayName = () => {
    if (messageTarget === "all") return "All Users";
    if (messageTarget === "user") return `User ${targetId}`;
    if (messageTarget === "team") return `Team ${targetId}`;
    if (messageTarget === "department") return `Department: ${targetId}`;
    if (messageTarget === "role") return `Role: ${targetId}`;
    return "Unknown Target";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  // reconnect function is now provided by the global WebSocket context

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">WebSocket Demo</h2>
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> This demo now uses the global WebSocket connection that starts automatically when you log in. 
            You can see the connection status in the sidebar.
          </p>
        </div>
        
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
            {currentUser && (
              <span className="text-sm text-gray-500">
                ({currentUser.user_name} - {currentUser.user_role})
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={refreshUsersList}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
            >
              Refresh Users
            </button>
            <button
              onClick={reconnect}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
            >
              Reconnect
            </button>
          </div>
        </div>

        {/* Message Targeting Controls */}
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Message Targeting</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Target Type
              </label>
              <select
                value={messageTarget}
                onChange={(e) => {
                  setMessageTarget(e.target.value);
                  setTargetId(""); // Clear target ID when changing type
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Users</option>
                <option value="user">Specific User</option>
                <option value="team">Team</option>
                <option value="department">Department</option>
                <option value="role">Role</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Target ID/Value
                {messageTarget !== "all" && <span className="text-red-500">*</span>}
              </label>
              {messageTarget === "user" ? (
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select User</option>
                  {connectedUsers.map((user) => (
                    <option key={user.user_id} value={user.user_id.toString()}>
                      {user.user_name} ({user.user_role})
                    </option>
                  ))}
                </select>
              ) : messageTarget === "department" ? (
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Department</option>
                  {Array.from(new Set(connectedUsers.map(u => u.user_department))).map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              ) : messageTarget === "role" ? (
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Role</option>
                  {Array.from(new Set(connectedUsers.map(u => u.user_role))).map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  placeholder={messageTarget === "team" ? "Team ID" : "Target ID"}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}
            </div>
          </div>
          <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-700">
            <strong>Current Target:</strong> {getTargetDisplayName()}
          </div>
        </div>

        {/* Connected Users List */}
        {connectedUsers.length > 0 && (
          <div className="mb-4 p-4 bg-green-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700 mb-3">
              Connected Users ({connectedUsers.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {connectedUsers.map((user) => (
                <div key={user.user_id} className="p-2 bg-white rounded border text-sm">
                  <div className="font-medium">{user.user_name}</div>
                  <div className="text-gray-600">{user.user_role}</div>
                  <div className="text-gray-500">{user.user_department}</div>
                </div>
              ))}
            </div>
          </div>
        )}

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

        {/* Demo Toast Buttons */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Demo Toast Notifications (Target: {getTargetDisplayName()}):
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => sendDemoToast("success")}
              disabled={connectionStatus !== "Connected" || (messageTarget !== "all" && !targetId)}
              className="bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Success Toast
            </button>
            <button
              onClick={() => sendDemoToast("error")}
              disabled={connectionStatus !== "Connected" || (messageTarget !== "all" && !targetId)}
              className="bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Error Toast
            </button>
            <button
              onClick={() => sendDemoToast("warning")}
              disabled={connectionStatus !== "Connected" || (messageTarget !== "all" && !targetId)}
              className="bg-yellow-500 text-white px-3 py-2 rounded text-sm hover:bg-yellow-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Warning Toast
            </button>
            <button
              onClick={() => sendDemoToast("info")}
              disabled={connectionStatus !== "Connected" || (messageTarget !== "all" && !targetId)}
              className="bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Info Toast
            </button>
          </div>
        </div>

        {/* Input Section */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Type a message to ${getTargetDisplayName().toLowerCase()}...`}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={connectionStatus !== "Connected" || (messageTarget !== "all" && !targetId)}
          />
          <button
            onClick={sendMessage}
            disabled={connectionStatus !== "Connected" || !input.trim() || (messageTarget !== "all" && !targetId)}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-1">Instructions:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Select target type and ID to send targeted messages</li>
            <li>• <strong>All Users:</strong> Broadcast to everyone connected</li>
            <li>• <strong>Specific User:</strong> Send direct message to one user</li>
            <li>• <strong>Team:</strong> Send to all users in a specific team</li>
            <li>• <strong>Department:</strong> Send to all users in a department</li>
            <li>• <strong>Role:</strong> Send to all users with a specific role</li>
            <li>• Toast notifications show targeting info in the title</li>
            <li>• Use &quot;Refresh Users&quot; to update connected users list</li>
            <li>• Messages are sent as both toast notifications and chat messages</li>
            <li>• <strong>Task Notifications:</strong> Create/update tasks in the app to see real-time notifications</li>
            <li>• Task notifications include: assignment, status updates, reassignments</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
