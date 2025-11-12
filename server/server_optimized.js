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
 * Save employee task data - Optimized MongoDB-only version
 * Removed SharePoint and CSV backup for maximum performance
 */
app.post('/api/saveToSharePoint', async (req, res) => {
  console.log('\n=== SAVE REQUEST RECEIVED ===');

  try {
    const { rows } = req.body;
    const dataRows = rows || [req.body];

    console.log(`📥 Processing ${dataRows.length} row(s)...`);

    // Save directly to MongoDB (single operation, no fallbacks)
    const dbResult = await saveMultipleTasksToDatabase(dataRows);

    if (dbResult.success) {
      console.log(`✅ Saved ${dbResult.count} row(s) to MongoDB`);

      return res.json({
        success: true,
        message: `Successfully saved ${dbResult.count} row(s)`,
        rowCount: dbResult.count,
        storage: 'MongoDB'
      });
    } else {
      console.error('❌ MongoDB save failed:', dbResult.error);

      return res.status(500).json({
        success: false,
        error: 'Database save failed: ' + dbResult.error
      });
    }
  } catch (error) {
    console.error('❌ Save error:', error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Download CSV - Optimized direct export from MongoDB
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

    console.log('📥 CSV download requested');

    // Export directly from MongoDB
    const csvResult = await exportTasksAsCSV();

    if (csvResult.success && csvResult.rowCount > 0) {
      console.log(`✅ Exporting ${csvResult.rowCount} rows`);

      const filename = `employee_task_data_${new Date().toISOString().split('T')[0]}.csv`;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(csvResult.csv);
    } else if (csvResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'No data available to export'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: csvResult.error || 'Failed to export data'
      });
    }
  } catch (error) {
    console.error('❌ Download error:', error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * View data - Optimized direct fetch from MongoDB
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

    console.log('📊 View data requested');

    // Fetch directly from MongoDB
    const dbResult = await getAllTasksFromDatabase();

    if (dbResult.success) {
      return res.json({
        success: true,
        data: dbResult.data,
        totalRows: dbResult.count,
        source: 'MongoDB'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: dbResult.error || 'Failed to fetch data'
      });
    }
  } catch (error) {
    console.error('❌ View data error:', error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

/**
 * Start server
 */
app.listen(PORT, async () => {
  console.log('\n========================================');
  console.log('Employee Task Form - Optimized Server');
  console.log('========================================');
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API endpoint: http://localhost:${PORT}/api/saveToSharePoint`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Download CSV: http://localhost:${PORT}/api/download-csv`);
  console.log(`View data: http://localhost:${PORT}/api/view-data`);

  // Check MongoDB connection
  console.log('\n📊 Storage: MongoDB Only (Optimized)');
  const dbAvailable = await isDatabaseAvailable();

  if (dbAvailable) {
    console.log('✅ MongoDB: Connected');
  } else {
    console.log('❌ MongoDB: Not Connected');
    console.log('⚠️  WARNING: Server requires MongoDB to function!');
    console.log('💡 Add MONGODB_URI to environment variables');
  }

  console.log('\n🚀 Optimizations:');
  console.log('   ✅ SharePoint integration removed');
  console.log('   ✅ CSV backup removed');
  console.log('   ✅ Direct MongoDB operations only');
  console.log('   ✅ Faster save and retrieval');
  console.log('========================================\n');
});

