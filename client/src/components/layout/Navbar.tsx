import { Link } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  mobileOpen: boolean;
  onToggleMobile: () => void;
}

export default function Navbar({ mobileOpen, onToggleMobile }: NavbarProps) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2 sm:px-4 sm:py-3">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-brand-600 text-white font-bold text-sm sm:text-base">L</div>
          <div>
            <div className="font-bold text-slate-900 text-sm sm:text-base">LostLens</div>
            <div className="hidden text-xs text-slate-500 sm:block">Find what you lost</div>
          </div>
        </Link>

        <div className="hidden items-center gap-3 sm:gap-4 md:flex">
          {user && (
            <>
              <span className="text-xs sm:text-sm text-slate-600">{user.name}</span>
              <button onClick={() => logout()} className="btn-secondary py-1.5 sm:py-2 px-3 sm:px-4 text-xs sm:text-sm">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Logout</span>
              </button>
            </>
          )}
        </div>

        <button className="md:hidden rounded-lg p-2 hover:bg-slate-100" onClick={onToggleMobile}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
    </header>
  );
}
