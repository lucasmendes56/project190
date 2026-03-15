import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import BottomNav from './components/layout/BottomNav'
import LandingPage from './pages/LandingPage'
import HomePage from './pages/HomePage'
import TodayPage from './pages/TodayPage'
import DashboardPage from './pages/DashboardPage'
import CalendarPage from './pages/CalendarPage'
import LogPage from './pages/LogPage'
import SettingsPage from './pages/SettingsPage'
import OnboardingPage from './pages/OnboardingPage'

function WithBottomNav() {
  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <Outlet />
      <BottomNav />
    </div>
  )
}

function AppRoutes() {
  const { isOnboarded } = useApp()

  if (!isOnboarded) {
    return <OnboardingPage />
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route element={<WithBottomNav />}>
        <Route path="/today" element={<TodayPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/log" element={<LogPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  )
}
