import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import EmployeeDashboard from './EmployeeDashboard';

const Dashboard = () => {
  const { isAdmin } = useAuth();

  return isAdmin() ? <AdminDashboard /> : <EmployeeDashboard />;
};

export default Dashboard;
