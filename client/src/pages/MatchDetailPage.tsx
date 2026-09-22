import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { matchesApi, claimsApi } from '../services/endpoints';
import type { Match } from '../types';
import Card, { Spinner, Badge, EmptyState } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { getMatchColor, getMatchLabel } from '../utils/constants';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [claimDetails, setClaimDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    matchesApi.get(id).then((res) => setMatch(res.data.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner label="Loading match..." />;
  if (!match) return <EmptyState title="Match not found" />;

  const lostUserId = typeof match.lostItemId?.userId === 'object'
    ? match.lostItemId.userId._id
    : match.lostItemId?.userId;
  const canClaim = user && lostUserId === user.id;

  const submitClaim = async () => {
    if (!claimDetails.trim()) {
      showToast('Please provide identifying details', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await claimsApi.create({ matchId: match._id, hiddenDetails: claimDetails });
      showToast('Claim submitted for review', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Badge className={getMatchColor(match.score)}>{match.score}% Match</Badge>
        <h1 className="mt-2 text-2xl font-bold">{getMatchLabel(match.score).toUpperCase()} — {match.score}%</h1>
        <p className="text-slate-500">{match.explanation?.summary}</p>
      </div>

      <Card>
        <h2 className="font-semibold">Why this item was considered a possible match</h2>
        <ul className="mt-4 space-y-2">
          {match.explanation?.factors?.map((f, i) => (
            <li key={i} className={`flex items-start gap-2 text-sm ${f.positive ? 'text-emerald-700' : 'text-amber-700'}`}>
              <span>{f.positive ? '✓' : '⚠'}</span>
              {f.message}
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <div className="text-xs font-medium text-red-600">LOST ITEM</div>
          <Link to={`/items/${match.lostItemId?._id}`} className="mt-2 block font-semibold hover:text-brand-600">
            {match.lostItemId?.title}
          </Link>
          <p className="mt-2 text-sm text-slate-500">{match.lostItemId?.description?.slice(0, 120)}...</p>
        </Card>
        <Card>
          <div className="text-xs font-medium text-emerald-600">FOUND ITEM</div>
          <Link to={`/items/${match.foundItemId?._id}`} className="mt-2 block font-semibold hover:text-brand-600">
            {match.foundItemId?.title}
          </Link>
          <p className="mt-2 text-sm text-slate-500">{match.foundItemId?.description?.slice(0, 120)}...</p>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold">Score Breakdown</h3>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Object.entries(match.scoreBreakdown || {}).map(([key, val]) => (
            <div key={key} className="rounded-lg bg-slate-50 p-3 text-center">
              <div className="text-lg font-bold text-brand-700">{val}%</div>
              <div className="text-xs capitalize text-slate-500">{key}</div>
            </div>
          ))}
        </div>
      </Card>

      {canClaim && (
        <Card>
          <h3 className="font-semibold">Request Claim</h3>
          <p className="mt-2 text-sm text-slate-500">
            Provide hidden identifying information for verification. This is not shown publicly.
          </p>
          <div className="mt-4">
            <label className="label">Hidden identifying details</label>
            <textarea
              className="input min-h-[100px]"
              value={claimDetails}
              onChange={(e) => setClaimDetails(e.target.value)}
              placeholder="e.g. Student ID number inside, specific sticker, contents..."
            />
          </div>
          <Button className="mt-4" onClick={submitClaim} loading={submitting}>Submit Claim Request</Button>
        </Card>
      )}
    </div>
  );
}
