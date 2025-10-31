import React from 'react';
import { FaPlay, FaEdit, FaToggleOn, FaToggleOff, FaTrash } from 'react-icons/fa';
import { MdCheckCircle, MdError, MdSchedule, MdInfo } from 'react-icons/md';

export interface Task {
  id: string;
  computer_id: string;
  name: string;
  source_path: string;
  destination_path: string;
  schedule: string;
  is_active: boolean;
  created_at: string | Date;
  backup_keep_count: number | null;
  retry_attempts: number | null;
  retry_delay_seconds: number | null;
  folder_prefix: string | null;
  timestamp_format: string | null;
  discord_webhook_url: string | null;
  notification_on_success: string | null;
  notification_on_failure: string | null;
  computerName?: string;
  lastJobStatus?: 'success' | 'failed' | 'running' | null;
}

interface TaskCardProps {
  task: Task;
  onStartNow: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onToggleActive: (taskId: string, currentStatus: boolean) => void;
  onDelete: (taskId: string) => void;
}

const StatusIndicator = ({ status }: { status: Task['lastJobStatus'] }) => {
  if (status === 'success') {
    return <span className="flex items-center text-xs text-green-400"><MdCheckCircle className="mr-1" /> Successful</span>;
  }
  if (status === 'failed') {
    return <span className="flex items-center text-xs text-red-400"><MdError className="mr-1" /> Failed</span>;
  }
   if (status === 'running') {
    return <span className="flex items-center text-xs text-yellow-400"><MdSchedule className="mr-1 animate-spin" /> Running</span>;
  }
  return <span className="flex items-center text-xs text-gray-500"><MdInfo className="mr-1" /> No recent job</span>;
};

export default function TaskCard({ task, onStartNow, onEdit, onToggleActive, onDelete }: TaskCardProps) {
  const statusBorder =
    task.lastJobStatus === 'success' ? 'border-green-500' :
    task.lastJobStatus === 'failed' ? 'border-red-500' :
    task.lastJobStatus === 'running' ? 'border-blue-500' :
    'border-gray-600';

  const formattedCreatedAt = new Date(task.created_at).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' });

  return (
    <div className={`bg-gray-800 p-4 rounded-lg shadow-md text-white border-l-4 ${statusBorder} flex flex-col justify-between min-h-[220px]`}>
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold truncate mr-2" title={task.name}>{task.name}</h3>
          <StatusIndicator status={task.lastJobStatus} />
        </div>
        <p className="text-xs text-gray-400 mb-1 truncate" title={task.source_path}>
          <span className="font-medium">Source:</span> {task.source_path}
        </p>
        <p className="text-xs text-gray-400 mb-1 truncate" title={task.destination_path}>
          <span className="font-medium">Destination:</span> {task.destination_path}
        </p>
         <p className="text-xs text-gray-400 mb-1">
          <span className="font-medium">Computer:</span> {task.computerName || 'N/A'}
        </p>
        <p className="text-xs text-gray-400 mb-1">
          <span className="font-medium">Schedule:</span> {task.schedule}
        </p>
        <p className="text-xs text-gray-500 mt-2">
            Created: {formattedCreatedAt}
        </p>
      </div>

      <div className="flex items-center justify-end space-x-3 mt-auto pt-3 border-t border-gray-700">
        <button
          title="Start Now"
          onClick={() => onStartNow(task.id)}
          className='hover:text-green-500 text-gray-400'
        >
          <FaPlay />
        </button>
        <button
          title="Edit Task"
          onClick={() => onEdit(task)}
          className="text-gray-400 hover:text-blue-400"
        >
          <FaEdit />
        </button>
        <button
          title={task.is_active ? "Disable Task" : "Enable Task"}
          onClick={() => onToggleActive(task.id, task.is_active)}
          className={`hover:text-white ${task.is_active ? 'text-green-500' : 'text-gray-500'}`}
        >
          {task.is_active ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}
        </button>

        
        <button
          title="Delete Task"
          onClick={() => onDelete(task.id)}
          className="text-gray-400 hover:text-red-400"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
}