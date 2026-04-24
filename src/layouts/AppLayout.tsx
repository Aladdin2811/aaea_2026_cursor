import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import { AppHeader } from '../components/layout/AppHeader'
import { AppSidebar } from '../components/layout/AppSidebar'

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarDesktopVisible, setSidebarDesktopVisible] = useState(true)

  return (
    <div className="flex h-dvh overflow-hidden bg-slate-50">
      <AppSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        desktopVisible={sidebarDesktopVisible}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <AppHeader
          onMenuClick={() => setSidebarOpen(true)}
          sidebarDesktopVisible={sidebarDesktopVisible}
          onToggleDesktopSidebar={() =>
            setSidebarDesktopVisible((v) => !v)
          }
        />
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 pt-3 pb-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
