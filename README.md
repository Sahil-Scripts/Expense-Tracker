# 🚀 Kubeo - AI-Powered Smart Expense Tracker

![Kubeo Banner](https://via.placeholder.com/1200x400/06b6d4/ffffff?text=Kubeo+Financial+Dashboard)

**Kubeo** is not just another expense tracker. It is an intelligent financial companion designed to help you track, analyze, and optimize your spending habits with the power of **AI** and **Machine Learning**.

Built with a focus on **User Experience (UX)**, Kubeo features a stunning dark mode, smooth animations, and gamified elements to make personal finance fun and engaging.

---

## ✨ Key Features

### 🧠 **Smart AI & ML Insights**
*   **Future Forecasting**: Predicts your next month's spending based on historical data.
*   **Smart Savings Tips**: Analyzes your habits to provide personalized advice.
*   **Budget Alerts**: Real-time warnings when you approach your limit.

### ⚡ **Power User Tools**
*   **📸 Receipt Scanner (OCR)**: Auto-fill transactions by simply scanning a receipt image (powered by Tesseract.js).
*   **➕ Floating Quick-Add**: Add transactions instantly from anywhere on the dashboard.
*   **📂 Custom Categories**: Create and manage your own categories with custom icons.

### 🎨 **Premium UX & Design**
*   **🌙 Beautiful Dark Mode**: Fully responsive dark/light theme switcher.
*   **🎉 Gamified Success**: Confetti celebrations when you stay under budget!
*   **📊 Interactive Charts**: Visual breakdown of expenses using Pie, Bar, and Line charts.
*   **💫 Smooth Animations**: Modern UI with glassmorphism, toast notifications, and animated counters.

---

## 🛠️ Tech Stack

*   **Frontend**: React (Vite), Tailwind CSS, Recharts, Framer Motion
*   **Backend**: Node.js, Express.js
*   **Database**: MongoDB Atlas (Cloud)
*   **AI/ML**: Simple Linear Regression (Custom implementation), Tesseract.js (OCR)
*   **Authentication**: JWT (JSON Web Tokens)

---

## 🚀 How to Run Locally

Follow these steps to get Kubeo running on your machine in minutes.

### Prerequisites
*   [Node.js](https://nodejs.org/) installed.
*   A [MongoDB Atlas](https://www.mongodb.com/atlas) connection string.

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/kubeo.git
cd kubeo
```

### 2. Setup Backend
```bash
cd backend
npm install
```
*   Create a `.env` file in the `backend` folder:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string_here
    JWT_SECRET=your_secret_key_here
    ```
*   Start the server:
    ```bash
    npm run dev
    ```
    *(Server runs on http://localhost:5000)*

### 3. Setup Frontend
Open a new terminal:
```bash
cd frontend
npm install
```
*   Start the React app:
    ```bash
    npm run dev
    ```
    *(App runs on http://localhost:5173)*

### 4. Login Details
You can register a new account, or use the demo credentials if set up:
*   **Email**: `demo@local`
*   **Password**: `password123`

---

## 📂 Project Structure

```
kubeo/
├── backend/             # Node.js/Express Server
│   ├── models/          # Database Schemas (User, Transaction)
│   ├── routes/          # API Endpoints (Auth, Transactions, ML)
│   └── ml/              # Machine Learning Logic
│
└── frontend/            # React Application
    ├── src/
    │   ├── components/  # Reusable UI Components
    │   ├── pages/       # Main Dashboard Views
    │   └── api/         # Axios Configuration
    └── public/          # Static Assets
```

---


