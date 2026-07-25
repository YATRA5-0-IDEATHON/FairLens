import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';

// Import Shared Components
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import ProtectedRoute from './components/ProtectedRoute';

// Import Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import CandidateHiring from './pages/CandidateHiring';
import HRDashboard from './pages/HRDashboard';
import BlindResumeScreening from './pages/BlindResumeScreening';
import CandidateComparison from './pages/CandidateComparison';
import GenderAnalyticsDashboard from './pages/GenderAnalyticsDashboard';
import PayEquityAudit from './pages/PayEquityAudit';
import PromotionAnalytics from './pages/PromotionAnalytics';
import HarassmentReportingDashboard from './pages/HarassmentReportingDashboard';
import EmployeeReportingPortal from './pages/EmployeeReportingPortal';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ComplianceReports from './pages/ComplianceReports';

function LayoutWrapper({ children }) {
  return (
    <ProtectedRoute requiredRole="hr">
    <div className="app-container">
      <Sidebar />
      <div className="main-wrapper">
        <TopNavbar />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
    </ProtectedRoute>
  );
}

function PublicEntry({ children }) {
  const { auth } = useAuth();
  if (auth.isAuthenticated) {
    return <Navigate to={auth.role === 'hr' ? '/dashboard' : '/employee-dashboard'} replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
    <DataProvider>
      <Router>
        <Routes>
          {/* Public Landing, Login & Hiring Application */}
          <Route path="/" element={<PublicEntry><LandingPage /></PublicEntry>} />
          <Route path="/login" element={<PublicEntry><Login /></PublicEntry>} />
          <Route path="/apply" element={<CandidateHiring />} />

          {/* Employee Dashboard — first page after employee login */}
          <Route path="/employee-dashboard" element={
            <ProtectedRoute requiredRole="employee">
              <EmployeeDashboard />
            </ProtectedRoute>
          } />

          {/* Anonymous Employee Reporting Portal (requires auth) */}
          <Route path="/employee-portal" element={
            <ProtectedRoute requiredRole="employee">
              <EmployeeReportingPortal />
            </ProtectedRoute>
          } />

          {/* HR & Leadership Platform Routes */}
          <Route path="/dashboard" element={<LayoutWrapper><HRDashboard /></LayoutWrapper>} />
          <Route path="/blind-screening" element={<LayoutWrapper><BlindResumeScreening /></LayoutWrapper>} />
          <Route path="/candidate-comparison" element={<LayoutWrapper><CandidateComparison /></LayoutWrapper>} />
          <Route path="/gender-analytics" element={<LayoutWrapper><GenderAnalyticsDashboard /></LayoutWrapper>} />
          <Route path="/pay-equity" element={<LayoutWrapper><PayEquityAudit /></LayoutWrapper>} />
          <Route path="/promotion-analytics" element={<LayoutWrapper><PromotionAnalytics /></LayoutWrapper>} />
          <Route path="/harassment-dashboard" element={<LayoutWrapper><HarassmentReportingDashboard /></LayoutWrapper>} />
          <Route path="/compliance-reports" element={<LayoutWrapper><ComplianceReports /></LayoutWrapper>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </DataProvider>
    </AuthProvider>
  );
}
