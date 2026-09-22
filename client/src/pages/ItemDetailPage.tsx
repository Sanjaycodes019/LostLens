import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, Tag, User } from 'lucide-react';
import { format } from 'date-fns';
import { itemsApi } from '../services/endpoints';
import type { Item, Match } from '../types';
import Card, { Spinner, Badge, EmptyState } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { getMatchColor } from '../utils/constants';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [item, setItem] = useState<Item | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([itemsApi.get(id), itemsApi.matches(id)])
      .then(([itemRes, matchRes]) => {
        setItem(itemRes.data.data);
        setMatches(matchRes.data.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner label="Loading item..." />;
  if (!item) return <EmptyState title="Item not found" />;

  const reporter = typeof item.userId === 'object' ? item.userId : null;
  const isOwner = reporter && user && reporter._id === user.id;

  const handleRecover = async () => {
    try {
      await itemsApi.recover(item._id);
      showToast('Item marked as recovered!', 'success');
      setItem({ ...item, status: 'RESOLVED' });
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed', 'error');
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <div className="flex flex-wrap gap-2">
            <Badge className={item.type === 'LOST' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}>
              {item.type}
            </Badge>
            <Badge className="bg-slate-100 text-slate-600">{item.status}</Badge>
            <Badge className="bg-brand-50 text-brand-700">{item.category}</Badge>
          </div>
          <h1 className="mt-4 text-2xl font-bold">{item.title}</h1>
          <p className="mt-4 text-slate-600">{item.description}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 text-sm">
            <div className="flex items-center gap-2 text-slate-600"><Tag className="h-4 w-4" /> {item.brand} · {item.color}</div>
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="h-4 w-4" /> {format(new Date(item.eventDate), 'PPP')} {item.eventTime}
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="h-4 w-4" /> {item.location?.placeName || item.location?.address || 'Unknown'}
            </div>
            {reporter && (
              <div className="flex items-center gap-2 text-slate-600">
                <User className="h-4 w-4" /> {reporter.name}
              </div>
            )}
          </div>

          {item.images?.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              {item.images.map((img, i) => (
                <img key={i} src={img.url} alt="" className="h-32 rounded-lg object-cover" />
              ))}
            </div>
          )}

          {isOwner && item.status === 'ACTIVE' && (
            <div className="mt-6 flex gap-3">
              <Button variant="secondary" onClick={handleRecover}>Mark Recovered</Button>
            </div>
          )}
        </Card>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Potential Matches</h2>
        {matches.length === 0 ? (
          <EmptyState title="No matches yet" description="Matches appear when opposite reports are found." />
        ) : (
          <div className="space-y-3">
            {matches.map((match) => (
              <Link key={match._id} to={`/matches/${match._id}`}>
                <Card className="hover:border-brand-300 transition">
                  <Badge className={getMatchColor(match.score)}>{match.score}% Match</Badge>
                  <p className="mt-2 text-sm font-medium">
                    {item.type === 'LOST' ? match.foundItemId?.title : match.lostItemId?.title}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {match.explanation?.factors?.slice(0, 3).map((f, i) => (
                      <li key={i} className={`text-xs ${f.positive ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {f.positive ? '✓' : '⚠'} {f.message}
                      </li>
                    ))}
                  </ul>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
