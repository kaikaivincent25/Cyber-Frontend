import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext"; //[cite: 2]

// Import the public pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import TrackRequest from "./pages/TrackRequest";
import ServiceDetails from "./pages/ServiceDetails";
import ServiceApply from "./pages/ServiceApply";

// Import the protected Dashboard layout and views
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard"; 
import ServiceManagerPage from "./pages/ServiceManagerPage";
import SessionsPage from "./pages/SessionsPage"; // New import for Sessions page
import StaffManagement from "./pages/StaffManagement"; // New import for Staff Management page
import MyProfile from "./pages/MyProfile"; // New import for My Profile page


import "./App.css";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loadingUser } = useAuth(); //[cite: 2]
  
  // Prevent redirect flash while checking local storage token
  if (loadingUser) {
    return <div className="loading-screen">Authenticating...</div>; 
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/track" element={<TrackRequest />} />
          <Route path="/services/:id" element={<ServiceDetails />} />
          <Route path="/services/:id/apply" element={<ServiceApply />} />
          
          {/* Protected Routes with Nested Layout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Auto-redirect /dashboard to /dashboard/requests */}
            <Route index element={<Navigate to="requests" replace />} />
            <Route path="requests" element={<Dashboard />} />
            <Route path="sessions" element={<SessionsPage />} />
            <Route path="services" element={<ServiceManagerPage />} />
            <Route path="staff" element={<StaffManagement />} />
            <Route path="profile" element={<MyProfile />} />
          </Route>
          
          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}