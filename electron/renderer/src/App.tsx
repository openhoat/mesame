import { useState } from 'react'
import { ChatLayout } from '@/components/chat/ChatLayout'
import { DashboardHome } from '@/components/dashboard/DashboardHome'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { RequestLogs } from '@/components/dashboard/RequestLogs'
import { ServerConfig } from '@/components/dashboard/ServerConfig'
import { StyleProfiles } from '@/components/dashboard/StyleProfiles'

export function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')

  const renderPage = () => {
    switch (currentPage) {
      case 'chat':
        return <ChatLayout onNavigate={setCurrentPage} />
      case 'dashboard':
        return (
          <DashboardLayout currentPage={currentPage} onNavigate={setCurrentPage}>
            <DashboardHome />
          </DashboardLayout>
        )
      case 'profiles':
        return (
          <DashboardLayout currentPage={currentPage} onNavigate={setCurrentPage}>
            <StyleProfiles />
          </DashboardLayout>
        )
      case 'logs':
        return (
          <DashboardLayout currentPage={currentPage} onNavigate={setCurrentPage}>
            <RequestLogs />
          </DashboardLayout>
        )
      case 'config':
        return (
          <DashboardLayout currentPage={currentPage} onNavigate={setCurrentPage}>
            <ServerConfig />
          </DashboardLayout>
        )
      default:
        return <ChatLayout onNavigate={setCurrentPage} />
    }
  }

  return renderPage()
}
