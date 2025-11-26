# MongoDB Atlas Connection Guide

## Your Current Setup

**MongoDB Cluster:** `cluster0.niuk3jk.mongodb.net`  
**Database:** `expense-tracker`

## Problem
Your backend server cannot connect to MongoDB Atlas due to network restrictions. This is typically caused by IP address not being whitelisted in MongoDB Atlas.

## Solution Steps

### Step 1: Get Your Current IP Address

Open Command Prompt and run:
```cmd
curl ifconfig.me
```

Or visit: https://www.whatismyip.com/

### Step 2: Add IP to MongoDB Atlas Whitelist

1. **Login to MongoDB Atlas**
   - Go to: https://cloud.mongodb.com/
   - Login with your credentials

2. **Navigate to Network Access**
   - Click on "Network Access" in the left sidebar
   - Click the "Add IP Address" button

3. **Add Your IP**
   - **Option A (Recommended for Development):**
     - Click "Allow Access from Anywhere"
     - This adds `0.0.0.0/0` (all IPs allowed)
   
   - **Option B (More Secure):**
     - Enter your specific IP address from Step 1
     - Add a description like "Home Network"

4. **Click "Confirm"**
   - Wait a few seconds for the changes to propagate

### Step 3: Verify Connection

After adding the IP address, run this test:

```cmd
cd s:\PTR\backend
node test-db.js
```

✅ **Success:** Should show "SUCCESS: Connected to MongoDB Atlas!"  
❌ **Failure:** May need to check other issues (firewall, VPN, etc.)

### Step 4: Restart Backend Server

The server should now connect successfully:

1. Press `Ctrl+C` in the backend terminal if it's still running
2. Run: `npm run dev`
3. You should see:
   ```
   Mongo connected
   Server listening on 5000
   ```

### Step 5: Test Login

Open http://localhost:5173 and try logging in with:
- Email: `demo@local`
- Password: `password123`

## Troubleshooting

### Still Can't Connect?

1. **Check if you're behind a corporate/school firewall**
   - They might block port 27017 (MongoDB's default port)
   - Try from a different network or use VPN

2. **Check Windows Firewall**
   - Temporarily disable to test
   - Or add exception for Node.js

3. **Verify credentials in `.env`**
   - Ensure username and password are correct
   - Check for special characters that need URL encoding

## Alternative: Use Local MongoDB

If Atlas doesn't work, you can install MongoDB locally:

1. Download from: https://www.mongodb.com/try/download/community
2. Install and start MongoDB
3. Update `.env` to `MONGO_URI=mongodb://localhost:27017/expense-tracker`
4. Run `node seed.js` to create demo data
