import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Target, Package, Bell } from 'lucide-react';
import { itemsApi, matchesApi, notificationsApi } from '../services/endpoints';
import type { Item, Match, Notification } from '../types';
import Card, { Spinner, EmptyState, Badge } from '../components/ui/Card';
import { getMatchColor } from '../utils/constants';
import { format } from 'date-fns';

export default function DashboardPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      itemsApi.mine(),
      matchesApi.list(),
      notificationsApi.list(true),
    ])
      .then(([itemsRes, matchesRes, notifRes]) => {
        setItems(itemsRes.data.data);
        setMatches(matchesRes.data.data.slice(0, 5));
        setNotifications(notifRes.data.data.slice(0, 3));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading dashboard..." />;

  const activeItems = items.filter((i) => i.status === 'ACTIVE');

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm sm:text-base text-slate-500">Manage your lost & found reports</p>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'My Reports', value: items.length, icon: Package },
          { label: 'Active', value: activeItems.length, icon: Package },
          { label: 'Matches', value: matches.length, icon: Target },
          { label: 'Notifications', value: notifications.length, icon: Bell },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="flex items-center gap-3 sm:gap-4">
            <div className="rounded-lg bg-brand-50 p-2 sm:p-3">
              <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-brand-600" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold">{value}</div>
              <div className="text-xs sm:text-sm text-slate-500">{label}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-wrap gap-2 sm:gap-3">
        <Link to="/report/lost" className="btn-primary text-sm sm:text-base"><PlusCircle className="h-4 w-4" /> Report Lost</Link>
        <Link to="/report/found" className="btn-secondary text-sm sm:text-base"><PlusCircle className="h-4 w-4" /> Report Found</Link>
        <Link to="/matches" className="btn-secondary text-sm sm:text-base"><Target className="h-4 w-4" /> View Matches</Link>
      </div>

      <section>
        <div className="mb-3 sm:mb-4 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold">Top Potential Matches</h2>
          <Link to="/matches" className="text-xs sm:text-sm font-medium text-brand-600">View all</Link>
        </div>
        {matches.length === 0 ? (
          <EmptyState title="No matches yet" description="Report an item to start finding potential matches." />
        ) : (
          <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
            {matches.map((match) => (
              <Link key={match._id} to={`/matches/${match._id}`}>
                <Card className="hover:border-brand-300 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Badge className={getMatchColor(match.score)}>{match.score}% Match</Badge>
                      <p className="mt-2 font-medium text-sm sm:text-base">{match.lostItemId?.title} ↔ {match.foundItemId?.title}</p>
                      <p className="text-xs sm:text-sm text-slate-500">{match.explanation?.summary}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>


    </div>
  );
}
