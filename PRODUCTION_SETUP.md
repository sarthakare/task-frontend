# Production WebSocket Setup Guide

## Overview
This guide explains how to deploy the WebSocket functionality for production use with `https://task-frontend-neon.vercel.app`.

## Requirements

### 1. Backend HTTPS Deployment
Your FastAPI backend **MUST** be deployed with HTTPS support because:
- Modern browsers require WSS (WebSocket Secure) for HTTPS sites
- Mixed content (HTTP/HTTPS) is blocked by browsers
- The production frontend runs on HTTPS

### 2. Environment Configuration

#### Frontend (Vercel)
Set **one** of these environment variables in your Vercel dashboard:

```bash
NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain.com
# OR
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

**Important**: 
- The URL must start with `https://` for production!
- `NEXT_PUBLIC_API_BASE_URL` is preferred (checked first)

#### Backend CORS
The backend already includes the production frontend URL in CORS origins:
```python
origins = [
    "https://task-frontend-neon.vercel.app",  # Production frontend
    "http://localhost:3000",                  # Local development
    "http://127.0.0.1:3000",                 # Alternative localhost
]
```

## Deployment Options

### Option 1: Heroku (Recommended for FastAPI)
```bash
# Install Heroku CLI and login
heroku login

# Create Heroku app
heroku create your-backend-app-name

# Deploy
git push heroku main

# Scale web dyno
heroku ps:scale web=1

# Check logs
heroku logs --tail
```

### Option 2: Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Option 3: Render
1. Connect your GitHub repository
2. Select "Web Service"
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Option 4: DigitalOcean App Platform
1. Create new app from GitHub
2. Configure build settings
3. Add environment variables
4. Deploy

## Testing Production Setup

### 1. Verify Backend HTTPS
```bash
curl -I https://your-backend-domain.com/health
```
Should return HTTP 200 OK.

### 2. Test WebSocket Connection
```bash
# Using wscat (install with: npm install -g wscat)
wscat -c wss://your-backend-domain.com/ws
```
Type a message and you should get an echo response.

### 3. Test Frontend Integration
1. Visit `https://task-frontend-neon.vercel.app/websocket-demo`
2. Check browser console for connection errors
3. Try sending a message

## Troubleshooting

### Common Issues

#### 1. "WebSocket connection failed"
- **Cause**: Backend not using HTTPS
- **Solution**: Deploy backend with HTTPS/SSL certificate

#### 2. "Mixed content blocked"
- **Cause**: Frontend on HTTPS trying to connect to HTTP backend
- **Solution**: Ensure backend uses HTTPS and `NEXT_PUBLIC_API_URL` starts with `https://`

#### 3. "CORS error"
- **Cause**: Backend CORS not configured for production frontend
- **Solution**: Verify `https://task-frontend-neon.vercel.app` is in CORS origins

#### 4. "Connection refused"
- **Cause**: Backend not deployed or wrong URL
- **Solution**: Verify backend is running and URL is correct

### Debug Steps

1. **Check Environment Variables**
   ```bash
   # In Vercel dashboard, verify (choose one):
   NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain.com
   # OR
   NEXT_PUBLIC_API_URL=https://your-backend-domain.com
   ```

2. **Test Backend Health**
   ```bash
   curl https://your-backend-domain.com/health
   ```

3. **Check Browser Console**
   - Open DevTools → Console
   - Look for WebSocket connection errors
   - Check Network tab for failed requests

4. **Verify Protocol**
   - Local: `ws://localhost:8000/ws`
   - Production: `wss://your-backend-domain.com/ws`

## Security Considerations

1. **HTTPS Only**: Never use HTTP in production
2. **CORS Configuration**: Only allow trusted origins
3. **Rate Limiting**: Consider implementing rate limiting for WebSocket connections
4. **Authentication**: Add authentication for production WebSocket connections if needed

## Next Steps

Once production WebSocket is working:
1. Add real-time task notifications
2. Implement collaborative features
3. Add user presence indicators
4. Create real-time dashboard updates
