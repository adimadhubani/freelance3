import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import DashboardLayout from './components/layout/DashboardLayout';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import OtpLogin from './pages/OtpLogin';
import ClientProfile from './pages/ClientProfile';
import SiteSelection from './pages/SiteSelection';
import ThreeSixtyTour from './pages/ThreeSixtyTour';
import TourVideo from './pages/TourVideo';
import ImageProduct from './pages/ImageProduct';
import FinalProduct from './pages/FinalProduct';
import AdminDashboard from './pages/AdminDashboard';
import LoadingSpinner from './components/common/LoadingSpinner';

// Route protection wrapper
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-bgLight flex items-center justify-center">
        <LoadingSpinner message="Checking authentication session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    // Redirect non-admin users trying to access admin
    return <Navigate to="/profile" replace />;
  }

  return children;
};

// Catch-all redirect component
const IndexRedirect = () => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-bgLight flex items-center justify-center">
        <LoadingSpinner message="Starting Aeroview 360..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on role
  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/profile" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Endpoint */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/login-otp" element={<OtpLogin />} />

          {/* Protected Client views */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ClientProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sites"
            element={
              <ProtectedRoute>
                <SiteSelection />
              </ProtectedRoute>
            }
          />

          {/* Site specific dashboard navigation wrapper */}
          <Route
            path="/sites/:siteId"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard Modules */}
            <Route index element={<Navigate to="360-tour" replace />} />
            <Route path="360-tour" element={<ThreeSixtyTour />} />
            <Route path="videos" element={<TourVideo />} />
            <Route path="images" element={<ImageProduct />} />
            <Route path="final-product" element={<FinalProduct />} />
          </Route>

          {/* Admin upload dashboard */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<IndexRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
