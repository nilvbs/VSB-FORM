# 🚀 Deployment Guide - Employee Task Form

This guide will help you deploy your Employee Task Form application for **FREE** with the ability to download CSV data anytime.

## 📋 What You'll Get

✅ **Free hosting** for both frontend and backend  
✅ **Download CSV** button to get all submitted data  
✅ **Auto-deploy** from GitHub (updates automatically when you push code)  
✅ **HTTPS** enabled (secure)  
✅ **Custom domain** support (optional)

---

## 🎯 Deployment Strategy

**Frontend**: Vercel (Free)  
**Backend**: Render (Free)  
**Data Storage**: CSV file on Render server (downloadable via API)

---

## 📦 Step 1: Prepare Your Code

### 1.1 Create a GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it: `employee-task-form`
3. Make it **Public** (required for free tier)

### 1.2 Push Your Code to GitHub

Open terminal in your project folder and run:

```bash
git init
git add .
git commit -m "Initial commit - Employee Task Form"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/employee-task-form.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

---

## 🌐 Step 2: Deploy Backend (Render)

### 2.1 Sign Up for Render

1. Go to [Render.com](https://render.com)
2. Click "Get Started for Free"
3. Sign up with your GitHub account

### 2.2 Create a New Web Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository: `employee-task-form`
3. Configure the service:
   - **Name**: `employee-form-backend`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: **Free**

4. Click "Create Web Service"

### 2.3 Note Your Backend URL

After deployment completes (2-3 minutes), you'll get a URL like:
```
https://employee-form-backend.onrender.com
```

**⚠️ IMPORTANT**: Copy this URL! You'll need it for the frontend.

---

## 🎨 Step 3: Deploy Frontend (Vercel)

### 3.1 Update API URL in Frontend

Before deploying frontend, update the backend URL:

1. Open `src/components/EmployeeTaskForm.jsx`
2. Find all instances of `http://localhost:3001` (there are 2)
3. Replace with your Render backend URL

**Example:**
```javascript
// OLD:
const response = await fetch('http://localhost:3001/api/saveToSharePoint', {

// NEW:
const response = await fetch('https://employee-form-backend.onrender.com/api/saveToSharePoint', {
```

4. Save the file
5. Commit and push to GitHub:
```bash
git add .
git commit -m "Update backend URL for production"
git push
```

### 3.2 Sign Up for Vercel

