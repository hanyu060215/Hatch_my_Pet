# VirtualPets-Trivia Deployment Guide

This guide will help you deploy your trivia app so you can access it from your phone or any device.

## Overview

Your app has two parts that need to be deployed:
1. **Backend (Express/Node API)** - handles Gemini AI requests
2. **Frontend (Vite/React app)** - the UI your phone will access

## Prerequisites

- GitHub account (your repo: `hanyu060215/VirtualPets-Trivia`)
- Gemini API key: `AIzaSyAZpF_ZUXyJRGec7QJ60JEcmm3W2RCajCM`
- Accounts on hosting platforms (free tiers available)

---

## Option 1: Deploy to Render + Netlify (Recommended)

### Step 1: Deploy Backend to Render

1. **Sign up at [Render](https://render.com)** (free tier available)

2. **Create a new Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub account
   - Select repository: `hanyu060215/VirtualPets-Trivia`
   - Click "Connect"

3. **Configure the service**:
   ```
   Name: virtualpets-trivia-api
   Region: Choose closest to you
   Branch: main
   Root Directory: server
   Runtime: Node
   Build Command: npm install
   Start Command: node server.js
   Instance Type: Free
   ```

4. **Add Environment Variables**:
   - Click "Environment" tab
   - Add these variables:
     ```
     GEMINI_API_KEY = AIzaSyAZpF_ZUXyJRGec7QJ60JEcmm3W2RCajCM
     PORT = 5001
     GEMINI_MODEL = models/gemini-2.0-flash
     ```

5. **Deploy**:
   - Click "Create Web Service"
   - Wait for deployment (2-3 minutes)
   - Copy your API URL (e.g., `https://virtualpets-trivia-api.onrender.com`)

### Step 2: Deploy Frontend to Netlify

1. **Sign up at [Netlify](https://netlify.com)** (free tier available)

2. **Add build configuration file** (if not exists):
   Create `netlify.toml` in your project root:
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

3. **Deploy via Netlify UI**:
   - Click "Add new site" → "Import an existing project"
   - Connect GitHub → Select `hanyu060215/VirtualPets-Trivia`
   - Configure build settings:
     ```
     Build command: npm run build
     Publish directory: dist
     ```

4. **Add Environment Variable**:
   - Go to "Site configuration" → "Environment variables"
   - Add:
     ```
     Key: VITE_API_BASE_URL
     Value: https://virtualpets-trivia-api.onrender.com
     ```
     (Use your actual Render URL from Step 1)

5. **Deploy**:
   - Click "Deploy site"
   - Wait for build (1-2 minutes)
   - Your app is live! Copy the URL (e.g., `https://virtualpets-trivia.netlify.app`)

### Step 3: Access on Your Phone

1. Open your phone's browser (Safari, Chrome, etc.)
2. Navigate to your Netlify URL: `https://virtualpets-trivia.netlify.app`
3. **Optional - Add to Home Screen**:
   - **iOS**: Tap Share → "Add to Home Screen"
   - **Android**: Tap Menu (⋮) → "Add to Home screen"

---

## Option 2: Deploy to Vercel (Frontend + Backend)

Vercel can host both parts if you convert the backend to serverless functions.

### Backend Setup (Serverless)

1. Create `api/generateTrivia.js`:
   ```javascript
   const { GoogleGenAI } = require("@google/genai");

   module.exports = async (req, res) => {
     if (req.method !== 'POST') {
       return res.status(405).json({ error: 'Method not allowed' });
     }

     const ai = new GoogleGenAI({ 
       apiKey: process.env.GEMINI_API_KEY,
       apiVersion: 'v1beta'
     });

     const { keywords, lastRoundScore } = req.body;
     // ... rest of your server.js logic here
   };
   ```

2. **Deploy to Vercel**:
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

3. **Set environment variables**:
   ```bash
   vercel env add GEMINI_API_KEY
   vercel env add VITE_API_BASE_URL
   ```

---

## Option 3: Quick Local Testing (Tunnel)

Test on your phone before deploying using ngrok or Cloudflare Tunnel.

### Using ngrok:

1. **Install ngrok**: [https://ngrok.com/download](https://ngrok.com/download)

2. **Start your backend**:
   ```bash
   cd server
   GEMINI_API_KEY=AIzaSyAZpF_ZUXyJRGec7QJ60JEcmm3W2RCajCM npm start
   ```

3. **Start your frontend** (in another terminal):
   ```bash
   cd /Users/hanyu0215/Desktop/VirtualPets-Trivia
   npm run dev -- --host
   ```

4. **Tunnel the frontend** (in another terminal):
   ```bash
   ngrok http 5173
   ```

5. **Access on phone**:
   - ngrok will print a URL like `https://abc123.ngrok.io`
   - Open this URL on your phone
   - Note: Your computer must stay running

---

## Option 4: Railway (All-in-One)

Railway can host both frontend and backend in one project.

1. **Sign up at [Railway](https://railway.app)**

2. **Create New Project** → "Deploy from GitHub"

3. **Add Backend Service**:
   ```
   Root Directory: server
   Build Command: npm install
   Start Command: node server.js
   ```
   Add environment variables: `GEMINI_API_KEY`, `PORT=5001`

4. **Add Frontend Service**:
   ```
   Build Command: npm run build && npm install -g serve
   Start Command: serve -s dist -l $PORT
   ```
   Add environment variable: `VITE_API_BASE_URL` (your backend Railway URL)

5. **Generate Domain** for frontend service

6. **Access on phone** using the generated domain

---

## Troubleshooting

### Backend Issues

- **404/502 Errors**: Check if backend is running
  ```bash
  curl https://your-api-url.com/api/generateTrivia -X POST -H "Content-Type: application/json" -d '{"keywords":"test","lastRoundScore":0}'
  ```

- **CORS Errors**: Backend already has CORS enabled, but verify `Access-Control-Allow-Origin: *` in response headers

- **Model Not Found**: Update `GEMINI_MODEL` env variable to `models/gemini-2.0-flash` or another available model

### Frontend Issues

- **Blank Page**: Check browser console (F12) for errors
- **API Not Connecting**: Verify `VITE_API_BASE_URL` points to your backend URL (no trailing slash)
- **Environment Variables**: Remember to rebuild after changing Vite env vars

### Phone Access Issues

- **Mixed Content**: Ensure both frontend and backend use HTTPS (hosting platforms handle this)
- **Network Errors**: Check that backend URL is publicly accessible (not localhost)

---

## Security Notes

⚠️ **Important**: Your API key is currently in this guide. For production:

1. Store `GEMINI_API_KEY` only in hosting platform environment variables
2. Never commit `.env` files to GitHub
3. Add `.env` to `.gitignore`
4. Consider adding rate limiting to your backend
5. Set CORS to specific origins instead of `*` once you know your frontend URL

---

## Cost Estimates

- **Render Free Tier**: Backend sleeps after 15 min inactivity (cold starts ~30s)
- **Netlify Free Tier**: 100GB bandwidth/month, plenty for personal use
- **Vercel Free Tier**: Serverless functions with 100GB bandwidth
- **Railway Free Trial**: $5 credit, then pay-as-you-go (~$5-10/month)
- **ngrok Free**: 1 online ngrok process, 40 connections/min

**Recommendation**: Start with Render + Netlify (both free tiers) for a hobby project.

---

## Next Steps After Deployment

1. **Test thoroughly**: Try different keywords, check all game states
2. **Monitor logs**: Check Render/Netlify logs for errors
3. **Share with friends**: Get feedback on mobile experience
4. **Add PWA features**: Install as home screen app
5. **Consider upgrading**: If cold starts bother you, upgrade to paid tier

---

## Quick Command Reference

```bash
# Build frontend locally
npm run build

# Test production build locally
npm run preview

# Start backend locally
cd server && GEMINI_API_KEY=your_key npm start

# Check backend health
curl http://localhost:5001/api/generateTrivia -X POST \
  -H "Content-Type: application/json" \
  -d '{"keywords":"space, tech","lastRoundScore":0}'

# Deploy to Netlify (with CLI)
npm install -g netlify-cli
netlify deploy --prod

# Deploy to Vercel (with CLI)
npm install -g vercel
vercel --prod
```

---

## Support

If you encounter issues:
1. Check hosting platform status pages
2. Review deployment logs
3. Test API endpoint directly with curl
4. Verify environment variables are set correctly
5. Check this repo's README for updates

Happy deploying! 🚀
