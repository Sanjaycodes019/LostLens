import { useEffect, useState } from 'react';
import { claimsApi } from '../services/endpoints';
import type { Claim } from '../types';
import Card, { Spinner, Badge, EmptyState } from '../components/ui/Card';

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    claimsApi.mine().then((res) => setClaims(res.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading claims..." />;

  const statusColor: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-700',
    UNDER_REVIEW: 'bg-brand-50 text-brand-700',
    APPROVED: 'bg-emerald-50 text-emerald-700',
    REJECTED: 'bg-red-50 text-red-700',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Claims</h1>
        <p className="text-slate-500">Track ownership verification requests</p>
      </div>

      {claims.length === 0 ? (
        <EmptyState title="No claims yet" description="Submit a claim from a potential match page." />
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <Card key={claim._id}>
              <div className="flex items-center gap-2">
                <Badge className={statusColor[claim.status] || 'bg-slate-100'}>{claim.status}</Badge>
              </div>
              <p className="mt-2 font-medium">
                {claim.lostItemId?.title} → {claim.foundItemId?.title}
              </p>
              <p className="mt-1 text-sm text-slate-500">Submitted {new Date(claim.createdAt).toLocaleDateString()}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
