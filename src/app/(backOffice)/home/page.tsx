'use client';

import { useState, useEffect, useMemo } from 'react';
import DashboardOverview from '../../components/DashboardOverview';
import ComputerGrid from '../../components/ComputerGrid';
import { type Computer } from '../../components/ComputerCard';
// import Cookies from 'js-cookie';

const fetchDashboardData = async (): Promise<{ computers: Computer[], totalTasks: number }> => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

  try {
    const [computersRes, tasksCountRes] = await Promise.all([
      fetch(`${backendUrl}/api/v1/computers`, { credentials: 'include' }),
      fetch(`${backendUrl}/api/v1/tasks/user/count`, { credentials: 'include' })
    ]);

    if (computersRes.status === 401 || tasksCountRes.status === 401) {
      throw new Error('Authentication failed (401)');
    }

    if (!computersRes.ok) {
      throw new Error(`Failed to fetch computers: ${computersRes.statusText}`);
    }
    if (!tasksCountRes.ok) {
      throw new Error(`Failed to fetch task count: ${tasksCountRes.statusText}`);
    }

    const computersData: Computer[] = await computersRes.json();
    const tasksCountData: { totalTasks: number } = await tasksCountRes.json();

    const computersWithDates: Computer[] = computersData.map((comp) => ({
      ...comp,
      last_seen_at: comp.last_seen_at ? new Date(comp.last_seen_at) : null,
      // MARK: FIX(any) -> use declared field
      taskCount: Number(comp.taskCount ?? 0),
    }));

    return { computers: computersWithDates, totalTasks: tasksCountData.totalTasks };

  } catch (error: unknown) { // MARK: FIX(any)->unknown
    // eslint-disable-next-line no-console
    console.error('API Fetch Error:', error);
    throw error instanceof Error ? error : new Error('Failed to load dashboard data');
  }
}

export default function DashboardPage() {
  const [allComputers, setAllComputers] = useState<Computer[]>([]);
  const [totalTasks, setTotalTasks] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // MARK: use in UI
  const [error, setError] = useState<string | null>(null); // MARK: use in UI
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { computers: fetchedComputers, totalTasks: fetchedTotalTasks } = await fetchDashboardData();
        setAllComputers(fetchedComputers);
        setTotalTasks(fetchedTotalTasks);
      } catch (e: unknown) { // MARK: FIX(any)->unknown
        const message = e instanceof Error ? e.message : 'Failed to load dashboard data.';
        if (message === 'No authentication token found.') {
          window.location.href = '/login';
        } else {
          setError(message);
        }
        console.error(e); // removed unused eslint-disable
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleComputerDeleted = (deletedComputerId: string) => {
    setAllComputers(prev => prev.filter(c => c.id !== deletedComputerId));
    setTotalTasks(prev => {
      const deletedComputer = allComputers.find(c => c.id === deletedComputerId);
      return prev - (deletedComputer?.taskCount || 0);
    });
  };

  const handleComputerRenamed = (computerId: string, newName: string) => {
    setAllComputers(prev => prev.map(c =>
      c.id === computerId ? { ...c, name: newName } : c
    ));
  };

  const filteredComputers = useMemo(() => {
    if (!searchTerm) return allComputers;
    const lowerCaseSearch = searchTerm.toLowerCase();
    return allComputers.filter(computer =>
      computer.name.toLowerCase().includes(lowerCaseSearch) ||
      (computer.os && computer.os.toLowerCase().includes(lowerCaseSearch))
    );
  }, [allComputers, searchTerm]);

  const onlineCount = allComputers.filter(c => c.status === 'online').length;
  const offlineCount = allComputers.length - onlineCount;

  // MARK: USE isLoading/error for UI to satisfy lints
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-300">Loading dashboard...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-red-400 text-center py-8 px-4">
        <p>Error: {error}</p>
        <p className="text-gray-400 text-sm mt-2">Please refresh or log in again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardOverview
        totalComputers={allComputers.length}
        onlineComputers={onlineCount}
        offlineComputers={offlineCount}
        totalTasks={totalTasks}
      />
      <ComputerGrid
        computers={filteredComputers}
        searchTerm={searchTerm}
        onSearchChange={(value) => {
          setSearchTerm(value);
          setCurrentPage(1);
        }}
        onComputerDeleted={handleComputerDeleted}
        onComputerRenamed={handleComputerRenamed}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}