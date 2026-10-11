import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import MyRegistrations from './pages/MyRegistrations';
import AdminDashboard from './pages/AdminDashboard';
import AdminEventForm from './pages/AdminEventForm';
import AdminRegistrations from './pages/AdminRegistrations';
import NotFound from './pages/NotFound';

/**
 * Root Application Component with route definitions and global layout
 */
function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes (Students & Admins) */}
          <Route
            path="/my-registrations"
            element={
              <ProtectedRoute>
                <MyRegistrations />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/events/new"
            element={
              <AdminRoute>
                <AdminEventForm />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/events/:id/edit"
            element={
              <AdminRoute>
                <AdminEventForm />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/events/:id/registrations"
            element={
              <AdminRoute>
                <AdminRegistrations />
              </AdminRoute>
            }
          />

          {/* 404 Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
