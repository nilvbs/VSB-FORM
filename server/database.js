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
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
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
 * Save multiple task rows to MongoDB
 */
async function saveMultipleTasksToDatabase(taskRows) {
  try {
    const database = await connectToDatabase();
    
    if (!database) {
      return { success: false, error: 'Database not available' };
    }

    const collection = database.collection('tasks');
    
    // Add timestamp to all rows
    const dataWithTimestamps = taskRows.map(row => ({
      ...row,
      submittedAt: new Date(),
      submittedAtISO: new Date().toISOString()
    }));

    const result = await collection.insertMany(dataWithTimestamps);
    
    console.log(`✅ Saved ${result.insertedCount} rows to MongoDB`);
    
    return { 
      success: true, 
      count: result.insertedCount,
      ids: result.insertedIds,
      message: `${result.insertedCount} rows saved to database successfully`
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
 * Get all tasks from MongoDB
 * Sorted by oldest first (oldest at top/beginning)
 */
async function getAllTasksFromDatabase() {
  try {
    const database = await connectToDatabase();

    if (!database) {
      return { success: false, error: 'Database not available' };
    }

    const collection = database.collection('tasks');
    // Sort by submittedAt ascending (oldest first, newest last)
    const tasks = await collection.find({}).sort({ submittedAt: 1 }).toArray();

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

