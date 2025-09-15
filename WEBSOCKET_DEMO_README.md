# WebSocket Demo

This is a minimal WebSocket example demonstrating real-time communication between FastAPI backend and Next.js frontend.

## Features

- **FastAPI Backend**: WebSocket endpoint at `/ws` that echoes received messages
- **Next.js Frontend**: React component with real-time messaging interface
- **Centralized API Service**: WebSocket utilities integrated into the existing API service
- **Connection Management**: Automatic reconnection and status indicators
- **Modern UI**: Clean, responsive interface with Tailwind CSS

## How to Test

### Local Development

#### 1. Start the Backend Server
```bash
cd task-backend
python -m uvicorn main:app --reload
```
The server will run on `http://localhost:8000`

#### 2. Start the Frontend Server
```bash
cd task-frontend
npm run dev
```
The frontend will run on `http://localhost:3000`

#### 3. Access the WebSocket Demo
Navigate to: `http://localhost:3000/websocket-demo`

#### 4. Test the Connection
1. You should see "Connected to WebSocket server" message
2. Type a message in the input field
3. Click "Send" or press Enter
4. The server will echo back: "Message received: [your message]"

### Production Deployment

#### 1. Backend Deployment (HTTPS Required)
Your backend must be deployed with HTTPS support for WebSocket Secure (WSS) connections.

**Environment Variables:**
- Set `NEXT_PUBLIC_API_URL` to your production backend URL (e.g., `https://your-backend.herokuapp.com`)

#### 2. Frontend Deployment (Vercel)
The frontend is already configured for production at `https://task-frontend-neon.vercel.app`

**Environment Variables:**
- `NEXT_PUBLIC_API_URL`: Your production backend URL (HTTPS)
- `NEXT_PUBLIC_API_BASE_URL`: Alternative variable name (same as above)

#### 3. Access Production WebSocket Demo
Navigate to: `https://task-frontend-neon.vercel.app/websocket-demo`

#### 4. Protocol Handling
- **Local Development**: Uses `ws://` (WebSocket)
- **Production**: Uses `wss://` (WebSocket Secure)
- The API service automatically detects HTTPS and switches to WSS protocol

## Architecture

### Backend (`task-backend/main.py`)
- WebSocket endpoint at `/ws`
- Accepts connections and stores them in `active_connections` list
- Echoes received messages back to the client
- Handles connection cleanup on disconnect

### Frontend (`task-frontend/`)
- **Component**: `components/websocket-demo.tsx` - Main WebSocket interface
- **Page**: `app/websocket-demo/page.tsx` - Demo page wrapper
- **Service**: `lib/api-service.ts` - Centralized WebSocket utilities

### Key Features
- **Connection Status**: Visual indicator showing Connected/Disconnected/Error states
- **Message History**: Scrollable list of all messages
- **Reconnection**: Manual reconnect button for testing
- **Error Handling**: Graceful error handling and user feedback
- **Responsive Design**: Works on desktop and mobile devices

## Integration with Existing Project

The WebSocket functionality is integrated into the existing TaskManager project:

- Uses the same API base URL configuration
- Follows the centralized API service pattern
- Maintains consistent styling with the rest of the application
- Can be extended for real-time task updates, notifications, etc.

## Next Steps

This basic WebSocket setup can be extended for:
- Real-time task status updates
- Live notifications
- Collaborative editing
- Team chat functionality
- Dashboard live updates

## Troubleshooting

- **Connection Failed**: Ensure both servers are running and ports are available
- **CORS Issues**: Check that the backend CORS configuration includes your frontend URL
- **WebSocket URL**: Verify the API_BASE_URL environment variable is set correctly
