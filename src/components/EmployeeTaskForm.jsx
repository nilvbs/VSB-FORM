import { useState } from 'react';
import './EmployeeTaskForm.css';
import API_ENDPOINTS from '../config';
// Step-by-step form: Step 1 (Employee Info) → Step 2 (Add Tasks) → Submit

const EmployeeTaskForm = () => {
  // Tooltip message for mandatory fields
  const tooltipMessage = "If a mandatory field is not applicable, please enter 'NA' in the cell.";

  // Current step (1 = Employee Info, 2 = Task Details)
  const [currentStep, setCurrentStep] = useState(1);

  // Employee Information (filled in Step 1)
  const [employeeInfo, setEmployeeInfo] = useState({
    department: '',
    roleTitle: '',
    empId: '',
    employeeName: '',
  });

  // Task rows (can add multiple in Step 2)
  const [taskRows, setTaskRows] = useState([{
    id: Date.now(),
    taskActivity: '',
    detailedDescription: '',
    frequency: '',
    timeSpent: '',
    expectedOutput: '',
    qualityMeasurement: '',
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

  // Go to next step (Step 2: Task Details)
  const goToStep2 = () => {
    // Validate all employee fields are filled
    if (!employeeInfo.department || !employeeInfo.roleTitle || !employeeInfo.empId ||
        !employeeInfo.employeeName) {
      setSubmitStatus({
        type: 'error',
        message: 'Please fill all Employee Information fields before proceeding.'
      });
      return;
    }
    setCurrentStep(2);
    setSubmitStatus({ type: '', message: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Go back to Step 1
  const goBackToStep1 = () => {
    setCurrentStep(1);
    setSubmitStatus({ type: '', message: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle task row change
  const handleTaskRowChange = (rowId, fieldName, value) => {
    setTaskRows(prev => prev.map(row => 
      row.id === rowId ? { ...row, [fieldName]: value } : row
    ));
  };

  // Add new task row
  const addTaskRow = () => {
    setTaskRows(prev => [...prev, {
      id: Date.now(),
      taskActivity: '',
      detailedDescription: '',
      frequency: '',
      timeSpent: '',
      expectedOutput: '',
      qualityMeasurement: '',
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

        // Reset everything and go back to Step 1
        setEmployeeInfo({
          department: '',
          roleTitle: '',
          empId: '',
          level: '',
          employeeName: '',
        });
        setCurrentStep(1);
        setTaskRows([{
          id: Date.now(),
          taskActivity: '',
          detailedDescription: '',
          frequency: '',
          timeSpent: '',
          expectedOutput: '',
          toolsUsed: '',
          technicalSkills: '',
          dependencies: '',
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
        <p>Complete the form in 2 simple steps</p>
      </div>

      {/* Step Indicator */}
      <div className="step-indicator">
        <div className={`step ${currentStep === 1 ? 'active' : 'completed'}`}>
          <div className="step-number">{currentStep === 1 ? '1' : '✓'}</div>
          <div className="step-label">Employee Info</div>
        </div>
        <div className="step-line"></div>
        <div className={`step ${currentStep === 2 ? 'active' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-label">Task Details</div>
        </div>
      </div>

      {submitStatus.message && (
        <div className={`status-message ${submitStatus.type}`}>
          {submitStatus.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="employee-form">
        {/* STEP 1: Employee Information */}
        {currentStep === 1 && (
          <div className="form-section">
            <div className="section-header">
              <h2>Step 1: Employee Information</h2>
            </div>

            <div className="helper-text">
              💡 Fill in your employee details to get started
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="department">
                  Department *
                  <span className="tooltip-icon" title={tooltipMessage}>ℹ️</span>
                </label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={employeeInfo.department}
                  onChange={handleEmployeeInfoChange}
                  required
                  placeholder="Enter department name or 'NA'"
                />
              </div>

              <div className="form-group">
                <label htmlFor="roleTitle">
                  Role Title *
                  <span className="tooltip-icon" title={tooltipMessage}>ℹ️</span>
                </label>
                <input
                  type="text"
                  id="roleTitle"
                  name="roleTitle"
                  value={employeeInfo.roleTitle}
                  onChange={handleEmployeeInfoChange}
                  required
                  placeholder="Enter role title or 'NA'"
                />
              </div>

              <div className="form-group">
                <label htmlFor="empId">
                  Employee ID *
                  <span className="tooltip-icon" title={tooltipMessage}>ℹ️</span>
                </label>
                <input
                  type="text"
                  id="empId"
                  name="empId"
                  value={employeeInfo.empId}
                  onChange={handleEmployeeInfoChange}
                  required
                  placeholder="Enter employee ID or 'NA'"
                />
              </div>

              <div className="form-group">
                <label htmlFor="employeeName">
                  Employee Name *
                  <span className="tooltip-icon" title={tooltipMessage}>ℹ️</span>
                </label>
                <input
                  type="text"
                  id="employeeName"
                  name="employeeName"
                  value={employeeInfo.employeeName}
                  onChange={handleEmployeeInfoChange}
                  required
                  placeholder="Enter full name or 'NA'"
                />
              </div>
            </div>

            {/* Next Button */}
            <div className="form-actions">
              <button type="button" onClick={goToStep2} className="next-btn">
                Next: Add Task Details →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Task Details */}
        {currentStep === 2 && (
          <div className="tasks-section">
            <div className="section-header">
              <h2>Step 2: Task Details ({taskRows.length} row{taskRows.length !== 1 ? 's' : ''})</h2>
              <button type="button" onClick={addTaskRow} className="add-row-btn">
                ➕ Add Task Row
              </button>
            </div>

            <div className="helper-text">
              💡 Add one or more tasks. You can add multiple task rows for the same employee.
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
                    <label>
                      Task / Activity *
                      <span className="tooltip-icon" title={tooltipMessage}>ℹ️</span>
                    </label>
                    <input
                      type="text"
                      value={row.taskActivity}
                      onChange={(e) => handleTaskRowChange(row.id, 'taskActivity', e.target.value)}
                      required
                      placeholder="Enter task or activity or 'NA'"
                    />
                  </div>

                  {/* Detailed Description */}
                  <div className="form-group full-width">
                    <label>
                      Detailed Description of Task *
                      <span className="tooltip-icon" title={tooltipMessage}>ℹ️</span>
                    </label>
                    <textarea
                      value={row.detailedDescription}
                      onChange={(e) => handleTaskRowChange(row.id, 'detailedDescription', e.target.value)}
                      required
                      rows="3"
                      placeholder="Provide detailed description or 'NA'"
                    />
                  </div>

                  {/* Frequency */}
                  <div className="form-group">
                    <label>
                      Frequency *
                      <span className="tooltip-icon" title={tooltipMessage}>ℹ️</span>
                    </label>
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
                      <option value="NA">NA</option>
                    </select>
                  </div>

                  {/* Time Spent */}
                  <div className="form-group">
                    <label>
                      Time Spent per Task *
                      <span className="tooltip-icon" title={tooltipMessage}>ℹ️</span>
                    </label>
                    <input
                      type="text"
                      value={row.timeSpent}
                      onChange={(e) => handleTaskRowChange(row.id, 'timeSpent', e.target.value)}
                      required
                      placeholder="e.g., 2 hrs 30 mins or 'NA'"
                    />
                  </div>

                  {/* Expected Output */}
                  <div className="form-group full-width">
                    <label>
                      Expected Output / Deliverable *
                      <span className="tooltip-icon" title={tooltipMessage}>ℹ️</span>
                    </label>
                    <textarea
                      value={row.expectedOutput}
                      onChange={(e) => handleTaskRowChange(row.id, 'expectedOutput', e.target.value)}
                      required
                      rows="2"
                      placeholder="Describe expected output or 'NA'"
                    />
                  </div>

                  {/* Quality Measurement - OPTIONAL */}
                  <div className="form-group full-width">
                    <label>How Quality is Measured (Standards/Checklist/Review)</label>
                    <input
                      type="text"
                      value={row.qualityMeasurement}
                      onChange={(e) => handleTaskRowChange(row.id, 'qualityMeasurement', e.target.value)}
                      placeholder="Optional - Enter quality measurement method"
                    />
                  </div>

                  {/* Tools Used */}
                  <div className="form-group">
                    <label>
                      Tools Used *
                      <span className="tooltip-icon" title={tooltipMessage}>ℹ️</span>
                    </label>
                    <input
                      type="text"
                      value={row.toolsUsed}
                      onChange={(e) => handleTaskRowChange(row.id, 'toolsUsed', e.target.value)}
                      required
                      placeholder="Revit/Navis/etc. or 'NA'"
                    />
                  </div>

                  {/* Technical Skills */}
                  <div className="form-group">
                    <label>
                      Technical Skills Used *
                      <span className="tooltip-icon" title={tooltipMessage}>ℹ️</span>
                    </label>
                    <input
                      type="text"
                      value={row.technicalSkills}
                      onChange={(e) => handleTaskRowChange(row.id, 'technicalSkills', e.target.value)}
                      required
                      placeholder="Enter technical skills or 'NA'"
                    />
                  </div>

                  {/* Soft Skills - OPTIONAL */}
                  <div className="form-group full-width">
                    <label>Soft Skills Used</label>
                    <input
                      type="text"
                      value={row.softSkills}
                      onChange={(e) => handleTaskRowChange(row.id, 'softSkills', e.target.value)}
                      placeholder="Optional - Enter soft skills"
                    />
                  </div>

                  {/* Dependencies */}
                  <div className="form-group full-width">
                    <label>
                      Dependencies *
                      <span className="tooltip-icon" title={tooltipMessage}>ℹ️</span>
                    </label>
                    <textarea
                      value={row.dependencies}
                      onChange={(e) => handleTaskRowChange(row.id, 'dependencies', e.target.value)}
                      required
                      rows="2"
                      placeholder="Teams/Inputs Required or 'NA'"
                    />
                  </div>

                  {/* Challenges Faced - OPTIONAL */}
                  <div className="form-group full-width">
                    <label>Challenges Faced</label>
                    <textarea
                      value={row.challengesFaced}
                      onChange={(e) => handleTaskRowChange(row.id, 'challengesFaced', e.target.value)}
                      rows="2"
                      placeholder="Optional - Describe challenges"
                    />
                  </div>

                  {/* Training Needed - OPTIONAL */}
                  <div className="form-group full-width">
                    <label>Training Needed for This Task</label>
                    <input
                      type="text"
                      value={row.trainingNeeded}
                      onChange={(e) => handleTaskRowChange(row.id, 'trainingNeeded', e.target.value)}
                      placeholder="Optional - Enter training requirements"
                    />
                  </div>

                  {/* Suggested Improvements - OPTIONAL */}
                  <div className="form-group full-width">
                    <label>Suggested Improvements / Automation</label>
                    <textarea
                      value={row.suggestedImprovements}
                      onChange={(e) => handleTaskRowChange(row.id, 'suggestedImprovements', e.target.value)}
                      rows="2"
                      placeholder="Optional - Suggest improvements or automation ideas"
                    />
                  </div>
                </div>
              </div>
            ))}
            {/* Action Buttons */}
            <div className="form-actions step-actions">
              <button type="button" onClick={goBackToStep1} className="back-btn">
                ← Back to Employee Info
              </button>
              <button
                type="submit"
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : `Submit ${taskRows.length} Task${taskRows.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default EmployeeTaskForm;

