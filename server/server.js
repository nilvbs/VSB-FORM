import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// CORS configuration - Allow requests from frontend
app.use(cors({
  origin: [
    'http://localhost:5173',  // Local development
    'https://vsb-form-dhk8.vercel.app',  // Production frontend
    /https:\/\/.*\.vercel\.app$/  // All Vercel preview deployments
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Load environment variables (if .env file exists)
let SHAREPOINT_CONFIG = {
  siteUrl: process.env.SHAREPOINT_SITE_URL || 'https://virtualbuildingstudios-my.sharepoint.com',
  clientId: process.env.AZURE_CLIENT_ID || 'YOUR_CLIENT_ID',
  clientSecret: process.env.AZURE_CLIENT_SECRET || 'YOUR_CLIENT_SECRET',
  tenantId: process.env.AZURE_TENANT_ID || 'YOUR_TENANT_ID',
  userEmail: process.env.SHAREPOINT_USER_EMAIL || 'nil.kansara@virtualbuildingstudio.com',
  filePath: process.env.SHAREPOINT_FILE_PATH || '/EmployeeTaskData.xlsx',
  worksheetName: process.env.SHAREPOINT_WORKSHEET_NAME || 'Sheet1',
};

// Check if running in demo mode (no Azure credentials configured)
const isDemoMode = SHAREPOINT_CONFIG.clientId === 'YOUR_CLIENT_ID';

/**
 * Get access token for SharePoint
 */
async function getAccessToken() {
  const tokenEndpoint = `https://login.microsoftonline.com/${SHAREPOINT_CONFIG.tenantId}/oauth2/v2.0/token`;
  
  const params = new URLSearchParams({
    client_id: SHAREPOINT_CONFIG.clientId,
    client_secret: SHAREPOINT_CONFIG.clientSecret,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials',
  });

  try {
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

/**
 * Save data to local CSV file (Demo Mode)
 */
function saveToLocalCSV(formData) {
  const csvFilePath = join(__dirname, 'employee_data.csv');

  // Prepare CSV row
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

  // Escape CSV fields
  const escapedRow = rowData.map(field => {
    const stringField = String(field || '');
    if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
      return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
  }).join(',');

  // Check if file exists
  let csvContent = '';
  if (existsSync(csvFilePath)) {
    csvContent = readFileSync(csvFilePath, 'utf-8');
  } else {
    // Create header
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
    ].join(',');
    csvContent = headers + '\n';
  }

  // Append new row
  csvContent += escapedRow + '\n';

  // Try to write, with retry logic for locked files
  let retries = 3;
  let lastError;

  while (retries > 0) {
    try {
      writeFileSync(csvFilePath, csvContent, 'utf-8');
      console.log(`✓ Successfully saved to: ${csvFilePath}`);
      return csvFilePath;
    } catch (error) {
      lastError = error;
      if (error.code === 'EBUSY' || error.code === 'EPERM') {
        console.log(`⚠ File is locked, retrying... (${retries} attempts left)`);
        retries--;
        // Wait a bit before retrying
        const waitTime = 500; // 500ms
        const start = Date.now();
        while (Date.now() - start < waitTime) {
          // Busy wait
        }
      } else {
        throw error; // Different error, throw immediately
      }
    }
  }

  // If all retries failed, save to a backup file with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFilePath = join(__dirname, `employee_data_${timestamp}.csv`);

  try {
    writeFileSync(backupFilePath, csvContent, 'utf-8');
    console.log(`⚠ Main file is locked. Saved to backup: ${backupFilePath}`);
    return backupFilePath;
  } catch (backupError) {
    throw new Error(`Cannot save to CSV file. Main file is locked and backup also failed. Please close the file if you have it open in Excel. Original error: ${lastError.message}`);
  }
}

/**
 * Save data to SharePoint Excel file
 */
app.post('/api/saveToSharePoint', async (req, res) => {
  console.log('\n=== NEW REQUEST RECEIVED ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));

  try {
    const { rows } = req.body;

    // Support both single row (old format) and multiple rows (new format)
    const dataRows = rows || [req.body];
    console.log('Processed dataRows:', dataRows.length, 'rows');

    // If in demo mode, save to local CSV
    if (isDemoMode) {
      console.log(`Running in DEMO MODE - saving ${dataRows.length} row(s) to local CSV file`);
      console.log('Data received:', JSON.stringify(dataRows, null, 2));

      // Save all rows
      for (const formData of dataRows) {
        console.log('Saving row:', formData);
        saveToLocalCSV(formData);
      }

      return res.json({
        success: true,
        mode: 'demo',
        message: `${dataRows.length} row(s) saved to local CSV file (Demo Mode)`,
        rowCount: dataRows.length
      });
    }

    // Get access token
    const accessToken = await getAccessToken();

    // Prepare all rows data
    const allRowsData = dataRows.map(formData => [
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
    ]);

    // Add rows to Excel file
    const driveItemPath = SHAREPOINT_CONFIG.filePath;
    const worksheetName = SHAREPOINT_CONFIG.worksheetName;

    // Try to append to table
    const appendUrl = `https://graph.microsoft.com/v1.0/users/${SHAREPOINT_CONFIG.userEmail}/drive/root:${driveItemPath}:/workbook/worksheets/${worksheetName}/tables/Table1/rows/add`;

    const response = await fetch(appendUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: allRowsData,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SharePoint API error:', errorText);
      throw new Error(`SharePoint API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    res.json({ success: true, mode: 'sharepoint', data: result, rowCount: dataRows.length });
  } catch (error) {
    console.error('Error saving to SharePoint:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: 'Failed to save data to SharePoint. Please check server logs and configuration.'
    });
  }
});

/**
 * Alternative endpoint: Save as CSV
 */
app.post('/api/saveAsCSV', async (req, res) => {
  try {
    const formData = req.body;
    
    // Convert to CSV format
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
    ].map(field => `"${field.replace(/"/g, '""')}"`).join(',');

    // For now, just return the CSV data
    // You can implement actual file upload to SharePoint here
    res.json({ 
      success: true, 
      csvData: csvRow,
      message: 'CSV data generated successfully' 
    });
  } catch (error) {
    console.error('Error generating CSV:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

/**
 * Download CSV endpoint
 */
app.get('/api/download-csv', (req, res) => {
  const csvFilePath = join(__dirname, 'employee_data.csv');

  // Check if file exists
  if (!existsSync(csvFilePath)) {
    return res.status(404).json({
      success: false,
      error: 'No data available yet. Please submit some data first.'
    });
  }

  // Send file for download
  res.download(csvFilePath, 'employee_task_data.csv', (err) => {
    if (err) {
      console.error('Error downloading file:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to download file'
      });
    }
  });
});

/**
 * Get CSV data as JSON (for viewing in browser)
 */
app.get('/api/view-data', (req, res) => {
  const csvFilePath = join(__dirname, 'employee_data.csv');

  // Check if file exists
  if (!existsSync(csvFilePath)) {
    return res.json({
      success: true,
      data: [],
      message: 'No data available yet.'
    });
  }

  try {
    const csvContent = readFileSync(csvFilePath, 'utf-8');
    const lines = csvContent.trim().split('\n');

    if (lines.length <= 1) {
      return res.json({
        success: true,
        data: [],
        message: 'No data rows yet, only headers.'
      });
    }

    // Parse CSV (simple parsing, doesn't handle quoted commas)
    const headers = lines[0].split(',');
    const data = lines.slice(1).filter(line => line.trim()).map(line => {
      const values = line.split(',');
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });

    res.json({
      success: true,
      data: data,
      totalRows: data.length
    });
  } catch (error) {
    console.error('Error reading CSV:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to read data'
    });
  }
});

app.listen(PORT, () => {
  console.log('\n========================================');
  console.log('Employee Task Form - Backend Server');
  console.log('========================================');
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`API endpoint: http://localhost:${PORT}/api/saveToSharePoint`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);

  if (isDemoMode) {
    console.log('\n⚠️  RUNNING IN DEMO MODE');
    console.log('Data will be saved to local CSV file: server/employee_data.csv');
    console.log('To enable SharePoint integration, configure Azure AD credentials in server/.env');
  } else {
    console.log('\n✓ SharePoint integration enabled');
    console.log(`Target: ${SHAREPOINT_CONFIG.userEmail}`);
    console.log(`File: ${SHAREPOINT_CONFIG.filePath}`);
  }

  console.log('========================================\n');
});

