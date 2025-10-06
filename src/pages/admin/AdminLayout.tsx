import { Outlet, NavLink } from 'react-router-dom';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { BarChart, Users, Activity } from 'lucide-react';
import UnifiedHeader from '@/components/UnifiedHeader';

export default function AdminLayout() {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <UnifiedHeader />
        
        {/* Admin Nav */}
        <div className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex gap-6 py-4">
              <NavLink
                to="/app/admin"
                end
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive ? 'bg-dna-emerald text-white' : 'text-muted-foreground hover:bg-accent'
                  }`
                }
              >
                <BarChart className="h-4 w-4" />
                Dashboard
              </NavLink>
              <NavLink
                to="/app/admin/engagement"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive ? 'bg-dna-emerald text-white' : 'text-muted-foreground hover:bg-accent'
                  }`
                }
              >
                <Users className="h-4 w-4" />
                Engagement
              </NavLink>
              <NavLink
                to="/app/admin/signals"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive ? 'bg-dna-emerald text-white' : 'text-muted-foreground hover:bg-accent'
                  }`
                }
              >
                <Activity className="h-4 w-4" />
                Signals
              </NavLink>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Outlet />
        </div>
      </div>
    </AdminGuard>
  );
}
