/**
 * Database Service - MongoDB Atlas Integration
 * Provides persistent storage to prevent data loss
 */

import { MongoClient } from 'mongodb';

let client = null;
let db = null;
let isConnected = false;

/**
 * Connect to MongoDB Atlas
 */
async function connectToDatabase() {
  if (isConnected && db) {
    return db;
  }

  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.log('⚠️  MongoDB URI not configured. Using CSV fallback.');
    return null;
  }

  try {
    console.log('🔄 Connecting to MongoDB Atlas...');

    // MongoDB connection options with TLS/SSL configuration
    const options = {
      tls: true,
      tlsAllowInvalidCertificates: false,
      tlsAllowInvalidHostnames: false,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
    };

    client = new MongoClient(MONGODB_URI, options);
    await client.connect();

    // Verify connection
    await client.db('admin').command({ ping: 1 });

    db = client.db('employee_tasks');
    isConnected = true;

    console.log('✅ Connected to MongoDB Atlas successfully!');
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('⚠️  Falling back to CSV storage');
    return null;
  }
}

/**
 * Save task data to MongoDB
 */
async function saveTaskToDatabase(taskData) {
  try {
    const database = await connectToDatabase();
    
    if (!database) {
      return { success: false, error: 'Database not available' };
    }

    const collection = database.collection('tasks');
    
    // Add timestamp
    const dataWithTimestamp = {
      ...taskData,
      submittedAt: new Date(),
      submittedAtISO: new Date().toISOString()
    };

    const result = await collection.insertOne(dataWithTimestamp);
    
    console.log('✅ Saved to MongoDB:', result.insertedId);
    
    return { 
      success: true, 
      id: result.insertedId,
      message: 'Data saved to database successfully'
    };
  } catch (error) {
    console.error('❌ Error saving to MongoDB:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

/**
 * Save multiple task rows to MongoDB - Optimized
 * Uses bulk insert with ordered:false for better performance
 */
async function saveMultipleTasksToDatabase(taskRows) {
  try {
    const database = await connectToDatabase();

    if (!database) {
      return { success: false, error: 'Database not available' };
    }

    const collection = database.collection('tasks');

    // Add timestamp once for better performance
    const now = new Date();
    const nowISO = now.toISOString();

    // Add timestamp to all rows (optimized)
    const dataWithTimestamps = taskRows.map(row => ({
      ...row,
      submittedAt: now,
      submittedAtISO: nowISO
    }));

    // Bulk insert with ordered:false for better performance
    // If one document fails, others will still be inserted
    const result = await collection.insertMany(dataWithTimestamps, { ordered: false });

    console.log(`✅ Saved ${result.insertedCount} rows to MongoDB`);

    return {
      success: true,
      count: result.insertedCount,
      message: `${result.insertedCount} rows saved successfully`
    };
  } catch (error) {
    console.error('❌ Error saving to MongoDB:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get all tasks from MongoDB - Optimized
 * Sorted by oldest first (oldest at top/beginning)
 * Uses projection to exclude MongoDB _id field for smaller payload
 */
async function getAllTasksFromDatabase() {
  try {
    const database = await connectToDatabase();

    if (!database) {
      return { success: false, error: 'Database not available' };
    }

    const collection = database.collection('tasks');

    // Optimized query with projection (exclude _id for smaller payload)
    // Sort by submittedAt ascending (oldest first, newest last)
    const tasks = await collection
      .find({}, { projection: { _id: 0 } })
      .sort({ submittedAt: 1 })
      .toArray();

    return {
      success: true,
      data: tasks,
      count: tasks.length
    };
  } catch (error) {
    console.error('❌ Error fetching from MongoDB:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Export all tasks as CSV format
 */
async function exportTasksAsCSV() {
  try {
    const result = await getAllTasksFromDatabase();

    if (!result.success || result.data.length === 0) {
      return { success: false, error: 'No data available' };
    }

    // CSV Headers (17 columns - exact field names)
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
      'suggestedImprovements'
    ];

    // Convert data to CSV rows
    const csvRows = result.data.map(task => {
      return [
        task.department || '',
        task.roleTitle || '',
        task.empId || '',
        task.employeeName || '',
        task.taskActivity || '',
        task.detailedDescription || '',
        task.frequency || '',
        task.timeSpent || '',
        task.expectedOutput || '',
        task.qualityMeasurement || '',
        task.toolsUsed || '',
        task.technicalSkills || '',
        task.softSkills || '',
        task.dependencies || '',
        task.challengesFaced || '',
        task.trainingNeeded || '',
        task.suggestedImprovements || ''
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');

    return {
      success: true,
      csv: csvContent,
      rowCount: result.data.length
    };
  } catch (error) {
    console.error('❌ Error exporting CSV:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Check if database is available
 */
async function isDatabaseAvailable() {
  const database = await connectToDatabase();
  return database !== null;
}

/**
 * Close database connection
 */
async function closeDatabaseConnection() {
  if (client) {
    await client.close();
    isConnected = false;
    db = null;
    console.log('🔌 MongoDB connection closed');
  }
}

export {
  connectToDatabase,
  saveTaskToDatabase,
  saveMultipleTasksToDatabase,
  getAllTasksFromDatabase,
  exportTasksAsCSV,
  isDatabaseAvailable,
  closeDatabaseConnection
};

