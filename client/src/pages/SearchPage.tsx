import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { itemsApi } from '../services/endpoints';
import type { Item } from '../types';
import Card, { Spinner, Badge, EmptyState } from '../components/ui/Card';
import Input from '../components/ui/Input';
import { CATEGORIES } from '../utils/constants';
import { format } from 'date-fns';

export default function SearchPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('newest');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { sort };
      if (search) params.search = search;
      if (type) params.type = type;
      if (category) params.category = category;
      const res = await itemsApi.list(params);
      setItems(res.data.data);
    } finally {
      setLoading(false);
    }
  }, [search, type, category, sort]);

  useEffect(() => {
    const t = setTimeout(fetchItems, 300);
    return () => clearTimeout(t);
  }, [fetchItems]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Browse Reports</h1>
        <p className="text-slate-500">Search and filter campus lost & found reports</p>
      </div>

      <Card>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All types</option>
            <option value="LOST">Lost</option>
            <option value="FOUND">Found</option>
          </select>
          <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </Card>

      {loading ? (
        <Spinner label="Loading items..." />
      ) : items.length === 0 ? (
        <EmptyState title="No items found" description="Try adjusting your filters." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Link key={item._id} to={`/items/${item._id}`}>
              <Card className="h-full hover:border-brand-300 transition">
                <div className="flex gap-2">
                  <Badge className={item.type === 'LOST' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}>
                    {item.type}
                  </Badge>
                  <Badge className="bg-slate-100 text-slate-600">{item.category}</Badge>
                </div>
                <h3 className="mt-3 font-semibold">{item.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{item.description}</p>
                <p className="mt-3 text-xs text-slate-400">{format(new Date(item.createdAt), 'MMM d, yyyy')}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
