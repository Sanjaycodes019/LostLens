import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, PieChart, Pie, Cell,
} from 'recharts';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import { adminApi } from '../services/endpoints';
import type { AdminStats } from '../types';
import Card, { Spinner } from '../components/ui/Card';
import { cn } from '../utils/cn';
import AdminClaimsPanel from '../components/admin/AdminClaimsPanel';

const COLORS = ['#3388ff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [heatmap, setHeatmap] = useState<Array<{ location: { coordinates: [number, number] }; type: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'claims'>('overview');

  useEffect(() => {
    Promise.all([adminApi.stats(), adminApi.heatmap()])
      .then(([statsRes, heatRes]) => {
        setStats(statsRes.data.data);
        setHeatmap(heatRes.data.data);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading admin dashboard..." />;
  if (!stats) return <div>Failed to load stats</div>;

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers },
    { label: 'Lost Reports', value: stats.totalLostReports },
    { label: 'Found Reports', value: stats.totalFoundReports },
    { label: 'Active Matches', value: stats.activeMatches },
    { label: 'Recoveries', value: stats.successfulRecoveries },
    { label: 'Pending Claims', value: stats.pendingClaims },
    { label: 'Reports This Week', value: stats.reportsThisWeek },
    { label: 'Recovery Rate', value: `${stats.recoveryRate}%` },
  ];

  const categoryData = stats.lostByCategory.map((c) => ({ name: c._id, count: c.count }));
  const timeData = stats.reportsOverTime.map((r) => ({ date: r._id, lost: r.lost, found: r.found }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-slate-500">Campus lost & found analytics</p>
      </div>

      <div className="flex gap-1 border-b border-slate-200">
        {(['overview', 'claims'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'relative -mb-px border-b-2 px-4 py-2 text-sm font-medium capitalize transition',
              tab === t ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            )}
          >
            {t === 'claims' ? `Claims Review${stats.pendingClaims ? ` (${stats.pendingClaims})` : ''}` : 'Overview'}
          </button>
        ))}
      </div>

      {tab === 'claims' ? (
        <AdminClaimsPanel onReviewed={() => adminApi.stats().then((res) => setStats(res.data.data))} />
      ) : (
      <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, value }) => (
          <Card key={label}>
            <div className="text-2xl font-bold text-brand-700">{value}</div>
            <div className="text-sm text-slate-500">{label}</div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-semibold">Lost vs Found Over Time</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={timeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="lost" stroke="#ef4444" name="Lost" />
              <Line type="monotone" dataKey="found" stroke="#10b981" name="Found" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="mb-4 font-semibold">Most Common Categories</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3388ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <h2 className="mb-4 font-semibold">Campus Heatmap — Where items are most frequently reported</h2>
        <div className="h-80 overflow-hidden rounded-xl">
          <MapContainer center={[31.1048, 77.1734]} zoom={15} className="h-full w-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {heatmap.map((point, i) => {
              const [lng, lat] = point.location.coordinates;
              return (
                <CircleMarker
                  key={i}
                  center={[lat, lng]}
                  radius={8}
                  pathOptions={{
                    color: point.type === 'LOST' ? '#ef4444' : '#10b981',
                    fillColor: point.type === 'LOST' ? '#ef4444' : '#10b981',
                    fillOpacity: 0.5,
                  }}
                />
              );
            })}
          </MapContainer>
        </div>
      </Card>
      </>
      )}
    </div>
  );
}
