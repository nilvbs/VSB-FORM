import { PublicClientApplication } from '@azure/msal-browser';
import { Client } from '@microsoft/microsoft-graph-client';

// MSAL configuration
const msalConfig = {
  auth: {
    clientId: 'YOUR_CLIENT_ID', // Replace with your Azure AD App Client ID
    authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID', // Replace with your Tenant ID
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

// Initialize MSAL
const msalInstance = new PublicClientApplication(msalConfig);

// Request scopes
const loginRequest = {
  scopes: ['Files.ReadWrite', 'Sites.ReadWrite.All'],
};

/**
 * Get authenticated Graph client
 */
async function getAuthenticatedClient() {
  try {
    // Try to acquire token silently
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length === 0) {
      // No accounts, need to login
      await msalInstance.loginPopup(loginRequest);
    }

    const account = msalInstance.getAllAccounts()[0];
    const response = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account: account,
    });

    // Create Graph client
    const client = Client.init({
      authProvider: (done) => {
        done(null, response.accessToken);
      },
    });

    return client;
  } catch (error) {
    console.error('Error getting authenticated client:', error);
    // If silent token acquisition fails, try interactive
    try {
      const response = await msalInstance.acquireTokenPopup(loginRequest);
      const client = Client.init({
        authProvider: (done) => {
          done(null, response.accessToken);
        },
      });
      return client;
    } catch (interactiveError) {
      console.error('Interactive token acquisition failed:', interactiveError);
      throw interactiveError;
    }
  }
}

/**
 * Parse SharePoint URL to get site and file information
 */
function parseSharePointUrl(url) {
  // Extract the file ID or path from the SharePoint URL
  // This is a simplified version - you may need to adjust based on your URL structure
  const urlObj = new URL(url);
  const pathParts = urlObj.pathname.split('/');
  
  // For OneDrive for Business URLs
  const siteId = 'virtualbuildingstudios-my.sharepoint.com';
  const driveId = 'b10000000000000000000000000000000'; // You'll need to get this
  
  return { siteId, driveId };
}

/**
 * Save form data to SharePoint Excel file
 */
export async function saveToSharePoint(formData) {
  try {
    const client = await getAuthenticatedClient();
    
    // SharePoint file details
    const fileUrl = 'https://virtualbuildingstudios-my.sharepoint.com/:x:/g/personal/nil_kansara_virtualbuildingstudio_com/EedvFCKc_mZKtv0IJqr1kp8BcBifLE0BWgFu9B6Ar4oh9Q';
    
    // For Excel files in SharePoint, we need to use the Excel API
    // First, get the drive item ID
    const driveItemPath = '/personal/nil_kansara_virtualbuildingstudio_com/Documents/YourFileName.xlsx';
    
    // Prepare the row data in the order of columns
    const rowData = [
      formData.department,
      formData.roleTitle,
      formData.empId,
      formData.level,
      formData.employeeName,
      formData.taskActivity,
      formData.detailedDescription,
      formData.frequency,
      formData.timeSpent,
      formData.expectedOutput,
      formData.qualityMeasurement,
      formData.kpisMetrics,
      formData.toolsUsed,
      formData.technicalSkills,
      formData.softSkills,
      formData.dependencies,
      formData.challengesFaced,
      formData.trainingNeeded,
      formData.suggestedImprovements,
    ];

    // Add row to Excel table
    // Note: You'll need to replace 'Sheet1' with your actual sheet name
    // and 'Table1' with your actual table name if you're using a table
    const response = await client
      .api(`/me/drive/root:${driveItemPath}:/workbook/worksheets/Sheet1/tables/Table1/rows/add`)
      .post({
        values: [rowData],
      });

    return { success: true, data: response };
  } catch (error) {
    console.error('Error saving to SharePoint:', error);
    throw error;
  }
}

/**
 * Alternative method: Save as CSV and upload to SharePoint
 */
export async function saveAsCSVToSharePoint(formData) {
  try {
    const client = await getAuthenticatedClient();
    
    // Convert form data to CSV row
    const csvRow = [
      formData.department,
      formData.roleTitle,
      formData.empId,
      formData.level,
      formData.employeeName,
      formData.taskActivity,
      formData.detailedDescription,
      formData.frequency,
      formData.timeSpent,
      formData.expectedOutput,
      formData.qualityMeasurement,
      formData.kpisMetrics,
      formData.toolsUsed,
      formData.technicalSkills,
      formData.softSkills,
      formData.dependencies,
      formData.challengesFaced,
      formData.trainingNeeded,
      formData.suggestedImprovements,
    ].map(field => `"${field}"`).join(',');

    // Read existing file
    const filePath = '/personal/nil_kansara_virtualbuildingstudio_com/Documents/EmployeeData.csv';
    
    let existingContent = '';
    try {
      const fileContent = await client
        .api(`/me/drive/root:${filePath}:/content`)
        .get();
      existingContent = fileContent;
    } catch (error) {
      // File doesn't exist, create header
      const headers = [
        'Department',
        'Role Title',
        'Emp ID',
        'Level',
        'Employee Name',
        'Task / Activity',
        'Detailed Description of Task',
        'Frequency',
        'Time Spent per Task',
        'Expected Output / Deliverable',
        'How Quality is Measured',
        'KPIs / Metrics',
        'Tools Used',
        'Technical Skills Used',
        'Soft Skills Used',
        'Dependencies',
        'Challenges Faced',
        'Training Needed for This Task',
        'Suggested Improvements / Automation',
      ].map(h => `"${h}"`).join(',');
      existingContent = headers + '\n';
    }

    // Append new row
    const newContent = existingContent + csvRow + '\n';

    // Upload updated file
    await client
      .api(`/me/drive/root:${filePath}:/content`)
      .put(newContent);

    return { success: true };
  } catch (error) {
    console.error('Error saving CSV to SharePoint:', error);
    throw error;
  }
}

export { msalInstance, loginRequest };

