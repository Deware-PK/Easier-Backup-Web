// src/app/tasks/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import TaskCard, { type Task } from '../../components/TaskCard';
import TaskDialog, { type Computer } from '../../components/TaskDialog';
import Pagination from '../../components/Pagination';
// import Cookies from 'js-cookie';
import { FaPlus } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

const ITEMS_PER_PAGE = 9;

const fetchTasksData = async (): Promise<{ tasks: Task[], computers: Computer[] }> => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

  try {
    const [tasksRes, computersRes] = await Promise.all([
      fetch(`${backendUrl}/api/v1/tasks/user`, { credentials: 'include' }),
      fetch(`${backendUrl}/api/v1/computers`, { credentials: 'include' })
    ]);

    if (tasksRes.status === 401 || computersRes.status === 401) {
      throw new Error('Authentication failed (401)');
    }

    if (!tasksRes.ok) {
      const errorData = await tasksRes.json().catch(() => ({} as { message?: string }));
      throw new Error(`Failed to fetch tasks: ${errorData.message || tasksRes.statusText}`);
    }

    if (!computersRes.ok) {
      const errorData = await computersRes.json().catch(() => ({} as { message?: string }));
      throw new Error(`Failed to fetch computers: ${errorData.message || computersRes.statusText}`);
    }

    const tasksData: Task[] = await tasksRes.json();
    const computersData: Computer[] = await computersRes.json();

    const tasksWithComputerNames = tasksData.map(task => {
      const computer = computersData.find(c => c.id === task.computer_id);
      return { ...task, computerName: computer?.name || 'Unknown' };
    });

    return { tasks: tasksWithComputerNames, computers: computersData };

  } catch (error: unknown) { // MARK: FIX(any)->unknown
    console.error('API Fetch Error:', error); // removed unused eslint-disable
    throw error instanceof Error ? error : new Error('Failed to load tasks');
  }
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [computers, setComputers] = useState<Computer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'enabled' | 'disabled'>('all');
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true); setError(null);
      try {
        const { tasks: fetchedTasks, computers: fetchedComputers } = await fetchTasksData();
        setTasks(fetchedTasks);
        setComputers(fetchedComputers);
      } catch (e: unknown) { // MARK: FIX(any)->unknown
        const msg = e instanceof Error ? e.message : 'Failed to load data.';
        setError(msg);
        console.error(e); // removed unused eslint-disable
        if (msg.includes('401') || msg.includes('token')) {
          router.push('/login');
        }
      }
      finally { setIsLoading(false); }
    };
    loadData();
  }, [router]);

  const handleOpenAddDialog = () => {
    if (computers.length === 0) {
      alert('Please register a computer first before adding a task.');
      return;
    }
    setTaskToEdit(null);
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (task: Task) => {
    setTaskToEdit(task);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setTaskToEdit(null);
  };

  const handleDialogSubmit = async (taskData: Partial<Task>, isEditing: boolean) => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const url = isEditing ? `${backendUrl}/api/v1/tasks/${taskToEdit?.id}` : `${backendUrl}/api/v1/tasks`;
    const method = isEditing ? 'PUT' : 'POST';

    const payload = {
      ...taskData,
      backup_keep_count: taskData.backup_keep_count ?? null,
      retry_attempts: taskData.retry_attempts ?? null,
      retry_delay_seconds: taskData.retry_delay_seconds ?? null,
      folder_prefix: taskData.folder_prefix ?? null,
      timestamp_format: taskData.timestamp_format ?? null,
      discord_webhook_url: taskData.discord_webhook_url ?? null,
      notification_on_success: taskData.notification_on_success ?? null,
      notification_on_failure: taskData.notification_on_failure ?? null,
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' }, // MARK: ADD headers
        body: JSON.stringify(payload), // MARK: USE payload
        credentials: 'include'
      });
      if (!res.ok) {
        const errorData: { message?: string } = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to ${isEditing ? 'update' : 'create'} task`);
      }

      const savedTaskResult: Task = await res.json();

      const savedTask: Task = {
        ...savedTaskResult,
        id: savedTaskResult.id.toString(),
        computer_id: savedTaskResult.computer_id.toString(),
        computerName: computers.find(c => c.id === savedTaskResult.computer_id)?.name || 'Unknown',
        lastJobStatus: isEditing ? taskToEdit?.lastJobStatus ?? null : null
      };

      if (isEditing) {
        setTasks(prevTasks => prevTasks.map(t => t.id === savedTask.id ? savedTask : t));
      } else {
        setTasks(prevTasks => [...prevTasks, savedTask]);
      }
      handleCloseDialog();
    } catch (e: unknown) { // MARK: FIX(any)->unknown
      const msg = e instanceof Error ? e.message : 'Unknown error';
      alert(`Error: ${msg}`);
      console.error(e); // removed unused eslint-disable
    }
  };

  const handleStartNow = (taskId: string) => {
    // MARK: USE taskId to avoid unused var warning
    alert(`Start Task (${taskId}) is not implemented in the backend yet.`);
  };

  const handleToggleActive = async (taskId: string, currentStatus: boolean) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'disable' : 'enable'} this task?`)) return;

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const url = `${backendUrl}/api/v1/tasks/${taskId}`;

    const payload = { is_active: !currentStatus };

    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      if (!res.ok) {
        const errorData: { message?: string } = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to toggle task status');
      }

      setTasks(prevTasks => prevTasks.map(t =>
        t.id === taskId ? { ...t, is_active: !currentStatus } : t
      ));
      alert(`Task ${currentStatus ? 'disabled' : 'enabled'} successfully!`);
    } catch (e: unknown) { // MARK: FIX(any)->unknown
      const msg = e instanceof Error ? e.message : 'Unknown error';
      alert(`Error toggling task status: ${msg}`);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) return;

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const url = `${backendUrl}/api/v1/tasks/${taskId}`;

    try {
      const res = await fetch(url, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (!res.ok) {
        const errorData: { message?: string } = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete task');
      }
      setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
      alert('Task deleted successfully!');
    } catch (e: unknown) { // MARK: FIX(any)->unknown
      const msg = e instanceof Error ? e.message : 'Unknown error';
      alert(`Error deleting task: ${msg}`);
    }
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(task =>
        statusFilter === 'enabled' ? task.is_active : !task.is_active
      );
    }

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(task =>
        task.name.toLowerCase().includes(lowerSearch) ||
        task.computerName?.toLowerCase().includes(lowerSearch) ||
        task.source_path.toLowerCase().includes(lowerSearch) ||
        task.destination_path.toLowerCase().includes(lowerSearch)
      );
    }

    return filtered;
  }, [tasks, statusFilter, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);
  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredTasks.slice(startIndex, endIndex);
  }, [filteredTasks, currentPage]);

  if (isLoading) return (
    <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      <p className="ml-4 text-gray-300">Loading tasks...</p>
    </div>
  );

  if (error) return (
    <div className="text-red-400 text-center py-8 px-4">
      <p>Error: {error}</p>
      <p className="text-gray-400 text-sm mt-2">Please try refreshing the page or logging in again.</p>
    </div>
  );

  return (
    <div className="text-white p-4 md:p-6 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold">Your Backup Tasks</h1>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <input
            type="search"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border rounded-md border-gray-600 bg-gray-700 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
          />

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as 'all' | 'enabled' | 'disabled'); // MARK: FIX(any)
              setCurrentPage(1);
            }}
            className="px-3 py-2 border rounded-md border-gray-600 bg-gray-700 text-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-500"
          >
            <option value="all">All Status</option>
            <option value="enabled">Enabled</option>
            <option value="disabled">Disabled</option>
          </select>

          <button
            onClick={handleOpenAddDialog}
            className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors justify-center whitespace-nowrap"
          >
            <FaPlus className="mr-2" /> Add New Task
          </button>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <p className="text-gray-400 text-center py-10">
          {tasks.length === 0
            ? 'No tasks created yet. Click "Add New Task" to get started!'
            : 'No tasks match the selected filters.'}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onStartNow={handleStartNow}
                onEdit={handleOpenEditDialog}
                onToggleActive={handleToggleActive}
                onDelete={handleDelete}
              />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={filteredTasks.length}
          />
        </>
      )}

      {isDialogOpen && (
        <TaskDialog
          isOpen={isDialogOpen}
          onClose={handleCloseDialog}
          onSubmit={handleDialogSubmit}
          taskToEdit={taskToEdit}
          computers={computers}
        />
      )}
    </div>
  );
}