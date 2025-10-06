import { Outlet, NavLink } from 'react-router-dom';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { BarChart, Users, Settings, Shield, ArrowLeft } from 'lucide-react';

export default function AdminLayout() {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
      isActive 
        ? 'bg-primary text-primary-foreground' 
        : 'text-foreground hover:bg-accent'
    }`;

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        {/* Admin Header */}
        <div className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold text-foreground">DNA Admin</h1>
              </div>
              <NavLink 
                to="/dna/me" 
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Platform
              </NavLink>
            </div>
          </div>
        </div>

        {/* Admin Navigation */}
        <div className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex gap-2 py-3">
              <NavLink to="/app/admin" end className={navLinkClass}>
                <BarChart className="h-4 w-4" />
                Dashboard
              </NavLink>
              <NavLink to="/app/admin/engagement" className={navLinkClass}>
                <Users className="h-4 w-4" />
                Engagement
              </NavLink>
              <NavLink to="/app/admin/signals" className={navLinkClass}>
                <Settings className="h-4 w-4" />
                Signals
              </NavLink>
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Outlet />
        </div>
      </div>
    </AdminGuard>
  );
}
