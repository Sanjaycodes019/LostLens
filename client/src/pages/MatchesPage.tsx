import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { matchesApi } from '../services/endpoints';
import type { Match } from '../types';
import Card, { Spinner, EmptyState, Badge } from '../components/ui/Card';
import { getMatchColor, formatDistance } from '../utils/constants';

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    matchesApi.list().then((res) => setMatches(res.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Finding possible matches..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Potential Matches</h1>
        <p className="text-slate-500">Intelligent matches between your lost and found reports</p>
      </div>

      {matches.length === 0 ? (
        <EmptyState title="No matches yet" description="Report items to discover potential matches." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {matches.map((match) => (
            <Link key={match._id} to={`/matches/${match._id}`}>
              <Card className="hover:border-brand-300 transition">
                <div className="flex items-start justify-between">
                  <Badge className={getMatchColor(match.score)}>{match.score}% — {match.explanation?.summary}</Badge>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-red-50 p-3">
                    <div className="text-xs font-medium text-red-600">LOST</div>
                    <div className="mt-1 font-medium">{match.lostItemId?.title}</div>
                    <div className="text-xs text-slate-500">{match.lostItemId?.category}</div>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-3">
                    <div className="text-xs font-medium text-emerald-600">FOUND</div>
                    <div className="mt-1 font-medium">{match.foundItemId?.title}</div>
                    <div className="text-xs text-slate-500">{match.foundItemId?.category}</div>
                  </div>
                </div>
                <ul className="mt-4 space-y-1">
                  {match.explanation?.factors?.map((f, i) => (
                    <li key={i} className={`text-sm ${f.positive ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {f.positive ? '✓' : '⚠'} {f.message}
                    </li>
                  ))}
                </ul>
                {match.distanceMeters != null && (
                  <p className="mt-2 text-xs text-slate-500">Distance: {formatDistance(match.distanceMeters)}</p>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
