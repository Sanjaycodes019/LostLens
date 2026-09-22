import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { adminApi, claimsApi } from '../../services/endpoints';
import type { Claim } from '../../types';
import Card, { Spinner, Badge, EmptyState } from '../ui/Card';
import Button from '../ui/Button';
import { useToast } from '../../context/ToastContext';

const statusColor: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700',
  UNDER_REVIEW: 'bg-brand-50 text-brand-700',
  APPROVED: 'bg-emerald-50 text-emerald-700',
  REJECTED: 'bg-red-50 text-red-700',
};

export default function AdminClaimsPanel({ onReviewed }: { onReviewed?: () => void }) {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const { showToast } = useToast();

  const load = () => {
    setLoading(true);
    adminApi.claims('PENDING,UNDER_REVIEW')
      .then((res) => setClaims(res.data.data))
      .catch(() => showToast('Failed to load claims', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const review = async (claim: Claim, status: 'APPROVED' | 'REJECTED') => {
    setReviewingId(claim._id);
    try {
      await claimsApi.review(claim._id, { status, adminNotes: notes[claim._id] });
      showToast(`Claim ${status === 'APPROVED' ? 'approved' : 'rejected'}`, 'success');
      setClaims((prev) => prev.filter((c) => c._id !== claim._id));
      onReviewed?.();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to review claim', 'error');
    } finally {
      setReviewingId(null);
    }
  };

  if (loading) return <Spinner label="Loading claims..." />;

  if (claims.length === 0) {
    return <EmptyState title="No claims awaiting review" description="New claim requests will show up here for verification." />;
  }

  return (
    <div className="space-y-4">
      {claims.map((claim) => (
        <Card key={claim._id}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge className={statusColor[claim.status] || 'bg-slate-100'}>{claim.status}</Badge>
            <span className="text-xs text-slate-500">Submitted {new Date(claim.createdAt).toLocaleString()}</span>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <div className="text-xs font-medium text-red-600">LOST ITEM</div>
              <p className="font-medium">{claim.lostItemId?.title}</p>
              <p className="text-xs text-slate-500">{claim.lostItemId?.category}</p>
            </div>
            <div>
              <div className="text-xs font-medium text-emerald-600">FOUND ITEM</div>
              <p className="font-medium">{claim.foundItemId?.title}</p>
              <p className="text-xs text-slate-500">{claim.foundItemId?.category}</p>
            </div>
          </div>

          <div className="mt-3 text-sm">
            <div className="text-slate-500">Claimant</div>
            <p className="font-medium">{claim.claimantId?.name} · {claim.claimantId?.email}</p>
          </div>

          {claim.hiddenDetails && (
            <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm">
              <div className="font-medium text-slate-700">Identifying details provided</div>
              <p className="mt-1 text-slate-600">{claim.hiddenDetails}</p>
            </div>
          )}

          {claim.additionalDescription && (
            <p className="mt-2 text-sm text-slate-500">{claim.additionalDescription}</p>
          )}

          <div className="mt-4">
            <label className="label">Admin notes (optional)</label>
            <textarea
              className="input min-h-[70px]"
              placeholder="Reason for approval/rejection..."
              value={notes[claim._id] || ''}
              onChange={(e) => setNotes((prev) => ({ ...prev, [claim._id]: e.target.value }))}
            />
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={() => review(claim, 'APPROVED')}
              loading={reviewingId === claim._id}
              className="w-full sm:w-auto"
            >
              <CheckCircle2 className="h-4 w-4" /> Approve Claim
            </Button>
            <Button
              variant="danger"
              onClick={() => review(claim, 'REJECTED')}
              loading={reviewingId === claim._id}
              className="w-full sm:w-auto"
            >
              <XCircle className="h-4 w-4" /> Reject Claim
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
