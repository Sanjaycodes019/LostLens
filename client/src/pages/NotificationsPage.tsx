import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { notificationsApi } from '../services/endpoints';
import type { Notification } from '../types';
import Card, { Spinner, EmptyState } from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationsApi.list().then((res) => setNotifications(res.data.data)).finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await notificationsApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markRead = async (id: string) => {
    await notificationsApi.markRead(id);
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
  };

  if (loading) return <Spinner label="Loading notifications..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-slate-500">Stay updated on matches and claims</p>
        </div>
        {notifications.some((n) => !n.isRead) && (
          <Button variant="secondary" onClick={markAllRead}>Mark all read</Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState title="No notifications" description="You'll be notified when potential matches are found." />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card key={n._id} className={!n.isRead ? 'border-brand-200 bg-brand-50/30' : ''}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold">{n.type === 'MATCH' ? '🎯 ' : ''}{n.title}</div>
                  <p className="mt-1 text-sm text-slate-600">{n.message}</p>
                  <p className="mt-2 text-xs text-slate-400">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {n.link && (
                    <Link to={n.link} className="btn-secondary py-1.5 text-xs" onClick={() => markRead(n._id)}>
                      View
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
