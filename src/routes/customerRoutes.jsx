import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from '../pages/home'
import AppointmentsPage from '../pages/appointments'
import ProfilePage from '../pages/profile'
import NotFoundPage from '../pages/404'
import BookingLayout from '../pages/book/BookingLayout'
import BusinessStep from '../pages/book/BusinessStep'
import ServicesStep from '../pages/book/ServicesStep'
import StaffStep from '../pages/book/StaffStep'
import DateTimeStep from '../pages/book/DateTimeStep'
import ConfirmStep from '../pages/book/ConfirmStep'

export default function CustomerRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/client/home" replace />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/appointments" element={<AppointmentsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/book" element={<BookingLayout />}>
        <Route index element={<Navigate to="business" replace />} />
        <Route path="business" element={<BusinessStep />} />
        <Route path="services" element={<ServicesStep />} />
        <Route path="staff" element={<StaffStep />} />
        <Route path="datetime" element={<DateTimeStep />} />
        <Route path="confirm" element={<ConfirmStep />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
