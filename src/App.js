// App.js - UPDATED with session management
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login/Login';
import LoginOptions from './pages/Login/LoginOptions';
import EmployeeDashboard from './pages/Dashboard/EmployeeDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedApplication from './pages/Dashboard/RoleBasedApplication';
import SessionProvider from './components/SessionProvider'; // ADD THIS IMPORT

// Import ThemeProvider
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <div className="App bg-white dark:bg-gray-900 min-h-screen transition-colors">
        <BrowserRouter>
          <SessionProvider>  {/* ADD THIS WRAPPER */}
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Login />} />
              
              {/* Login Options Route - Protected but allows access after employee validation */}
              <Route 
                path="/login-options" 
                element={
                  <ProtectedRoute>
                    <LoginOptions />
                  </ProtectedRoute>
                } 
              />
              
              {/* Protected Routes */}
              <Route 
                path="/employee-dashboard" 
                element={
                  <ProtectedRoute requiredLoginType="employee">
                    <EmployeeDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/role-dashboard" 
                element={
                  <ProtectedRoute requiredLoginType="role">
                    <RoleBasedApplication/>
                  </ProtectedRoute>
                } 
              />
              
              {/* Legacy route redirect */}
              <Route 
                path="/dashboard" 
                element={<Navigate to="/employee-dashboard" replace />} 
              />
              
              {/* Catch all route - redirect to login */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </SessionProvider>  {/* ADD THIS CLOSING TAG */}
        </BrowserRouter>
        
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </div>
    </ThemeProvider>
  );
}

export default App;