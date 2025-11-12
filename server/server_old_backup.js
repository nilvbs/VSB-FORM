import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import database service
import {
  saveMultipleTasksToDatabase,
  getAllTasksFromDatabase,
  exportTasksAsCSV,
  isDatabaseAvailable
} from './database.js';

dotenv.config();

const app = express();
const PORT = 3001;

// Admin token for protected endpoints
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'vsb-admin-2024-secure-token';

app.use(cors());
app.use(express.json());

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

  // Prepare CSV row (17 columns - Level removed)
  const rowData = [
    formData.department,
    formData.roleTitle,
    formData.empId,
    formData.employeeName,
    formData.taskActivity,
    formData.detailedDescription,
    formData.frequency,
    formData.timeSpent,
    formData.expectedOutput,
    formData.qualityMeasurement || '',
    formData.toolsUsed,
    formData.technicalSkills,
    formData.softSkills || '',
    formData.dependencies,
    formData.challengesFaced || '',
    formData.trainingNeeded || '',
    formData.suggestedImprovements || '',
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
    // Create header (17 columns - exact field names)
    const headers = [
      'department',
      'roleTitle',
      'empId',
      'employeeName',
      'taskActivity',
      'detailedDescription',
      'frequency',
      'timeSpent',
      'expectedOutput',
      'qualityMeasurement',
      'toolsUsed',
      'technicalSkills',
      'softSkills',
      'dependencies',
      'challengesFaced',
      'trainingNeeded',
      'suggestedImprovements',
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

    // STRATEGY: Save to MongoDB first (persistent), then CSV as backup
    let dbResult = null;
    let csvSaved = false;

    // Try to save to MongoDB (persistent storage)
    try {
      console.log('💾 Attempting to save to MongoDB...');
      dbResult = await saveMultipleTasksToDatabase(dataRows);

      if (dbResult.success) {
        console.log(`✅ Successfully saved ${dbResult.count} rows to MongoDB (PERSISTENT)`);
      } else {
        console.log('⚠️  MongoDB save failed:', dbResult.error);
      }
    } catch (dbError) {
      console.log('⚠️  MongoDB error:', dbError.message);
    }

    // Also save to CSV as backup (will be lost on restart, but good for immediate download)
    try {
      console.log('📄 Saving to CSV as backup...');
      for (const formData of dataRows) {
        saveToLocalCSV(formData);
      }
      csvSaved = true;
      console.log('✅ CSV backup saved');
    } catch (csvError) {
      console.log('⚠️  CSV backup failed:', csvError.message);
    }

    // If in demo mode (no SharePoint), return after saving to DB and CSV
    if (isDemoMode) {
      const savedTo = [];
      if (dbResult && dbResult.success) savedTo.push('MongoDB (persistent)');
      if (csvSaved) savedTo.push('CSV (backup)');

      if (savedTo.length === 0) {
        return res.status(500).json({
          success: false,
          error: 'Failed to save data to any storage'
        });
      }

      return res.json({
        success: true,
        mode: 'demo',
        message: `✅ ${dataRows.length} row(s) saved to: ${savedTo.join(' + ')}`,
        rowCount: dataRows.length,
        storage: savedTo,
        persistent: dbResult && dbResult.success
      });
    }

    // Get access token
    const accessToken = await getAccessToken();

    // Prepare all rows data (17 columns - Level removed)
    const allRowsData = dataRows.map(formData => [
      formData.department,
      formData.roleTitle,
      formData.empId,
      formData.employeeName,
      formData.taskActivity,
      formData.detailedDescription,
      formData.frequency,
      formData.timeSpent,
      formData.expectedOutput,
      formData.qualityMeasurement || '',
      formData.toolsUsed,
      formData.technicalSkills,
      formData.softSkills || '',
      formData.dependencies,
      formData.challengesFaced || '',
      formData.trainingNeeded || '',
      formData.suggestedImprovements || '',
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
 * Download CSV endpoint - Fetches from MongoDB (persistent) or CSV (backup)
 * Requires admin token authentication
 */
app.get('/api/download-csv', async (req, res) => {
  try {
    // Check admin token
    const token = req.headers['x-admin-token'] || req.query.token;
    if (token !== ADMIN_TOKEN) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized. Admin token required.'
      });
    }

    console.log('📥 Download CSV requested (authenticated)');

    // Try to get data from MongoDB first (persistent storage)
    const dbAvailable = await isDatabaseAvailable();

    if (dbAvailable) {
      console.log('💾 Fetching data from MongoDB...');
      const csvResult = await exportTasksAsCSV();

      if (csvResult.success && csvResult.rowCount > 0) {
        console.log(`✅ Exporting ${csvResult.rowCount} rows from MongoDB`);

        // Send CSV content as download
        const filename = `employee_task_data_${new Date().toISOString().split('T')[0]}.csv`;
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.send(csvResult.csv);
      } else {
        console.log('⚠️  No data in MongoDB, trying CSV backup...');
      }
    }

    // Fallback to local CSV file
    const csvFilePath = join(__dirname, 'employee_data.csv');

    if (!existsSync(csvFilePath)) {
      return res.status(404).json({
        success: false,
        error: 'No data available yet. Please submit some data first.'
      });
    }

    console.log('📄 Sending CSV backup file');
    res.download(csvFilePath, 'employee_task_data.csv', (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(500).json({
          success: false,
          error: 'Failed to download file'
        });
      }
    });
  } catch (error) {
    console.error('❌ Error in download-csv:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get CSV data as JSON (for viewing in browser) - From MongoDB (persistent) or CSV (backup)
 * Requires admin token authentication
 */
app.get('/api/view-data', async (req, res) => {
  try {
    // Check admin token
    const token = req.headers['x-admin-token'] || req.query.token;
    if (token !== ADMIN_TOKEN) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized. Admin token required.'
      });
    }

    console.log('📊 View data requested (authenticated)');

    // Try to get data from MongoDB first (persistent storage)
    const dbAvailable = await isDatabaseAvailable();

    if (dbAvailable) {
      console.log('💾 Fetching data from MongoDB...');
      const dbResult = await getAllTasksFromDatabase();

      if (dbResult.success) {
        return res.json({
          success: true,
          data: dbResult.data,
          totalRows: dbResult.count,
          source: 'MongoDB (persistent)'
        });
      }
    }

    // Fallback to CSV
    const csvFilePath = join(__dirname, 'employee_data.csv');

    if (!existsSync(csvFilePath)) {
      return res.json({
        success: true,
        data: [],
        message: 'No data available yet.',
        source: 'none'
      });
    }

    const csvContent = readFileSync(csvFilePath, 'utf-8');
    const lines = csvContent.trim().split('\n');

    if (lines.length <= 1) {
      return res.json({
        success: true,
        data: [],
        message: 'No data rows yet, only headers.',
        source: 'CSV (backup)'
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
      totalRows: data.length,
      source: 'CSV (backup - may be lost on restart)'
    });
  } catch (error) {
    console.error('Error reading data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to read data'
    });
  }
});

app.listen(PORT, async () => {
  console.log('\n========================================');
  console.log('Employee Task Form - Backend Server');
  console.log('========================================');
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`API endpoint: http://localhost:${PORT}/api/saveToSharePoint`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Download CSV: http://localhost:${PORT}/api/download-csv`);

  // Check MongoDB connection
  console.log('\n📊 Storage Configuration:');
  const dbAvailable = await isDatabaseAvailable();

  if (dbAvailable) {
    console.log('✅ MongoDB Atlas: CONNECTED (Persistent storage - no data loss!)');
    const dbData = await getAllTasksFromDatabase();
    if (dbData.success) {
      console.log(`   📦 Current records in database: ${dbData.count}`);
    }
  } else {
    console.log('⚠️  MongoDB Atlas: NOT CONFIGURED');
    console.log('   ⚠️  WARNING: CSV storage is EPHEMERAL (data will be lost on restart!)');
    console.log('   💡 To enable persistent storage, add MONGODB_URI to server/.env');
  }

  if (isDemoMode) {
    console.log('\n⚠️  RUNNING IN DEMO MODE');
    console.log('CSV backup: server/employee_data.csv (ephemeral - for immediate download only)');
    console.log('To enable SharePoint integration, configure Azure AD credentials in server/.env');
  } else {
    console.log('\n✓ SharePoint integration enabled');
    console.log(`Target: ${SHAREPOINT_CONFIG.userEmail}`);
    console.log(`File: ${SHAREPOINT_CONFIG.filePath}`);
  }

  console.log('========================================\n');
});

