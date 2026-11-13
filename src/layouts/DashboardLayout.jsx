import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import WorkspaceHeader from '../components/layout/WorkspaceHeader';
import Sidebar from '../components/navigation/Sidebar';
import { useAuth } from '../hooks/useAuth';

export default function DashboardLayout({
  role,
  title,
  subtitle,
  primaryAction,
  secondaryAction,
  defaultTab = 'overview',
  children,
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useAuth();

  const activeTab = searchParams.get('tab') || defaultTab;

  const handleSelectTab = (tabKey) => {
    setSearchParams({ tab: tabKey });
  };

  return (
    <div className="flex min-h-dvh w-full bg-background text-foreground">
      <Sidebar
        role={role}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <WorkspaceHeader
          title={title}
          subtitle={subtitle}
          primaryAction={primaryAction}
          secondaryAction={secondaryAction}
          user={currentUser}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {typeof children === 'function'
            ? children({ activeTab, setActiveTab: handleSelectTab })
            : children}
        </main>
      </div>
    </div>
  );
}
