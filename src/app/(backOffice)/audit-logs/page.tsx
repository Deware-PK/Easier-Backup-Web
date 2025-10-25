'use client';

import { useEffect, useMemo, useState } from 'react';
// import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import Pagination from '../../components/Pagination'; // MARK: reuse existing component

type AuditLog = {
  id: string;
  action: string;
  user_id: string | number;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string | Date;
  [key: string]: unknown; // MARK: FIX(any)->unknown
};

type PagedLogs = {
  logs?: AuditLog[];
  items?: AuditLog[];
  total?: number;
  page?: number;
  limit?: number;
}; // MARK: ADD - normalize type

type LogsResponse =
  | PagedLogs
  | AuditLog[]; // MARK: keep fallback

type StatsResponse = {
  totalUsers: number;
  totalComputers: number;
  totalTasks: number;
  recentLogs?: AuditLog[];
};

const DEFAULT_LIMIT = 50;

export default function AuditLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(DEFAULT_LIMIT);

  // MARK: filters
  const [action, setAction] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [ipAddress, setIpAddress] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

  // MARK: fetch stats to verify admin and show header metrics
  useEffect(() => {
    const init = async () => {
      try {
        const s = await fetch(`${backendUrl}/api/v1/admin/stats`, {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        if (s.status === 401) {
          router.push('/login');
          return;
        }
        if (s.status === 403) {
          router.push('/home');
          return;
        }
        if (!s.ok) {
          throw new Error('Failed to load admin stats');
        }
        const statsJson: StatsResponse = await s.json();
        setStats(statsJson);
      } catch (e: unknown) { // MARK: FIX(any)->unknown
        const msg = e instanceof Error ? e.message : 'Failed to load admin stats';
        setError(msg);
      }
    };
    init();
  }, [backendUrl, router]);

  // MARK: fetch logs when filters/pagination change
  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(limit));
        if (action.trim()) params.set('action', action.trim());
        if (userId.trim()) params.set('user_id', userId.trim());
        if (ipAddress.trim()) params.set('ip_address', ipAddress.trim());

        const res = await fetch(`${backendUrl}/api/v1/admin/audit-logs?${params.toString()}`, {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (res.status === 401) {
          router.push('/login');
          return;
        }
        if (res.status === 403) {
          router.push('/home');
          return;
        }
        if (!res.ok) {
          throw new Error('Failed to load audit logs');
        }

        const json: LogsResponse | AuditLog[] = await res.json(); // MARK: type-safe
        let items: AuditLog[] = [];
        let totalCount = 0;

        if (Array.isArray(json)) {
          items = json;
          totalCount = items.length;
        } else {
          const obj: PagedLogs = json;
          items = obj.logs ?? obj.items ?? [];
          totalCount = typeof obj.total === 'number' ? obj.total : items.length;
        }

        setLogs(items);
        setTotal(totalCount);
      } catch (e: unknown) { // MARK: FIX(any)->unknown
        const msg = e instanceof Error ? e.message : 'Failed to load audit logs';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, [action, userId, ipAddress, page, limit, backendUrl, router]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((total || 0) / limit)),
    [total, limit]
  );

  const formatDate = (d: string | Date) =>
    new Date(d).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' });

  return (
    <div className="text-white min-h-[calc(100vh-4rem)] p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Audit Logs</h1>
      </div>

      {/* MARK: stats header */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-blue-500">
            <div className="text-3xl font-bold">{stats.totalUsers}</div>
            <div className="text-sm text-gray-400">Total Users</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-green-500">
            <div className="text-3xl font-bold">{stats.totalComputers}</div>
            <div className="text-sm text-gray-400">Total Computers</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-yellow-500">
            <div className="text-3xl font-bold">{stats.totalTasks}</div>
            <div className="text-sm text-gray-400">Total Tasks</div>
          </div>
        </div>
      )}

      {/* MARK: filters */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(1);
            }}
            placeholder="Filter by action (e.g. LOGIN, CREATE_TASK)"
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
          />
          <input
            value={userId}
            onChange={(e) => {
              setUserId(e.target.value);
              setPage(1);
            }}
            placeholder="Filter by user_id"
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
          />
          <input
            value={ipAddress}
            onChange={(e) => {
              setIpAddress(e.target.value);
              setPage(1);
            }}
            placeholder="Filter by IP"
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
          />
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm"
          >
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
          </select>
          <button
            onClick={() => {
              setAction('');
              setUserId('');
              setIpAddress('');
              setPage(1);
              setLimit(DEFAULT_LIMIT);
            }}
            className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded text-sm"
          >
            Clear
          </button>
        </div>
      </div>

      {/* MARK: table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-300">Loading audit logs...</span>
        </div>
      ) : error ? (
        <div className="text-center text-red-400">{error}</div>
      ) : logs.length === 0 ? (
        <div className="text-center text-gray-400 py-10">No logs found.</div>
      ) : (
        <>
          <div className="overflow-auto rounded border border-gray-700">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Time</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Action</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">IP</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Agent</th>
                </tr>
              </thead>
              <tbody className="bg-gray-900 divide-y divide-gray-800">
                {logs.map((log) => (
                  <tr key={String(log.id)}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">
                      {String(log.user_id)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      <span className="px-2 py-1 rounded bg-gray-700 text-gray-200">{log.action}</span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">
                      {log.ip_address || '-'}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-400 max-w-[24rem] truncate" title={(log.user_agent || '') as string}>
                      {log.user_agent || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            itemsPerPage={limit}
            totalItems={total}
          />
        </>
      )}
    </div>
  );
}