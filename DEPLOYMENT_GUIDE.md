# 🚀 How to Deploy Kubeo (Make it Live 24/7)

Currently, your app lives on your laptop. To make it work 24/7, we need to move it to the cloud!

We will use this **100% FREE** stack:
1.  **Database**: MongoDB Atlas (Already Setup! ✅)
2.  **Backend**: Render.com (Free Web Service)
3.  **Frontend**: Vercel (Free Static Hosting)

---

## 📦 Step 1: Put Your Code on GitHub

You need a GitHub account to deploy easily.

1.  Create a new repository on [GitHub.com](https://github.com) called `kubeo-expense-tracker`.
2.  Open your terminal in VS Code (`Ctrl + ~`).
3.  Run these commands to upload your code:

```bash
git init
git add .
git commit -m "Initial commit - Ready for launch 🚀"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/kubeo-expense-tracker.git
git push -u origin main
```
*(Replace `YOUR_USERNAME` with your actual GitHub username)*

---

## ⚙️ Step 2: Deploy Backend (Render)

1.  Go to [dashboard.render.com](https://dashboard.render.com/) and Sign Up/Login with GitHub.
2.  Click **"New +"** → **"Web Service"**.
3.  Select your `kubeo-expense-tracker` repository.
4.  **Configure the settings**:
    *   **Name**: `kubeo-backend`
    *   **Region**: Choose one close to you (e.g., Singapore or Frankfurt).
    *   **Root Directory**: `backend` (Important!)
    *   **Runtime**: Node
    *   **Build Command**: `npm install`
    *   **Start Command**: `node server.js`
    *   **Instance Type**: Free
5.  **Environment Variables** (Scroll down to "Advanced"):
    *   Click "Add Environment Variable"
    *   Key: `MONGO_URI`
    *   Value: *(Paste your MongoDB Connection String here - same as in your .env file)*
    *   Key: `PORT`
    *   Value: `5000`
    *   Key: `JWT_SECRET`
    *   Value: `mysecretkey123` (or whatever you used locally)
6.  Click **"Create Web Service"**.
7.  Wait for it to deploy. Once done, copy the **URL** (e.g., `https://kubeo-backend.onrender.com`). **Save this!**

---

## 🎨 Step 3: Deploy Frontend (Vercel)

1.  Go to [vercel.com](https://vercel.com/) and Sign Up/Login with GitHub.
2.  Click **"Add New..."** → **"Project"**.
3.  Import your `kubeo-expense-tracker` repository.
4.  **Configure Project**:
    *   **Framework Preset**: Vite (should detect automatically)
    *   **Root Directory**: Click "Edit" and select `frontend`.
5.  **Environment Variables**:
    *   Key: `VITE_API_URL`
    *   Value: *(Paste your Render Backend URL here, e.g., `https://kubeo-backend.onrender.com`)*
    *   **IMPORTANT**: Do NOT add a trailing slash `/` at the end of the URL.
6.  Click **"Deploy"**.

---

## 🎉 Step 4: Celebration!

Vercel will give you a domain (e.g., `kubeo-app.vercel.app`).
**Your site is now ONLINE 24/7!** 🌍

You can share this link with anyone, and they can use your app even if your computer is off!

---

## 💡 Troubleshooting

*   **Render "Spinning Down"**: On the free plan, Render puts your backend to sleep after inactivity. The first request might take 30-60 seconds to load. This is normal for free tiers.
*   **CORS Errors**: If you see errors in the browser console, go to your Backend code (`server.js`) and update the `cors` settings to allow your new Vercel domain.

```javascript
// backend/server.js
app.use(cors({
  origin: ["http://localhost:5173", "https://YOUR-VERCEL-APP.vercel.app"],
  credentials: true
}));
```
