import { Link } from 'react-router-dom';
import { Search, Shield, Sparkles, MapPin, Target } from 'lucide-react';
import Button from '../components/ui/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 via-white to-slate-50">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 font-bold text-white">L</div>
          <span className="text-xl font-bold">LostLens</span>
        </div>
        <div className="flex gap-3">
          <Link to="/login" className="btn-secondary">Login</Link>
          <Link to="/register" className="btn-primary">Get Started</Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-1.5 text-sm font-medium text-brand-700">
          <Sparkles className="h-4 w-4" /> AI-Powered Campus Lost & Found
        </div>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
          Find what you lost.<br />Return what you found.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
          LostLens intelligently connects lost and found reports using image analysis, location, time,
          and multi-factor matching — not just keyword search.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link to="/register"><Button>Report an Item</Button></Link>
          <Link to="/login"><Button variant="secondary">Sign In</Button></Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-20 sm:grid-cols-2 lg:grid-cols-4 sm:px-6">
        {[
          { icon: Target, title: 'Smart Matching', desc: '91% match scores with clear explanations' },
          { icon: Sparkles, title: 'AI Analysis', desc: 'Extract colors, brand & features from photos' },
          { icon: MapPin, title: 'Geo Matching', desc: 'Distance & location-aware candidate search' },
          { icon: Shield, title: 'Verified Claims', desc: 'Secure claim & admin verification flow' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card">
            <Icon className="h-8 w-8 text-brand-600" />
            <h3 className="mt-4 font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-slate-500">{desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
