'use client';

import { useState, useEffect, useMemo } from 'react';
import ReportsOverview from '../../components/ReportCard';
import BackupJobCard, { type BackupJob } from '../../components/ReportGrid';
import Pagination from '../../components/Pagination';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { type Task } from '../../components/TaskCard';

const ITEMS_PER_PAGE = 16;

interface JobWithTaskInfo extends BackupJob {
  taskName: string;
}

const fetchReportsData = async (): Promise<{ jobs: JobWithTaskInfo[], tasks: Task[] }> => {
  const token = Cookies.get('SESSION_TOKEN__DO_NOT_SHARE');
  if (!token) throw new Error('No authentication token found.');

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

  try {
    // ดึงข้อมูล tasks ก่อนเพื่อใช้ในการ map ชื่อ
    const tasksRes = await fetch(`${backendUrl}/api/v1/tasks/user`, { headers });
    
    if (tasksRes.status === 401) {
      throw new Error('Authentication failed (401)');
    }

    if (!tasksRes.ok) {
      throw new Error(`Failed to fetch tasks: ${tasksRes.statusText}`);
    }

    const tasks: Task[] = await tasksRes.json();

    // ดึงข้อมูล jobs จาก task แต่ละตัว
    const jobsPromises = tasks.map(task =>
      fetch(`${backendUrl}/api/v1/jobs/task/${task.id}`, { headers })
        .then(res => res.ok ? res.json() : [])
        .then((jobs: BackupJob[]) => 
          jobs.map(job => ({
            ...job,
            taskName: task.name
          }))
        )
        .catch(() => [])
    );

    const jobsArrays = await Promise.all(jobsPromises);
    const allJobs = jobsArrays.flat();

    // เรียงตามเวลาเริ่มต้นล่าสุด
    allJobs.sort((a, b) => 
      new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
    );

    return { jobs: allJobs, tasks };

  } catch (error) {
    console.error("API Fetch Error:", error);
    throw error;
  }
};

export default function ReportsPage() {
  const [jobs, setJobs] = useState<JobWithTaskInfo[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed' | 'running'>('all');
  const [taskFilter, setTaskFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { jobs: fetchedJobs, tasks: fetchedTasks } = await fetchReportsData();
        setJobs(fetchedJobs);
        setTasks(fetchedTasks);
      } catch (err: any) {
        setError(err.message || 'Failed to load reports data.');
        console.error(err);

        if (err.message?.includes('401') || err.message?.includes('token')) {
          Cookies.remove('SESSION_TOKEN__DO_NOT_SHARE');
          router.push('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [router]);

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      const matchesTask = taskFilter === 'all' || job.task_id === taskFilter;
      return matchesStatus && matchesTask;
    });
  }, [jobs, statusFilter, taskFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);
  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredJobs.slice(startIndex, endIndex);
  }, [filteredJobs, currentPage]);

  const totalJobs = jobs.length;
  const successfulJobs = jobs.filter(j => j.status === 'success').length;
  const failedJobs = jobs.filter(j => j.status === 'failed').length;
  const runningJobs = jobs.filter(j => j.status === 'running').length;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-300">Loading reports...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-center py-8 px-4">
        <p>Error: {error}</p>
        <p className="text-gray-400 text-sm mt-2">Please try refreshing the page or logging in again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-semibold text-white">Backup Reports</h1>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <select
            value={taskFilter}
            onChange={(e) => {
              setTaskFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border rounded-md border-gray-600 bg-gray-700 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Tasks</option>
            {tasks.map(task => (
              <option key={task.id} value={task.id}>{task.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border rounded-md border-gray-600 bg-gray-700 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="running">Running</option>
          </select>
        </div>
      </div>

      <ReportsOverview
        totalJobs={totalJobs}
        successfulJobs={successfulJobs}
        failedJobs={failedJobs}
        runningJobs={runningJobs}
      />

      {filteredJobs.length === 0 ? (
        <p className="text-gray-400 text-center py-10">
          {jobs.length === 0 
            ? 'No backup jobs found yet.' 
            : 'No jobs match the selected filters.'}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedJobs.map(job => (
              <BackupJobCard
                key={job.id}
                job={job}
                taskName={job.taskName}
              />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={filteredJobs.length}
          />
        </>
      )}
    </div>
  );
}