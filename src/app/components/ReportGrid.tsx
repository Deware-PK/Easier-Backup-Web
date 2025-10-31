import React from 'react';
import { MdCheckCircle, MdError, MdSchedule, MdAccessTime, MdHourglassTop } from 'react-icons/md';

export interface BackupJob {
  id: string;
  task_id: string;
  started_at: string | Date;
  completed_at?: string | Date | null;
  status: 'running' | 'success' | 'failed' | 'queued';
  error_message?: string | null;
  files_copied?: number | null;
  total_size_bytes?: number | null;
}

interface BackupJobCardProps {
  job: BackupJob;
  taskName?: string;
}

const StatusBadge = ({ status }: { status: BackupJob['status'] }) => {
  const styles = {
    success: 'bg-green-600 text-white',
    failed: 'bg-red-600 text-white',
    running: 'bg-blue-600 text-white',
    queued: 'bg-orange-600 text-white'
  };

  const icons = {
    success: <MdCheckCircle className="w-4 h-4" />,
    failed: <MdError className="w-4 h-4" />,
    running: <MdSchedule className="w-4 h-4 animate-spin" />,
    queued: <MdHourglassTop className="w-4 h-4" />
  };

  return (
    <span className={`flex items-center space-x-1 text-xs font-medium px-3 py-1 rounded-full ${styles[status]}`}>
      {icons[status]}
      <span>{status.toUpperCase()}</span>
    </span>
  );
};

const formatBytes = (bytes: number | null | undefined) => {
  if (!bytes) return 'N/A';
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
};

const formatDuration = (startDate: string | Date, endDate?: string | Date | null) => {
  const start = new Date(startDate).getTime();
  const end = endDate ? new Date(endDate).getTime() : Date.now();
  const durationMs = end - start;
  
  const seconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

export default function BackupJobCard({ job, taskName }: BackupJobCardProps) {
  const statusBorder = {
    success: 'border-green-500',
    failed: 'border-red-500',
    running: 'border-blue-500',
    queued: 'border-orange-500'
  }[job.status];

  const formattedStartTime = new Date(job.started_at).toLocaleString('th-TH', { 
    dateStyle: 'short', 
    timeStyle: 'short' 
  });

  const formattedEndTime = job.completed_at 
    ? new Date(job.completed_at).toLocaleString('th-TH', { 
        dateStyle: 'short', 
        timeStyle: 'short' 
      })
    : 'In Progress';

  return (
    <div className={`bg-gray-800 p-4 rounded-lg shadow-md text-white border-l-4 ${statusBorder}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold truncate">{taskName || 'Unknown Task'}</h3>
          <p className="text-xs text-gray-400">Job ID: {job.id}</p>
        </div>
        <StatusBadge status={job.status} />
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center text-gray-400">
          <MdAccessTime className="mr-2" />
          <span className="font-medium mr-2">Started:</span>
          <span>{formattedStartTime}</span>
        </div>

        {job.completed_at && (
          <div className="flex items-center text-gray-400">
            <MdCheckCircle className="mr-2" />
            <span className="font-medium mr-2">Completed:</span>
            <span>{formattedEndTime}</span>
          </div>
        )}

        <div className="flex items-center text-gray-400">
          <span className="font-medium mr-2">Duration:</span>
          <span>{formatDuration(job.started_at, job.completed_at)}</span>
        </div>

        {job.files_copied !== null && job.files_copied !== undefined && (
          <div className="text-gray-400">
            <span className="font-medium">Files Copied:</span> {job.files_copied.toLocaleString()}
          </div>
        )}

        {job.total_size_bytes !== null && job.total_size_bytes !== undefined && (
          <div className="text-gray-400">
            <span className="font-medium">Total Size:</span> {formatBytes(job.total_size_bytes)}
          </div>
        )}

        {job.status === 'failed' && job.error_message && (
          <div className="mt-3 p-2 bg-red-900/30 border border-red-500/50 rounded text-xs text-red-300">
            <span className="font-medium">Error:</span> {job.error_message}
          </div>
        )}
      </div>
    </div>
  );
}