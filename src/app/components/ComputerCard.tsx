import { useState } from 'react';
import { FaServer, FaTasks } from 'react-icons/fa';
import { FaTrashAlt } from "react-icons/fa";
import { MdEdit } from "react-icons/md";

export interface Computer {
  id: string;
  name: string;
  os?: string | null;
  status: 'online' | 'offline';
  last_seen_at?: Date | string | null;
  taskCount: number;
  default_backup_keep_count?: number | null;
  default_retry_attempts?: number | null;
  default_retry_delay_seconds?: number | null;
}

interface ComputerCardProps {
  computer: Computer;
  onDelete?: (computerId: string) => void;
  onRename?: (computerId: string, newName: string) => void;
}

export default function ComputerCard({ computer, onDelete, onRename }: ComputerCardProps) {
  const isOnline = computer.status === 'online';
  const statusColor = isOnline ? 'text-green-400' : 'text-red-400';
  const statusBorder = isOnline ? 'border-green-500' : 'border-red-500';
  const [apiError, setApiError] = useState(''); 
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'; 

  const formatLastSeen = (dateString: Date | string | null | undefined) => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('th-TH', { 
        year: 'numeric', month: 'short', day: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const handleRenameClick = () => {
    setNewName(computer.name);
    setShowRenameDialog(true);
    setApiError('');
  };

  const handleConfirmRename = async () => {
    if (!newName.trim()) {
      setApiError('Computer name cannot be empty');
      return;
    }

    setIsRenaming(true);
    setApiError('');

    // const token = Cookies.get('SESSION_TOKEN__DO_NOT_SHARE');
    // if (!token) {
    //   setApiError('No authentication token found. Please log in again.');
    //   setIsRenaming(false);
    //   return;
    // }
  
    const headers = { 
      'Content-Type': 'application/json'
    };

    try {
      const response = await fetch(`${backendUrl}/api/v1/computers/${computer.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ name: newName.trim() }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to rename computer');
      }

      setShowRenameDialog(false);
      if (onRename) {
        onRename(computer.id, newName.trim());
      }
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsRenaming(false);
    }
  };

  const handleCancelRename = () => {
    setShowRenameDialog(false);
    setNewName('');
    setApiError('');
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
    setApiError('');
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setApiError('');

    // const token = Cookies.get('SESSION_TOKEN__DO_NOT_SHARE');
    // if (!token) {
    //   setApiError('No authentication token found. Please log in again.');
    //   setIsDeleting(false);
    //   return;
    // }

    const headers = { 'Content-Type': 'application/json' };

    try {
      const response = await fetch(`${backendUrl}/api/v1/computers/${computer.id}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete computer');
      }

      setShowDeleteDialog(false);
      if (onDelete) {
        onDelete(computer.id);
      }
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setApiError('');
  };

  return (
    <>
      <div className={`bg-gray-800 p-4 rounded-lg shadow-md text-white border-t-4 ${statusBorder} flex flex-col justify-between`}>
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <FaServer className={`w-5 h-5 ${statusColor}`} />
              <h3 className="text-lg font-semibold truncate">{computer.name}</h3>
            </div>
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${isOnline ? 'bg-green-600' : 'bg-red-600'}`}>
              {computer.status.toUpperCase()}
            </span>
          </div>
          <div className="text-sm text-gray-400 mb-1">
            <span className="font-medium">OS:</span> {computer.os || 'N/A'}
          </div>
          <div className="text-sm text-gray-400 mb-3">
            <span className="font-medium">Last Seen:</span> {formatLastSeen(computer.last_seen_at)}
          </div>
          {apiError && (
            <div className="text-sm text-red-500 mb-2">
              Error: {apiError}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-700">
          <div className="flex items-center space-x-1 text-gray-400 text-sm">
            <FaTasks />
            <span>{computer.taskCount} Tasks</span>
          </div>

          <div className="justify-around flex items-center space-x-2">
            <button 
              onClick={handleRenameClick}
              className="text-xs text-amber-300 hover:text-amber-200 cursor-pointer" 
              title="Rename computer"
            >
              <MdEdit />
            </button>

            <button 
              onClick={handleDeleteClick}
              className="text-xs text-red-500 hover:text-red-400 cursor-pointer" 
              title="Delete Computer"
            >
              <FaTrashAlt />
            </button>
          </div>
        </div>
      </div>

      {/* Rename Dialog */}
      {showRenameDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">Rename Computer</h3>
            <div className="mb-6">
              <label htmlFor="computerName" className="block text-sm font-medium text-gray-300 mb-2">
                New Computer Name
              </label>
              <input
                id="computerName"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Enter new name"
                disabled={isRenaming}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isRenaming) {
                    handleConfirmRename();
                  }
                }}
              />
              {apiError && (
                <p className="mt-2 text-sm text-red-500">{apiError}</p>
              )}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelRename}
                disabled={isRenaming}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRename}
                disabled={isRenaming || !newName.trim()}
                className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRenaming ? 'Renaming...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">Delete Computer</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete <span className="font-semibold text-white">{computer.name}</span>? 
              If you delete this computer, all associated tasks will also be deleted.
            </p>
            {apiError && (
              <p className="mb-4 text-sm text-red-500">{apiError}</p>
            )}
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}