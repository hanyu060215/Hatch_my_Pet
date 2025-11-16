<div align="center">

# 🐣 Hatch My Pet

**An AI-powered trivia game where your pet evolves as you answer questions!**

[Live Demo](https://virtualpets-trivia.netlify.app) 
</div>

---

## ✨ Features

🎯 **Custom Topics** - Enter 1-3 keywords and get AI-generated trivia questions tailored to your interests  
🧠 **Adaptive Difficulty** - Questions adapt based on your performance (Easy → Medium → Hard → Challenge)  
🐣 **Pet Evolution** - Watch your virtual pet grow from egg to fully evolved creature as you answer correctly  
⏱️ **60-Second Timer** - Race against the clock to complete your trivia round  
🎵 **Background Music** - Immersive audio with mute toggle for focus mode  
📱 **Mobile-First Design** - Gorgeous UI optimized for phones and tablets  
🚀 **Real-Time AI** - Powered by Google's Gemini 2.0 Flash for instant question generation  

---

## 🎮 How to Play

1. **Enter Your Topic** - Type 1-3 keywords (e.g., "space, dinosaurs, music") in the Trivia Menu
2. **Lock It In** - Hit the "Lock In Topic" button to start your round
3. **Answer Questions** - You have 60 seconds to answer 5 multiple-choice questions
4. **Watch Your Pet Evolve** - Each correct answer helps your pet grow stronger!
5. **Play Again** - Lock in a new topic and watch your pet continue evolving

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16+ and npm
- **Gemini API Key** - Get one free at [Google AI Studio](https://aistudio.google.com/app/apikey)

### Installation

```bash
# Clone the repository
git clone https://github.com/hanyu060215/VirtualPets-Trivia.git
cd VirtualPets-Trivia

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### Running Locally

**Option 1: Development Mode (Recommended)**

```bash
# Terminal 1 - Start backend
cd server
GEMINI_API_KEY=your_api_key_here npm start

# Terminal 2 - Start frontend (in project root)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

**Option 2: Production Build**

```bash
# Build the frontend
npm run build

# Preview production build
npm run preview
```

---

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **Vite** - Lightning-fast build tool
- **CSS3** - Custom animations and responsive design

### Backend
- **Node.js + Express** - RESTful API server
- **Google Gemini AI** - Question generation with adaptive prompts
- **dotenv** - Environment configuration

### Deployment
- **Netlify** - Frontend hosting with automatic deploys
- **Render** - Backend hosting with free tier support
