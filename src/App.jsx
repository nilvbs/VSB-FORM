import { useState, useEffect } from 'react'
import EmployeeTaskForm from './components/EmployeeTaskForm'
import AdminPanel from './components/AdminPanel'
import './App.css'

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    // Listen for URL changes
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Route to admin panel if path matches
  if (currentPath === '/admin-data-panel') {
    return (
      <div className="App">
        <AdminPanel />
      </div>
    );
  }

  // Default route - show employee form
  return (
    <div className="App">
      <EmployeeTaskForm />
    </div>
  )
}

export default App
