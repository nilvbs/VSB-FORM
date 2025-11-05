# Multi-Row Task Entry Feature

## ✅ What Changed

The form has been updated to support **adding multiple task rows** with the same employee information!

## 🎯 How It Works

### Step 1: Fill Employee Information (Once)
Fill in these fields:
- Department
- Role Title
- Employee ID
- Level
- Employee Name

### Step 2: Lock Employee Information
Click the **"🔓 Lock Info"** button to lock the employee information.
- The section will turn blue and become read-only
- You can unlock it later if needed by clicking **"🔒 Unlock to Edit"**

### Step 3: Add Task Rows
- Fill in the first task row with all task details
- Click **"➕ Add Task Row"** to add more tasks
- Each task row includes:
  - Task / Activity
  - Detailed Description
  - Frequency (Daily/Weekly/Monthly/Project Based)
  - Time Spent
  - Expected Output
  - Quality Measurement
  - KPIs / Metrics
  - Tools Used
  - Technical Skills
  - Soft Skills
  - Dependencies
  - Challenges Faced
  - Training Needed
  - Suggested Improvements

### Step 4: Remove Rows (Optional)
- Click **"❌ Remove"** on any task row to delete it
- At least one task row is required

### Step 5: Submit All Rows
- Click **"Submit X Rows"** button
- All rows will be saved with the same employee information
- Each row becomes a separate entry in the CSV/SharePoint file

## 📊 Data Storage

### Demo Mode (Current)
- All rows are saved to `server/employee_data.csv`
- Each task row becomes a separate line in the CSV
- All rows share the same employee information

### SharePoint Mode
- All rows are added to the SharePoint Excel file
- Each task row becomes a separate row in the table
- All rows share the same employee information

## 🎨 Visual Features

### Locked Section
- Blue background (#e0f2fe)
- Blue border
- Disabled input fields
- Lock/Unlock button

### Task Rows
- White background with border
- Hover effect (purple border)
- Row number header
- Remove button (for multiple rows)

### Buttons
- **Lock Info**: Purple gradient
- **Unlock to Edit**: Orange
- **Add Task Row**: Green
- **Remove**: Red
- **Submit**: Purple gradient

## 💡 Example Workflow

1. **Employee fills their info once**:
   - Department: Engineering
   - Role: BIM Coordinator
   - ID: EMP001
   - Level: Senior
   - Name: John Doe

2. **Locks the info** (click Lock button)

3. **Adds first task**:
   - Task: 3D Modeling
   - Description: Create detailed Revit models
   - Frequency: Daily
   - Time: 4 hrs
   - ... (fill all fields)

4. **Adds second task** (click Add Task Row):
   - Task: Clash Detection
   - Description: Run Navisworks clash detection
   - Frequency: Weekly
   - Time: 2 hrs
   - ... (fill all fields)

5. **Adds third task** (click Add Task Row):
   - Task: Team Coordination
   - Description: Coordinate with architects
   - Frequency: Daily
   - Time: 1 hr
   - ... (fill all fields)

6. **Submits all 3 rows** (click Submit 3 Rows)

7. **Result**: 3 separate entries in CSV/SharePoint, all with John Doe's employee info

## 🔧 Technical Details

### Frontend Changes
- Split state into `employeeInfo` and `taskRows`
- Added lock/unlock functionality
- Dynamic task row management (add/remove)
- Updated submit to send multiple rows

### Backend Changes
- Updated API to accept `{ rows: [...] }` format
- Backward compatible with single row format
- Saves all rows in one operation
- Returns row count in response

### CSS Changes
- Added `.locked` class for employee section
- Added `.task-row` styling
- Added button styles for lock/unlock/add/remove
- Responsive design maintained

## 📝 Notes

- Employee information must be locked before adding tasks
- At least one task row is required
- All task fields are required
- Form resets completely after successful submission
- Success message shows number of rows saved

## 🚀 Benefits

1. **Efficiency**: Fill employee info once for multiple tasks
2. **Accuracy**: Same employee data across all task entries
3. **Flexibility**: Add as many tasks as needed
4. **User-Friendly**: Clear visual feedback and validation
5. **Data Integrity**: Locked employee info prevents accidental changes

## 📱 Responsive Design

- Works on desktop, tablet, and mobile
- Buttons stack vertically on small screens
- Form fields adapt to screen size
- Touch-friendly buttons and inputs

---

**Enjoy the new multi-row feature!** 🎉

