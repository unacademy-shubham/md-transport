import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import DirectorView from './pages/DirectorView';
import AccountsView from './pages/AccountsView';
import OpsView from './pages/OpsView';
import SiteView from './pages/SiteView';

function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route 
            path="/director" 
            element={
              <ProtectedRoute allowedRoles={['DIRECTOR']}>
                <DirectorView />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/accounts" 
            element={
              <ProtectedRoute allowedRoles={['HO_ACCOUNTS', 'DIRECTOR']}>
                <AccountsView />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/operations" 
            element={
              <ProtectedRoute allowedRoles={['HO_OPS', 'DIRECTOR']}>
                <OpsView />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/plant" 
            element={
              <ProtectedRoute allowedRoles={['SITE_EXEC']}>
                <SiteView />
              </ProtectedRoute>
            } 
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}