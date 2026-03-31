import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import SessionsPage from './pages/SessionsPage';
import RegisterPage from './pages/RegisterPage';
import CheckInPage from './pages/CheckInPage';
import LoginPage from './pages/LoginPage';
import CabinetDashboard from './pages/CabinetDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <>
                <Navbar />
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/sessions" element={<SessionsPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/checkin" element={<CheckInPage />} />
                  <Route
                    path="/cabinet"
                    element={
                      <ProtectedRoute role="cabinet">
                        <CabinetDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute role="super_admin">
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </>
            }
          />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;

