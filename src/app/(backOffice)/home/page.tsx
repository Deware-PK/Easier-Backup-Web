'use client';

import { useState, useEffect, useMemo } from 'react';
import DashboardOverview from '../../components/DashboardOverview';
import ComputerGrid from '../../components/ComputerGrid';
import { type Computer } from '../../components/ComputerCard';
import Cookies from 'js-cookie';

const fetchDashboardData = async (): Promise<{ computers: Computer[], totalTasks: number }> => {
  const token = Cookies.get('SESSION_TOKEN__DO_NOT_SHARE');
  if (!token) {
    throw new Error('No authentication token found.'); 
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

  try {
    const [computersRes, tasksCountRes] = await Promise.all([
      fetch(`${backendUrl}/api/v1/computers`, { headers }),
      fetch(`${backendUrl}/api/v1/tasks/user/count`, { headers })
      
    ]);

    if (!computersRes.ok) {
      throw new Error(`Failed to fetch computers: ${computersRes.statusText}`);
    }
    if (!tasksCountRes.ok) {
      throw new Error(`Failed to fetch task count: ${tasksCountRes.statusText}`);
    }

    const computersData: Computer[] = await computersRes.json();
    const tasksCountData: { totalTasks: number } = await tasksCountRes.json();

    const computersWithDates = computersData.map(comp => ({
      ...comp,
      last_seen_at: comp.last_seen_at ? new Date(comp.last_seen_at) : null,
      
      taskCount: (comp as any).taskCount || 0 
    }));

    return { computers: computersWithDates, totalTasks: tasksCountData.totalTasks };

  } catch (error) {

    console.error("API Fetch Error:", error);
    throw error;
  }
}

export default function DashboardPage() {
  const [allComputers, setAllComputers] = useState<Computer[]>([]);
  const [totalTasks, setTotalTasks] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      } catch (error: any) {
         if (error.message === 'No authentication token found.') {
             window.location.href = '/login'; 
         } else {
             setError(error.message || 'Failed to load dashboard data.');
         }
        console.error(error);
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
    if (!searchTerm) {
      return allComputers;
    }
    const lowerCaseSearch = searchTerm.toLowerCase();
    return allComputers.filter(computer =>
      computer.name.toLowerCase().includes(lowerCaseSearch) ||
      (computer.os && computer.os.toLowerCase().includes(lowerCaseSearch))
    );
  }, [allComputers, searchTerm]);


  const onlineCount = allComputers.filter(c => c.status === 'online').length;
  const offlineCount = allComputers.length - onlineCount;

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