import { useState } from 'react';
import './EmployeeTaskForm.css';
import API_ENDPOINTS from '../config';
// Multi-row form with locked employee info

const EmployeeTaskForm = () => {
  // Employee Information (filled once and locked)
  const [employeeInfo, setEmployeeInfo] = useState({
    department: '',
    roleTitle: '',
    empId: '',
    level: '',
    employeeName: '',
  });

  const [isEmployeeInfoLocked, setIsEmployeeInfoLocked] = useState(false);

  // Task rows (can add multiple)
  const [taskRows, setTaskRows] = useState([{
    id: Date.now(),
    taskActivity: '',
    detailedDescription: '',
    frequency: '',
    timeSpent: '',
    expectedOutput: '',
    qualityMeasurement: '',
    kpisMetrics: '',
    toolsUsed: '',
    technicalSkills: '',
    softSkills: '',
    dependencies: '',
    challengesFaced: '',
    trainingNeeded: '',
    suggestedImprovements: '',
  }]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

  // Handle employee info change
  const handleEmployeeInfoChange = (e) => {
    const { name, value } = e.target;
    setEmployeeInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Lock employee info after filling
  const lockEmployeeInfo = () => {
    // Validate all employee fields are filled
    if (!employeeInfo.department || !employeeInfo.roleTitle || !employeeInfo.empId || 
        !employeeInfo.level || !employeeInfo.employeeName) {
      setSubmitStatus({ 
        type: 'error', 
        message: 'Please fill all Employee Information fields before locking.' 
      });
      return;
    }
    setIsEmployeeInfoLocked(true);
    setSubmitStatus({ 
      type: 'success', 
      message: 'Employee Information locked. Now add task details below.' 
    });
  };

  // Unlock employee info to edit
  const unlockEmployeeInfo = () => {
    setIsEmployeeInfoLocked(false);
    setSubmitStatus({ type: '', message: '' });
  };

  // Handle task row change
  const handleTaskRowChange = (rowId, fieldName, value) => {
    setTaskRows(prev => prev.map(row => 
      row.id === rowId ? { ...row, [fieldName]: value } : row
    ));
  };

  // Add new task row
  const addTaskRow = () => {
    if (!isEmployeeInfoLocked) {
      setSubmitStatus({ 
        type: 'error', 
        message: 'Please lock Employee Information first before adding tasks.' 
      });
      return;
    }
    setTaskRows(prev => [...prev, {
      id: Date.now(),
      taskActivity: '',
      detailedDescription: '',
      frequency: '',
      timeSpent: '',
      expectedOutput: '',
      qualityMeasurement: '',
      kpisMetrics: '',
      toolsUsed: '',
      technicalSkills: '',
      softSkills: '',
      dependencies: '',
      challengesFaced: '',
      trainingNeeded: '',
      suggestedImprovements: '',
    }]);
    setSubmitStatus({ type: '', message: '' });
  };

  // Remove task row
  const removeTaskRow = (rowId) => {
    if (taskRows.length === 1) {
      setSubmitStatus({ 
        type: 'error', 
        message: 'At least one task row is required.' 
      });
      return;
    }
    setTaskRows(prev => prev.filter(row => row.id !== rowId));
  };

  // Submit all rows
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Only require locking if there are multiple rows
    if (!isEmployeeInfoLocked && taskRows.length > 1) {
      setSubmitStatus({
        type: 'error',
        message: 'Please lock Employee Information before adding multiple task rows.'
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });

    try {
      // Prepare all rows with employee info
      const allRows = taskRows.map(task => ({
        ...employeeInfo,
        ...task
      }));

      // Call the backend API to save all rows
      const response = await fetch(API_ENDPOINTS.saveToSharePoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rows: allRows })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitStatus({
          type: 'success',
          message: `Successfully saved ${taskRows.length} task row(s) to ${result.mode === 'demo' ? 'CSV file' : 'SharePoint'}!`
        });
        
        // Reset everything
        setEmployeeInfo({
          department: '',
          roleTitle: '',
          empId: '',
          level: '',
          employeeName: '',
        });
        setIsEmployeeInfoLocked(false);
        setTaskRows([{
          id: Date.now(),
          taskActivity: '',
          detailedDescription: '',
          frequency: '',
          timeSpent: '',
          expectedOutput: '',
          qualityMeasurement: '',
          kpisMetrics: '',
          toolsUsed: '',
          technicalSkills: '',
          softSkills: '',
          dependencies: '',
          challengesFaced: '',
          trainingNeeded: '',
          suggestedImprovements: '',
        }]);
        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error(result.error || 'Failed to submit form');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus({
        type: 'error',
        message: `Failed to submit form: ${error.message}. Please ensure the backend server is running.`
      });
      // Scroll to top to show error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h1>Employee Task Activity Form</h1>
        <p>Fill employee info once, then add multiple task rows</p>
      </div>

      {submitStatus.message && (
        <div className={`status-message ${submitStatus.type}`}>
          {submitStatus.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="employee-form">
        {/* Employee Information Section */}
        <div className={`form-section ${isEmployeeInfoLocked ? 'locked' : ''}`}>
          <div className="section-header">
            <h2>Employee Information</h2>
            {!isEmployeeInfoLocked ? (
              <button type="button" onClick={lockEmployeeInfo} className="lock-btn">
                🔓 Lock Info to Add Multiple Tasks
              </button>
            ) : (
              <button type="button" onClick={unlockEmployeeInfo} className="unlock-btn">
                🔒 Unlock to Edit
              </button>
            )}
          </div>

          {!isEmployeeInfoLocked && (
            <div className="helper-text">
              💡 <strong>Tip:</strong> Fill employee information, then click "Lock Info" to add multiple task rows. Or just fill one task and submit directly.
            </div>
          )}
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="department">Department *</label>
              <input
                type="text"
                id="department"
                name="department"
                value={employeeInfo.department}
                onChange={handleEmployeeInfoChange}
                disabled={isEmployeeInfoLocked}
                required
                placeholder="Enter department name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="roleTitle">Role Title *</label>
              <input
                type="text"
                id="roleTitle"
                name="roleTitle"
                value={employeeInfo.roleTitle}
                onChange={handleEmployeeInfoChange}
                disabled={isEmployeeInfoLocked}
                required
                placeholder="Enter role title"
              />
            </div>

            <div className="form-group">
              <label htmlFor="empId">Employee ID *</label>
              <input
                type="text"
                id="empId"
                name="empId"
                value={employeeInfo.empId}
                onChange={handleEmployeeInfoChange}
                disabled={isEmployeeInfoLocked}
                required
                placeholder="Enter employee ID"
              />
            </div>

            <div className="form-group">
              <label htmlFor="level">Level *</label>
              <input
                type="text"
                id="level"
                name="level"
                value={employeeInfo.level}
                onChange={handleEmployeeInfoChange}
                disabled={isEmployeeInfoLocked}
                required
                placeholder="Enter level"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="employeeName">Employee Name *</label>
              <input
                type="text"
                id="employeeName"
                name="employeeName"
                value={employeeInfo.employeeName}
                onChange={handleEmployeeInfoChange}
                disabled={isEmployeeInfoLocked}
                required
                placeholder="Enter full name"
              />
            </div>
          </div>
        </div>

        {/* Task Rows Section */}
        <div className="tasks-section">
          <div className="section-header">
            <h2>Task Details ({taskRows.length} row{taskRows.length !== 1 ? 's' : ''})</h2>
            <button type="button" onClick={addTaskRow} className="add-row-btn" disabled={!isEmployeeInfoLocked}>
              ➕ Add Task Row
            </button>
          </div>

          {taskRows.map((row, index) => (
            <div key={row.id} className="task-row">
              <div className="task-row-header">
                <h3>Task #{index + 1}</h3>
                {taskRows.length > 1 && (
                  <button type="button" onClick={() => removeTaskRow(row.id)} className="remove-row-btn">
                    ❌ Remove
                  </button>
                )}
              </div>

              <div className="form-grid">
                {/* Task Activity */}
                <div className="form-group full-width">
                  <label>Task / Activity *</label>
                  <input
                    type="text"
                    value={row.taskActivity}
                    onChange={(e) => handleTaskRowChange(row.id, 'taskActivity', e.target.value)}
                    required
                    placeholder="Enter task or activity"
                  />
                </div>

                {/* Detailed Description */}
                <div className="form-group full-width">
                  <label>Detailed Description of Task *</label>
                  <textarea
                    value={row.detailedDescription}
                    onChange={(e) => handleTaskRowChange(row.id, 'detailedDescription', e.target.value)}
                    required
                    rows="3"
                    placeholder="Provide detailed description"
                  />
                </div>

                {/* Frequency */}
                <div className="form-group">
                  <label>Frequency *</label>
                  <select
                    value={row.frequency}
                    onChange={(e) => handleTaskRowChange(row.id, 'frequency', e.target.value)}
                    required
                  >
                    <option value="">Select frequency</option>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Project Based">Project Based</option>
                  </select>
                </div>

                {/* Time Spent */}
                <div className="form-group">
                  <label>Time Spent per Task *</label>
                  <input
                    type="text"
                    value={row.timeSpent}
                    onChange={(e) => handleTaskRowChange(row.id, 'timeSpent', e.target.value)}
                    required
                    placeholder="e.g., 2 hrs 30 mins"
                  />
                </div>

                {/* Expected Output */}
                <div className="form-group full-width">
                  <label>Expected Output / Deliverable *</label>
                  <textarea
                    value={row.expectedOutput}
                    onChange={(e) => handleTaskRowChange(row.id, 'expectedOutput', e.target.value)}
                    required
                    rows="2"
                    placeholder="Describe expected output"
                  />
                </div>

                {/* Quality Measurement */}
                <div className="form-group full-width">
                  <label>How Quality is Measured *</label>
                  <input
                    type="text"
                    value={row.qualityMeasurement}
                    onChange={(e) => handleTaskRowChange(row.id, 'qualityMeasurement', e.target.value)}
                    required
                    placeholder="Standards/Checklist/Review"
                  />
                </div>

                {/* KPIs / Metrics */}
                <div className="form-group full-width">
                  <label>KPIs / Metrics *</label>
                  <input
                    type="text"
                    value={row.kpisMetrics}
                    onChange={(e) => handleTaskRowChange(row.id, 'kpisMetrics', e.target.value)}
                    required
                    placeholder="Time/Count/Accuracy etc."
                  />
                </div>

                {/* Tools Used */}
                <div className="form-group">
                  <label>Tools Used *</label>
                  <input
                    type="text"
                    value={row.toolsUsed}
                    onChange={(e) => handleTaskRowChange(row.id, 'toolsUsed', e.target.value)}
                    required
                    placeholder="Revit/Navis/etc."
                  />
                </div>

                {/* Technical Skills */}
                <div className="form-group">
                  <label>Technical Skills Used *</label>
                  <input
                    type="text"
                    value={row.technicalSkills}
                    onChange={(e) => handleTaskRowChange(row.id, 'technicalSkills', e.target.value)}
                    required
                    placeholder="Enter technical skills"
                  />
                </div>

                {/* Soft Skills */}
                <div className="form-group full-width">
                  <label>Soft Skills Used *</label>
                  <input
                    type="text"
                    value={row.softSkills}
                    onChange={(e) => handleTaskRowChange(row.id, 'softSkills', e.target.value)}
                    required
                    placeholder="Enter soft skills"
                  />
                </div>

                {/* Dependencies */}
                <div className="form-group full-width">
                  <label>Dependencies *</label>
                  <textarea
                    value={row.dependencies}
                    onChange={(e) => handleTaskRowChange(row.id, 'dependencies', e.target.value)}
                    required
                    rows="2"
                    placeholder="Teams/Inputs Required"
                  />
                </div>

                {/* Challenges Faced */}
                <div className="form-group full-width">
                  <label>Challenges Faced *</label>
                  <textarea
                    value={row.challengesFaced}
                    onChange={(e) => handleTaskRowChange(row.id, 'challengesFaced', e.target.value)}
                    required
                    rows="2"
                    placeholder="Describe challenges"
                  />
                </div>

                {/* Training Needed */}
                <div className="form-group full-width">
                  <label>Training Needed for This Task *</label>
                  <input
                    type="text"
                    value={row.trainingNeeded}
                    onChange={(e) => handleTaskRowChange(row.id, 'trainingNeeded', e.target.value)}
                    required
                    placeholder="Enter training requirements"
                  />
                </div>

                {/* Suggested Improvements */}
                <div className="form-group full-width">
                  <label>Suggested Improvements / Automation *</label>
                  <textarea
                    value={row.suggestedImprovements}
                    onChange={(e) => handleTaskRowChange(row.id, 'suggestedImprovements', e.target.value)}
                    required
                    rows="2"
                    placeholder="Suggest improvements or automation ideas"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting || (taskRows.length > 1 && !isEmployeeInfoLocked)}
          >
            {isSubmitting ? 'Submitting...' : `Submit ${taskRows.length} Row${taskRows.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeTaskForm;

