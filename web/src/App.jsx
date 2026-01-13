/**
 * Gastro-Savdo-Insights - React Frontend
 * Asosiy App komponenti
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AdminsPage from './pages/AdminsPage';

// Analytics Pages
import AnalyticsDashboard from './pages/analytics/AnalyticsDashboard';
import ProductAnalytics from './pages/analytics/ProductAnalytics';
import EmployeeAnalytics from './pages/analytics/EmployeeAnalytics';
import CustomerAnalytics from './pages/analytics/CustomerAnalytics';
import CategoryAnalytics from './pages/analytics/CategoryAnalytics';
import SupplierAnalytics from './pages/analytics/SupplierAnalytics';
import ShippingAnalytics from './pages/analytics/ShippingAnalytics';
import SalesAnalytics from './pages/analytics/SalesAnalytics';

// Services
import { AuthProvider } from './services/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admins" element={<AdminsPage />} />
          
          {/* Analytics Routes */}
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="/analytics/products" element={<ProductAnalytics />} />
          <Route path="/analytics/employees" element={<EmployeeAnalytics />} />
          <Route path="/analytics/customers" element={<CustomerAnalytics />} />
          <Route path="/analytics/categories" element={<CategoryAnalytics />} />
          <Route path="/analytics/suppliers" element={<SupplierAnalytics />} />
          <Route path="/analytics/shipping" element={<ShippingAnalytics />} />
          <Route path="/analytics/sales" element={<SalesAnalytics />} />
          
          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/analytics" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
