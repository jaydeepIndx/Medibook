
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DoctorsPage from './pages/DoctorsPage'
import HomePage from './pages/HomePage'
import AdminDashboard from './pages/AdminDashboard'
import BookAppointmentPage from './pages/BookAppointmentPage'
import MyAppointmentsPage from './pages/MyAppointmentsPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/doctors" element={<DoctorsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/appointments"
              element={
                <ProtectedRoute allowedRoles={['patient', 'doctor']}>
                  <MyAppointmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/appointments/book"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <BookAppointmentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/doctors/new"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard initialAddOpen />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
