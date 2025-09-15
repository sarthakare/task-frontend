// Simple WebSocket test script
// Run with: node test-websocket.js

const WebSocket = require('ws');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';
const wsUrl = API_BASE_URL.replace('http', 'ws').replace('https', 'wss') + '/ws';

console.log(`Testing WebSocket connection to: ${wsUrl}`);

const ws = new WebSocket(wsUrl);

ws.on('open', function open() {
  console.log('✅ Connected to WebSocket server');
  
  // Send a test message
  const testMessage = 'Hello from test script!';
  console.log(`📤 Sending: ${testMessage}`);
  ws.send(testMessage);
});

ws.on('message', function message(data) {
  console.log(`📥 Received: ${data}`);
});

ws.on('error', function error(err) {
  console.error('❌ WebSocket error:', err.message);
});

ws.on('close', function close() {
  console.log('🔌 WebSocket connection closed');
  process.exit(0);
});

// Close connection after 5 seconds
setTimeout(() => {
  console.log('⏰ Closing connection...');
  ws.close();
}, 5000);