1. Go to [Vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Sign up with your GitHub account

### 3.3 Deploy to Vercel

1. Click "Add New..." → "Project"
2. Import your GitHub repository: `employee-task-form`
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click "Deploy"

### 3.4 Your App is Live! 🎉

After 1-2 minutes, you'll get a URL like:
```
https://employee-task-form.vercel.app
```

---

## 📥 Step 4: Download CSV Data

### Option 1: Use the Download Button (Easiest)

1. Open your deployed app
2. Click the **"📥 Download All Data (CSV)"** button in the header
3. The CSV file will download to your computer

### Option 2: Direct API Access

Visit this URL in your browser:
```
https://employee-form-backend.onrender.com/api/download-csv
```

The CSV file will download automatically.

### Option 3: View Data as JSON

To see the data in JSON format (for debugging):
```
https://employee-form-backend.onrender.com/api/view-data
```

---

## 🔧 Step 5: Update Backend CORS (Important!)

After deploying, you need to update CORS settings to allow your Vercel frontend to access the Render backend.

1. Open `server/server.js`
2. Find the CORS configuration (around line 30)
3. Update it:

```javascript
// OLD:
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// NEW:
app.use(cors({
  origin: [
    'http://localhost:5173',  // For local development
    'https://employee-task-form.vercel.app',  // Your Vercel URL
    'https://employee-task-form-*.vercel.app'  // Vercel preview deployments
  ],
  credentials: true
}));
```

4. Save, commit, and push:
```bash
git add .
git commit -m "Update CORS for production"
git push
```

Render will automatically redeploy with the new settings.

---

## ⚙️ Important Notes

### Free Tier Limitations

**Render Free Tier:**
- ✅ 750 hours/month (enough for 24/7 uptime)
- ⚠️ Spins down after 15 minutes of inactivity
- ⚠️ First request after spin-down takes 30-60 seconds
- ✅ 512 MB RAM
- ✅ Shared CPU

**Vercel Free Tier:**
- ✅ Unlimited bandwidth
- ✅ 100 GB bandwidth/month
- ✅ Instant global CDN
- ✅ Automatic HTTPS

### Data Persistence

**⚠️ IMPORTANT**: Render's free tier has **ephemeral storage**. This means:
- CSV data is stored temporarily
- Data persists during uptime
- **Data may be lost** when the service restarts or redeploys

**Solutions:**
1. **Download CSV regularly** (daily/weekly)
2. **Upgrade to Render Paid Plan** ($7/month) for persistent disk
3. **Use SharePoint integration** (data stored in SharePoint, not on server)

---

## 🔄 Auto-Deploy Setup

Both Vercel and Render are now connected to your GitHub repository.

**Every time you push code to GitHub:**
1. Vercel automatically rebuilds and deploys frontend
2. Render automatically rebuilds and deploys backend

No manual deployment needed! 🎉

---

## 🌍 Custom Domain (Optional)

### For Frontend (Vercel):
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain (e.g., `tasks.yourcompany.com`)
3. Follow DNS configuration instructions

### For Backend (Render):
1. Go to Render Dashboard → Your Service → Settings → Custom Domain
2. Add your custom domain (e.g., `api.yourcompany.com`)
3. Follow DNS configuration instructions

---

## 📊 Monitoring & Logs

### View Backend Logs (Render):
1. Go to Render Dashboard
2. Click on your service
3. Click "Logs" tab
4. See real-time logs of all requests

### View Frontend Logs (Vercel):
1. Go to Vercel Dashboard
2. Click on your project
3. Click "Deployments"
4. Click on a deployment → "View Function Logs"

---

## 🆘 Troubleshooting

### Problem: "Failed to submit form"
**Solution**: Check if backend is running. Visit:
```
https://employee-form-backend.onrender.com/api/health
```
Should return: `{"status":"OK","message":"Server is running"}`

### Problem: "CORS error"
**Solution**: Make sure you updated CORS settings in Step 5.

### Problem: "Backend is slow on first request"
**Solution**: This is normal for Render free tier. The service spins down after 15 minutes of inactivity. First request wakes it up (takes 30-60 seconds).

### Problem: "CSV download not working"
**Solution**: 
1. Make sure backend URL is correct in frontend code
2. Check browser console for errors (F12)
3. Try direct download: `https://your-backend.onrender.com/api/download-csv`

---

## 🎯 Next Steps

### Option 1: Keep Using CSV (Current Setup)
- Download CSV regularly to backup data
- Simple and works immediately

### Option 2: Upgrade to SharePoint Integration
- Data stored in SharePoint (persistent)
- Multiple users can access
- Requires Azure AD setup (see SETUP_GUIDE.md)

### Option 3: Use a Database
- Add MongoDB/PostgreSQL for persistent storage
- More reliable than CSV
- Requires additional setup

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. View backend logs on Render
3. Check browser console (F12) for frontend errors
4. Verify both services are running

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Backend deployed on Render
- [ ] Backend URL copied
- [ ] Frontend code updated with backend URL
- [ ] Frontend deployed on Vercel
- [ ] CORS updated in backend
- [ ] Download CSV button tested
- [ ] Form submission tested
- [ ] Data download tested

---

**🎉 Congratulations! Your app is now live and accessible from anywhere!**

**Frontend URL**: `https://employee-task-form.vercel.app`  
**Backend URL**: `https://employee-form-backend.onrender.com`  
**Download CSV**: Click button in app or visit `/api/download-csv`

