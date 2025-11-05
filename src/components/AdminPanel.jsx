import { useState, useEffect } from 'react';
import './AdminPanel.css';
import API_ENDPOINTS from '../config';

// Secret admin panel for downloading data
// Access this page at: /admin-data-panel

function AdminPanel() {
  const [token, setToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [data, setData] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Check if token is stored in sessionStorage
  useEffect(() => {
    const storedToken = sessionStorage.getItem('adminToken');
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
      loadData(storedToken);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (token.trim()) {
      sessionStorage.setItem('adminToken', token);
      setIsAuthenticated(true);
      loadData(token);
    } else {
      setMessage({ type: 'error', text: 'Please enter admin token' });
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminToken');
    setToken('');
    setIsAuthenticated(false);
    setData([]);
    setMessage({ type: '', text: '' });
  };

  const loadData = async (adminToken) => {
    setIsLoadingData(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await fetch(`${API_ENDPOINTS.viewData}?token=${adminToken}`);
      const result = await response.json();

      if (response.ok && result.success) {
        setData(result.data || []);
        setMessage({ 
          type: 'success', 
          text: `Loaded ${result.data?.length || 0} records` 
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: result.error || 'Failed to load data. Invalid token?' 
        });
        if (response.status === 403) {
          handleLogout();
        }
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `Error loading data: ${error.message}` 
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleDownloadCSV = async () => {
    setIsDownloading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(`${API_ENDPOINTS.downloadCSV}?token=${token}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to download CSV');
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `employee_task_data_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setMessage({
        type: 'success',
        text: 'CSV file downloaded successfully!'
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Download failed: ${error.message}`
      });
      if (error.message.includes('Unauthorized')) {
        handleLogout();
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRefresh = () => {
    loadData(token);
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-container">
        <div className="admin-login-box">
          <h1>🔒 Admin Panel</h1>
          <p>Enter admin token to access data</p>
          
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Enter admin token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="admin-token-input"
              autoFocus
            />
            <button type="submit" className="admin-login-btn">
              Login
            </button>
          </form>

          {message.text && (
            <div className={`admin-message ${message.type}`}>
              {message.text}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
          <h1>📊 Admin Data Panel</h1>
          <p>View and download employee task data</p>
        </div>
        <button onClick={handleLogout} className="admin-logout-btn">
          Logout
        </button>
      </div>

      {message.text && (
        <div className={`admin-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="admin-actions">
        <button 
          onClick={handleDownloadCSV} 
          className="admin-download-btn"
          disabled={isDownloading}
        >
          {isDownloading ? '⏳ Downloading...' : '📥 Download CSV'}
        </button>
        <button 
          onClick={handleRefresh} 
          className="admin-refresh-btn"
          disabled={isLoadingData}
        >
          {isLoadingData ? '⏳ Loading...' : '🔄 Refresh Data'}
        </button>
      </div>

      <div className="admin-data-section">
        <h2>Data Records ({data.length})</h2>
        
        {isLoadingData ? (
          <div className="admin-loading">Loading data...</div>
        ) : data.length === 0 ? (
          <div className="admin-no-data">No data available yet</div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  {Object.keys(data[0] || {}).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value, i) => (
                      <td key={i}>{value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;

