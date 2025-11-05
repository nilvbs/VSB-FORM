# ⚡ Quick Deploy Guide (5 Minutes)

Follow these steps to deploy your app in 5 minutes!

## 🎯 Prerequisites

- GitHub account
- Git installed on your computer

## 📝 Step-by-Step

### 1️⃣ Push to GitHub (2 minutes)

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Employee Task Form - Ready for deployment"

# Create repository on GitHub.com (name it: employee-task-form)
# Then run:
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/employee-task-form.git
git push -u origin main
```

### 2️⃣ Deploy Backend on Render (2 minutes)

1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Select your repository: `employee-task-form`
5. Fill in:
   - **Name**: `employee-form-backend`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
6. Click "Create Web Service"
7. **COPY THE URL** (e.g., `https://employee-form-backend.onrender.com`)

### 3️⃣ Update Frontend with Backend URL (30 seconds)

Create a file `.env.local` in the root folder:

```
VITE_API_URL=https://employee-form-backend.onrender.com
```

Replace with your actual Render URL from step 2.

Then commit and push:
```bash
git add .
git commit -m "Add production API URL"
git push
```

### 4️⃣ Deploy Frontend on Vercel (1 minute)

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New..." → "Project"
4. Select your repository: `employee-task-form`
5. Click "Deploy"
6. Done! You'll get a URL like: `https://employee-task-form.vercel.app`

### 5️⃣ Update CORS (30 seconds)

1. Open `server/server.js`
2. Find line ~30 (CORS configuration)
3. Update to:

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://employee-task-form.vercel.app',  // Your Vercel URL
    'https://employee-task-form-*.vercel.app'
  ],
  credentials: true
}));
```

4. Save, commit, push:
```bash
git add .
git commit -m "Update CORS for production"
git push
```

## ✅ Done!

Your app is now live at:
- **Frontend**: `https://employee-task-form.vercel.app`
- **Backend**: `https://employee-form-backend.onrender.com`

## 📥 Download CSV Data

Click the "📥 Download All Data (CSV)" button in the app header!

Or visit directly:
```
https://employee-form-backend.onrender.com/api/download-csv
```

## ⚠️ Important Notes

1. **First request is slow**: Render free tier spins down after 15 min. First request takes 30-60 sec.
2. **Data persistence**: Download CSV regularly! Free tier has ephemeral storage.
3. **Auto-deploy**: Every git push automatically deploys to both Vercel and Render.

## 🎉 That's it!

Your form is now accessible from anywhere in the world!

For detailed information, see `DEPLOYMENT_GUIDE.md`.

