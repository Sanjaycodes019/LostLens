import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  PlusCircle,
  Bell,
  Target,
  FileText,
  Shield,
  LogOut,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { notificationsApi } from '../../services/endpoints';
import { cn } from '../../utils/cn';

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    notificationsApi.unreadCount().then((res) => setUnread(res.data.data.count)).catch(() => undefined);
  }, [user, location.pathname]);

  const studentLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/search', label: 'Browse', icon: Search },
    { to: '/report/lost', label: 'Report Lost', icon: PlusCircle },
    { to: '/report/found', label: 'Report Found', icon: PlusCircle },
    { to: '/matches', label: 'Matches', icon: Target },
    { to: '/claims', label: 'Claims', icon: FileText },
    { to: '/notifications', label: 'Notifications', icon: Bell },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Admin Dashboard', icon: Shield },
    ...studentLinks.filter((l) => !l.to.startsWith('/report')),
  ];

  const links = user?.role === 'ADMIN' ? adminLinks : studentLinks;

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      {links.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          onClick={onNavigate}
          className={cn(
            'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
            location.pathname === to || location.pathname.startsWith(to + '/')
              ? 'bg-brand-50 text-brand-700'
              : 'text-slate-600 hover:bg-slate-100'
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
          {to === '/notifications' && unread > 0 && (
            <span className="ml-auto rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white">{unread}</span>
          )}
        </Link>
      ))}
    </>
  );

  return (
    <>
      <aside className="hidden w-56 shrink-0 md:block">
        <nav className="sticky top-20 space-y-1">
          <NavLinks />
        </nav>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 md:hidden" onClick={onClose}>
          <nav
            className="absolute left-0 top-0 h-full w-72 bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 font-bold text-lg">Menu</div>
            <div className="space-y-1">
              <NavLinks onNavigate={onClose} />
            </div>
            {user && (
              <>
                <div className="mt-4 border-t border-slate-200 pt-4">
                  <div className="text-sm text-slate-600 mb-2">{user.name}</div>
                </div>
                <button
                  onClick={() => { logout(); onClose(); }}
                  className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
