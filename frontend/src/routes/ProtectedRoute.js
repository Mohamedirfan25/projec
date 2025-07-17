// src/components/ProtectedRoute.js
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const isAuthenticated = localStorage.getItem('token'); // or your auth token key

  return isAuthenticated ? <Outlet /> : <Navigate to="/loginpage" replace />;
};

export default ProtectedRoute;