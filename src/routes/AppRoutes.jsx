import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import DonorDashboard from '../pages/donor/DonorDashboard';
import HospitalDashboard from '../pages/hospital/HospitalDashboard';
import AboutPage from '../pages/public/AboutPage';
import BecomeDonorPage from '../pages/public/BecomeDonorPage';
import BloodRequestsPage from '../pages/public/BloodRequestsPage';
import ContactPage from '../pages/public/ContactPage';
import FaqPage from '../pages/public/FaqPage';
import FindDonorsPage from '../pages/public/FindDonorsPage';
import HomePage from '../pages/public/HomePage';
import HospitalsPage from '../pages/public/HospitalsPage';
import HowItWorksPage from '../pages/public/HowItWorksPage';
import PrivacyPolicyPage from '../pages/public/PrivacyPolicyPage';
import TermsPage from '../pages/public/TermsPage';
import RequesterDashboard from '../pages/requester/RequesterDashboard';
import ProtectedRoute from './ProtectedRoute';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* 13 Public Website & Authentication Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/find-donors" element={<FindDonorsPage />} />
          <Route path="/blood-requests" element={<BloodRequestsPage />} />
          <Route path="/hospitals" element={<HospitalsPage />} />
          <Route path="/become-a-donor" element={<BecomeDonorPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />
        </Route>

        {/* 4 Role-Specific Dashboards */}
        <Route
          path="/dashboard/donor"
          element={
            <ProtectedRoute allowedRole="donor">
              <DonorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/requester"
          element={
            <ProtectedRoute allowedRole="requester">
              <RequesterDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/hospital"
          element={
            <ProtectedRoute allowedRole="hospital">
              <HospitalDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all fallback to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
