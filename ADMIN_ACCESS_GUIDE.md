# 🔒 Admin Access Guide

## ⚠️ CONFIDENTIAL - Keep This Secure!

This document contains sensitive information for accessing and downloading employee data.

---

## 🔑 Admin Credentials

### Default Admin Token
```
vsb-admin-2024-secure-token
```

**⚠️ IMPORTANT:** 
- This token is required to access the admin panel and download data
- Keep this token secret and secure
- Only share with authorized personnel
- Change this token in production for better security

---

## 🌐 Access URLs

### Public Form (For All Users)
```
https://vsb-form-dhk8.vercel.app
```
- Users can submit employee task data
- No download button visible
- No access to existing data

### Admin Panel (For You Only)
```
https://vsb-form-dhk8.vercel.app/admin-data-panel
```
- Protected with admin token
- View all submitted data
- Download CSV file
- Refresh data in real-time

---

## 📋 How to Access Admin Panel

### Step 1: Open Admin URL
Navigate to:
```
https://vsb-form-dhk8.vercel.app/admin-data-panel
```

### Step 2: Enter Admin Token
When prompted, enter the admin token:
```
vsb-admin-2024-secure-token
```

### Step 3: Access Features
Once logged in, you can:
- ✅ View all submitted data in a table
- ✅ Download CSV file
- ✅ Refresh data to see latest submissions
- ✅ Stay logged in (token saved in session)

---

## 🔧 Admin Panel Features

### 1. View Data
- See all employee task submissions in a table format
- Scroll horizontally and vertically
- Real-time data count

### 2. Download CSV
- Click "📥 Download CSV" button
- File downloads with current date in filename
- Format: `employee_task_data_YYYY-MM-DD.csv`

### 3. Refresh Data
- Click "🔄 Refresh Data" button
- Loads latest submissions from server
- Updates the table view

### 4. Logout
- Click "Logout" button to clear session
- Requires re-entering token to access again

---

## 🔐 Security Features

### Token Protection
- All download and view endpoints require admin token
- Token can be passed as query parameter or header
- Invalid token returns 403 Forbidden error

### Session Management
- Token stored in browser session (not localStorage)
- Automatically cleared when browser closes
- No persistent storage of credentials

### No Public Access
- Download button removed from public form
- Admin panel URL not linked anywhere
- Only accessible if you know the exact URL

---

## 🛠️ Advanced Usage

### Direct API Access (with Token)

#### Download CSV Directly
```
https://vsb-form.onrender.com/api/download-csv?token=vsb-admin-2024-secure-token
```

#### View Data as JSON
```
https://vsb-form.onrender.com/api/view-data?token=vsb-admin-2024-secure-token
```

### Using cURL (Command Line)
```bash
# Download CSV
curl "https://vsb-form.onrender.com/api/download-csv?token=vsb-admin-2024-secure-token" -o data.csv

# View JSON data
curl "https://vsb-form.onrender.com/api/view-data?token=vsb-admin-2024-secure-token"
```

### Using Postman
1. Create GET request
2. URL: `https://vsb-form.onrender.com/api/download-csv`
3. Add query parameter: `token` = `vsb-admin-2024-secure-token`
4. Send request

---

## 🔄 Changing the Admin Token

For better security, you should change the default token in production.

### Option 1: Environment Variable (Recommended)

1. **On Render Dashboard:**
   - Go to your backend service
   - Navigate to "Environment" tab
   - Add new environment variable:
     - Key: `ADMIN_SECRET_TOKEN`
     - Value: `your-new-secure-token-here`
   - Save and redeploy

2. **Update this document** with the new token

### Option 2: Edit Server Code

1. Open `server/server.js`
2. Find line ~40:
   ```javascript
   const ADMIN_SECRET_TOKEN = process.env.ADMIN_SECRET_TOKEN || 'vsb-admin-2024-secure-token';
   ```
3. Change the default value:
   ```javascript
   const ADMIN_SECRET_TOKEN = process.env.ADMIN_SECRET_TOKEN || 'your-new-token';
   ```
4. Commit and redeploy

---

## 🐛 Troubleshooting

### "Unauthorized" Error
**Problem:** Getting 403 Forbidden error

**Solutions:**
1. Check if token is correct (case-sensitive)
2. Make sure backend is deployed with latest code
3. Clear browser cache and try again
4. Check if environment variable is set correctly on Render

### Admin Panel Not Loading
**Problem:** Page shows 404 or blank screen

**Solutions:**
1. Make sure URL is exactly: `/admin-data-panel`
2. Check if frontend is deployed with latest code
3. Clear browser cache (Ctrl+Shift+Delete)
4. Try in incognito/private window

### "No data available" Message
**Problem:** Admin panel shows no data

**Possible Reasons:**
1. No one has submitted the form yet
2. CSV file doesn't exist on server
3. Backend restarted and lost data (if using file storage)

**Solutions:**
1. Submit a test form first
2. Check backend logs on Render
3. Verify CSV file exists in server directory

### Download Button Not Working
**Problem:** CSV download fails

**Solutions:**
1. Check browser console for errors
2. Verify token is still valid
3. Check if backend is running (test health endpoint)
4. Try direct API URL in browser

---

## 📊 Data Storage

### Current Setup
- Data stored in CSV file: `server/employee_data.csv`
- File persists on Render's disk
- **⚠️ Note:** Render free tier may lose files on restart

### Backup Recommendations
1. Download CSV regularly
2. Set up automated backups
3. Consider upgrading to persistent storage
4. Or migrate to database (MongoDB, PostgreSQL)

---

## ✅ Deployment Checklist

Before sharing with users:

- [ ] Backend deployed on Render with latest code
- [ ] Frontend deployed on Vercel with latest code
- [ ] Admin token is secure and documented
- [ ] Tested admin panel login
- [ ] Tested CSV download
- [ ] Tested data viewing
- [ ] Public form has no download button
- [ ] Admin URL is not publicly shared
- [ ] This guide is stored securely

---

## 📞 Quick Reference

| Item | Value |
|------|-------|
| **Public Form URL** | https://vsb-form-dhk8.vercel.app |
| **Admin Panel URL** | https://vsb-form-dhk8.vercel.app/admin-data-panel |
| **Admin Token** | `vsb-admin-2024-secure-token` |
| **Backend API** | https://vsb-form.onrender.com |
| **Download API** | https://vsb-form.onrender.com/api/download-csv?token=... |
| **View Data API** | https://vsb-form.onrender.com/api/view-data?token=... |

---

## 🎯 Best Practices

1. **Keep Token Secret**
   - Don't share in public channels
   - Don't commit to git
   - Use environment variables

2. **Regular Backups**
   - Download CSV weekly
   - Store in secure location
   - Keep multiple versions

3. **Monitor Access**
   - Check Render logs for unauthorized attempts
   - Change token if compromised
   - Use strong, random tokens in production

4. **Secure Communication**
   - Only share admin URL via secure channels
   - Use password managers for token storage
   - Enable 2FA on Render and Vercel accounts

---

## 🔒 Security Notes

- Admin panel uses session storage (cleared on browser close)
- Token transmitted via HTTPS (encrypted)
- No authentication bypass possible
- Backend validates token on every request
- CORS prevents unauthorized domain access

---

## 📝 Change Log

| Date | Change | By |
|------|--------|-----|
| 2024-11-05 | Initial setup with admin panel | System |
| | Default token: vsb-admin-2024-secure-token | |

---

**Remember:** This is a confidential document. Store it securely and only share with authorized personnel.

