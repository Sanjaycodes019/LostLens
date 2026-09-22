import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar mobileOpen={mobileOpen} onToggleMobile={() => setMobileOpen((v) => !v)} />
      <div className="mx-auto flex max-w-7xl gap-4 px-3 py-4 sm:gap-6 sm:px-4 sm:py-6 md:px-6">
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <main className="min-w-0 flex-1 pb-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
