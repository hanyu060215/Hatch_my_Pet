# API Troubleshooting Guide

## Quick Diagnostics

### 1. Check if Backend is Running

**Test the health endpoint:**
```bash
# Replace with your deployed backend URL
curl https://your-backend-url.onrender.com/health

# Expected response:
# {"status":"ok","model":"models/gemini-2.0-flash","timestamp":"2025-11-16T..."}
```

**Test root endpoint:**
```bash
curl https://your-backend-url.onrender.com/

# Expected response:
# {"message":"VirtualPets Trivia API","endpoints":["/health","/api/generateTrivia"],"model":"..."}
```

### 2. Test API Endpoint Directly

```bash
curl -X POST https://your-backend-url.onrender.com/api/generateTrivia \
  -H "Content-Type: application/json" \
  -d '{"keywords":"space, animals","lastRoundScore":0}'

# Expected: JSON array with 5 trivia questions
# If error: Note the error message
```

### 3. Common Issues & Fixes

#### Issue: "GEMINI_API_KEY environment variable not set"
**Fix**: In your hosting platform (Render/Railway/etc.):
- Go to Environment Variables
- Add: `GEMINI_API_KEY = your_actual_api_key_here`
- Redeploy the service

#### Issue: "AI model denied the request" or 404/403
**Fix**: Update model name
- Add environment variable: `GEMINI_MODEL = models/gemini-2.0-flash`
- Or try: `GEMINI_MODEL = models/gemini-2.5-flash`

#### Issue: "Failed to fetch" from frontend
**Fix**: Update frontend environment variable
1. In Netlify/Vercel, set: `VITE_API_BASE_URL = https://your-backend-url.onrender.com`
2. **Important**: No trailing slash!
3. Redeploy frontend

#### Issue: CORS errors in browser console
**Fix**: Already handled in the updated server.js. Redeploy backend.

#### Issue: "Cannot connect to backend"
**Checks**:
1. Backend must use HTTPS (not HTTP)
2. Backend must be publicly accessible
3. Frontend env var must point to correct backend URL
4. Backend must be running (check logs)

#### Issue: Cold start delays (Render free tier)
**Behavior**: First request takes 30-60 seconds
**Fix**: Upgrade to paid tier OR wait for service to wake up

### 4. Check Deployment Logs

**Render:**
1. Go to your service dashboard
2. Click "Logs" tab
3. Look for startup errors or request errors

**Netlify:**
1. Go to site dashboard
2. Click "Deploy log" for latest deploy
3. Check for build errors

### 5. Verify Environment Variables

**Backend (Render/Railway) should have:**
```
GEMINI_API_KEY = your_actual_api_key_here
PORT = 5001 (optional, usually auto-set)
GEMINI_MODEL = models/gemini-2.0-flash (optional)
```

**Frontend (Netlify/Vercel) should have:**
```
VITE_API_BASE_URL = https://your-actual-backend-url.onrender.com
```

### 6. Test Local Setup First

Before debugging deployment, ensure it works locally:

```bash
# Terminal 1 - Backend
cd server
GEMINI_API_KEY=your_actual_api_key_here npm start

# Should see: "Trivia Backend listening at http://0.0.0.0:5001"

# Terminal 2 - Test backend
curl -X POST http://localhost:5001/api/generateTrivia \
  -H "Content-Type: application/json" \
  -d '{"keywords":"test","lastRoundScore":0}'

# Terminal 3 - Frontend
npm run dev

# Open http://localhost:5173
```

### 7. Browser Developer Tools

Open browser console (F12) and look for:

**Network tab:**
- Click on failed API request
- Check "Headers" → "Request URL" (should be full HTTPS URL)
- Check "Response" → Look for error message

**Console tab:**
- Look for CORS errors
- Look for "Failed to fetch" errors
- Note exact error messages

### 8. Platform-Specific Checks

#### Render
- Service must be "Web Service" (not "Static Site")
- Root Directory should be: `server`
- Start Command: `node server.js`
- Auto-deploy should be enabled

#### Netlify
- Build command: `npm run build`
- Publish directory: `dist`
- Must redeploy after changing environment variables

### 9. Quick Fixes Checklist

- [ ] Backend health endpoint returns 200 OK
- [ ] Backend `/api/generateTrivia` responds to POST
- [ ] `GEMINI_API_KEY` is set in backend environment
- [ ] `VITE_API_BASE_URL` is set in frontend environment
- [ ] Frontend env URL matches actual backend URL
- [ ] No trailing slash in `VITE_API_BASE_URL`
- [ ] Both services deployed successfully (no build errors)
- [ ] Backend logs show "Trivia Backend listening"
- [ ] CORS headers present in backend response

### 10. Still Not Working?

**Collect this information:**

1. Backend URL: _________________
2. Frontend URL: _________________
3. Error from `curl` test: _________________
4. Error from browser console: _________________
5. Backend deployment logs (last 20 lines): _________________

**Common deployment mistakes:**
- Forgot to set environment variables
- Backend URL has typo in frontend config
- Backend failed to build (check logs)
- Using HTTP instead of HTTPS
- API key expired or invalid
- Gemini API quota exceeded

---

## Example Working Configuration

### Backend (Render)
```
Service Name: virtualpets-api
Repository: hanyu060215/VirtualPets-Trivia
Branch: main
Root Directory: server
Build Command: npm install
Start Command: node server.js

Environment Variables:
GEMINI_API_KEY=your_actual_api_key_here
GEMINI_MODEL=models/gemini-2.0-flash

Public URL: https://virtualpets-api.onrender.com
```

### Frontend (Netlify)
```
Site name: virtualpets-trivia
Repository: hanyu060215/VirtualPets-Trivia
Branch: main
Build command: npm run build
Publish directory: dist

Environment Variables:
VITE_API_BASE_URL=https://virtualpets-api.onrender.com

Public URL: https://virtualpets-trivia.netlify.app
```

### Test Commands
```bash
# 1. Test backend health
curl https://virtualpets-api.onrender.com/health

# 2. Test API endpoint
curl -X POST https://virtualpets-api.onrender.com/api/generateTrivia \
  -H "Content-Type: application/json" \
  -d '{"keywords":"space","lastRoundScore":0}'

# 3. Open frontend
# Visit: https://virtualpets-trivia.netlify.app
# Enter keywords and click Start
```

---

## Need More Help?

1. Share the exact error message you're seeing
2. Share your backend URL so I can test it
3. Share backend deployment logs
4. Share browser console screenshot
