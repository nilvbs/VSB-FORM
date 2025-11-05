# Quick Setup Guide

## Step 1: Azure AD App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **"New registration"**
4. Fill in:
   - **Name**: Employee Task Form
   - **Supported account types**: Accounts in this organizational directory only
   - **Redirect URI**: Web - `http://localhost:5173`
5. Click **"Register"**

## Step 2: Configure API Permissions

1. In your app registration, go to **"API permissions"**
2. Click **"Add a permission"** > **"Microsoft Graph"** > **"Application permissions"**
3. Add these permissions:
   - `Files.ReadWrite.All`
   - `Sites.ReadWrite.All`
4. Click **"Grant admin consent for [Your Organization]"**

## Step 3: Create Client Secret

1. Go to **"Certificates & secrets"**
2. Click **"New client secret"**
3. Add description: "Employee Form Secret"
4. Set expiry: 24 months (or as per your policy)
5. Click **"Add"**
6. **IMPORTANT**: Copy the secret **Value** immediately (you won't see it again!)

## Step 4: Get Your Credentials

From the app registration **Overview** page, copy:
- **Application (client) ID**
- **Directory (tenant) ID**

## Step 5: Configure the Application

1. Navigate to the `server` folder
2. Create a `.env` file (copy from `.env.example`):

```bash
cd server
copy ..\.env.example .env
```

3. Edit `.env` and fill in your credentials:

```env
AZURE_CLIENT_ID=paste_your_client_id_here
AZURE_CLIENT_SECRET=paste_your_client_secret_here
AZURE_TENANT_ID=paste_your_tenant_id_here
SHAREPOINT_SITE_URL=https://virtualbuildingstudios-my.sharepoint.com
SHAREPOINT_USER_EMAIL=nil.kansara@virtualbuildingstudio.com
SHAREPOINT_FILE_PATH=/EmployeeTaskData.xlsx
SHAREPOINT_WORKSHEET_NAME=Sheet1
```

## Step 6: Prepare SharePoint Excel File

1. Open the SharePoint Excel file at the URL you provided
2. Make sure it has these column headers in the first row:

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Department | Role Title | Emp ID | Level | Employee Name | Task / Activity | Detailed Description of Task | Frequency | Time Spent per Task | Expected Output / Deliverable | How Quality is Measured | KPIs / Metrics | Tools Used | Technical Skills Used | Soft Skills Used | Dependencies | Challenges Faced | Training Needed for This Task | Suggested Improvements / Automation |

3. **Optional but Recommended**: Convert to Table
   - Select all data including headers
   - Go to **Insert** > **Table**
   - Check "My table has headers"
   - Name the table "Table1"

## Step 7: Update Server Configuration

Edit `server/server.js` and update these values if needed:

```javascript
const driveItemPath = '/EmployeeTaskData.xlsx'; // Update to match your file name
const worksheetName = 'Sheet1'; // Update if different
```

## Step 8: Run the Application

### Option 1: Run in Separate Terminals

**Terminal 1 - Backend Server:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Option 2: Use the Start Script (Windows)

```bash
# From the root directory
.\start.bat
```

## Step 9: Access the Application

Open your browser and go to:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

## Troubleshooting

### Issue: "Failed to get access token"
- Verify your Client ID, Client Secret, and Tenant ID are correct
- Make sure the client secret hasn't expired
- Check that API permissions are granted

### Issue: "Cannot find file"
- Verify the file path in `.env` matches your SharePoint file location
- Make sure the user email is correct
- Check file permissions

### Issue: "CORS error"
- Ensure the backend server is running on port 3001
- Check that the frontend is making requests to the correct URL

### Issue: "Cannot add row to worksheet"
- If using a table, make sure it's named "Table1" or update the code
- If not using a table, you may need to modify the API endpoint in `server.js`

## Testing

1. Fill out the form with test data
2. Click "Submit Form"
3. Check for success message
4. Verify data appears in your SharePoint Excel file

## Next Steps

- Customize the form fields if needed
- Add additional validation
- Style the form to match your branding
- Set up production deployment

## Support

For issues, check:
1. Browser console for frontend errors
2. Server terminal for backend errors
3. Azure AD app permissions
4. SharePoint file permissions

