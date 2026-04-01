import { Navigate, Route, Routes } from 'react-router-dom'
import { ChatLayout } from '@/components/chat/ChatLayout'
import { DashboardHome } from '@/components/dashboard/DashboardHome'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Providers } from '@/components/dashboard/Providers'
import { RequestLogs } from '@/components/dashboard/RequestLogs'
import { ServerConfig } from '@/components/dashboard/ServerConfig'
import { Sources } from '@/components/dashboard/Sources'
import { StyleProfiles } from '@/components/dashboard/StyleProfiles'

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/chat" replace />} />
      <Route path="/chat" element={<ChatLayout />} />
      <Route
        path="/dashboard"
        element={
          <DashboardLayout>
            <DashboardHome />
          </DashboardLayout>
        }
      />
      <Route
        path="/dashboard/sources"
        element={
          <DashboardLayout>
            <Sources />
          </DashboardLayout>
        }
      />
      <Route
        path="/dashboard/profiles"
        element={
          <DashboardLayout>
            <StyleProfiles />
          </DashboardLayout>
        }
      />
      <Route
        path="/dashboard/logs"
        element={
          <DashboardLayout>
            <RequestLogs />
          </DashboardLayout>
        }
      />
      <Route
        path="/dashboard/providers"
        element={
          <DashboardLayout>
            <Providers />
          </DashboardLayout>
        }
      />
      <Route
        path="/dashboard/config"
        element={
          <DashboardLayout>
            <ServerConfig />
          </DashboardLayout>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
