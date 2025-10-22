// src/components/TaskDialog.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { type Task } from './TaskCard';

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
interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: Partial<Task>, isEditing: boolean) => void;
  taskToEdit?: Task | null;
  computers: Computer[];
}

export default function TaskDialog({ isOpen, onClose, onSubmit, taskToEdit, computers }: TaskDialogProps) {
  const isEditing = !!taskToEdit;
  const [formData, setFormData] = useState<Partial<Task>>({});
  const [selectedComputer, setSelectedComputer] = useState<Computer | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (isEditing && taskToEdit) {
        setFormData({
            ...taskToEdit,
            folder_prefix: taskToEdit.folder_prefix ?? '',
            timestamp_format: taskToEdit.timestamp_format ?? '',
            discord_webhook_url: taskToEdit.discord_webhook_url ?? '',
            notification_on_success: taskToEdit.notification_on_success ?? '',
            notification_on_failure: taskToEdit.notification_on_failure ?? '',
        });
        const computer = computers.find(c => c.id === taskToEdit.computer_id);
        setSelectedComputer(computer || null);
      } else {

        const firstComputer = computers[0] || null;
        setFormData({
            computer_id: firstComputer?.id,
            is_active: true,
            folder_prefix: 'backup_',
            timestamp_format: '%Y%m%d_%H%M%S',
            backup_keep_count: null,
            retry_attempts: null,
            retry_delay_seconds: null,
            discord_webhook_url: '',
            notification_on_success: '',
            notification_on_failure: '',
        });
        setSelectedComputer(firstComputer);
      }
    }
  }, [isOpen, isEditing, taskToEdit, computers]);


  useEffect(() => {
    if (selectedComputer) {
      setFormData(prev => ({
        ...prev,
        computer_id: selectedComputer.id,
      }));
    }
  }, [selectedComputer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let parsedValue: string | number | boolean | null = value;

    if (type === 'number') {
        parsedValue = value.trim() === '' ? null : parseInt(value, 10);
        if (parsedValue !== null && parsedValue < 0) parsedValue = 0;
    } else if (type === 'checkbox') {
        parsedValue = (e.target as HTMLInputElement).checked;
    } else if (value.trim() === '' && (name.includes('url') || name.includes('notification'))) {
        parsedValue = null;
    }

    
    setFormData(prev => ({ ...prev, [name]: parsedValue }));

    if (name === 'computer_id') {
      const computer = computers.find(c => c.id === value);
      setSelectedComputer(computer || null);
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.computer_id || !formData.source_path || !formData.destination_path || !formData.schedule) {
        alert('Please fill in all required fields (marked with *)');
        return;
    }
    
    onSubmit({
        ...formData,
        folder_prefix: formData.folder_prefix || null,
        timestamp_format: formData.timestamp_format || null,
        discord_webhook_url: formData.discord_webhook_url || null,
        notification_on_success: formData.notification_on_success || null,
        notification_on_failure: formData.notification_on_failure || null,
    }, isEditing);
  };

  if (!isOpen) return null;

  const keepCountPlaceholder = `Default: ${selectedComputer?.default_backup_keep_count ?? 3}`;
  const retryAttemptsPlaceholder = `Default: ${selectedComputer?.default_retry_attempts ?? 3}`;
  const retryDelayPlaceholder = `Default: ${selectedComputer?.default_retry_delay_seconds ?? 5}`;


  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 text-white space-y-4">
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">{isEditing ? 'Edit Task' : 'Add New Task'}</h2>

          {/* ----- Core Task Details ----- */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="label-text">Task Name <span className="text-red-500">*</span></label>
              <input type="text" id="name" name="name" value={formData.name || ''} onChange={handleChange} required className="input-field"/>
            </div>
            <div>
              <label htmlFor="computer_id" className="label-text">Target Computer <span className="text-red-500">*</span></label>
              <select id="computer_id" name="computer_id" value={formData.computer_id || ''} onChange={handleChange} required className="input-field" disabled={isEditing}>
                 <option value="" disabled>Select a computer</option>
                 {computers.map(comp => (
                   <option key={comp.id} value={comp.id}>{comp.name} ({comp.os || 'N/A'})</option>
                 ))}
              </select>
            </div>
          </div>
           <div>
            <label htmlFor="source_path" className="label-text">Source Path <span className="text-red-500">*</span></label>
            <input type="text" id="source_path" name="source_path" value={formData.source_path || ''} onChange={handleChange} required placeholder="e.g., C:\Users\YourUser\Documents or /home/user/data" className="input-field"/>
          </div>
          <div>
            <label htmlFor="destination_path" className="label-text">Destination Base Folder <span className="text-red-500">*</span></label>
            <input type="text" id="destination_path" name="destination_path" value={formData.destination_path || ''} onChange={handleChange} required placeholder="e.g., D:\Backups or /mnt/nas/backups" className="input-field"/>
          </div>
           <div>
            <label htmlFor="schedule" className="label-text">Schedule (Cron Expression) <span className="text-red-500">*</span></label>
            <input type="text" id="schedule" name="schedule" value={formData.schedule || ''} onChange={handleChange} required placeholder="e.g., 0 2 * * * (Daily at 2 AM)" className="input-field"/>
             <a href="https://crontab.guru/" target="_blank" rel="noopener noreferrer" className="link-text">Cron help</a>
          </div>

          {/* ----- Subfolder Settings ----- */}
           <h3 className="section-title">Subfolder Naming</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label htmlFor="folder_prefix" className="label-text">Folder Prefix</label>
                  <input type="text" id="folder_prefix" name="folder_prefix" value={formData.folder_prefix ?? ''} onChange={handleChange} placeholder="Default: backup_" className="input-field"/>
               </div>
               <div>
                  <label htmlFor="timestamp_format" className="label-text">Timestamp Format</label>
                  <input type="text" id="timestamp_format" name="timestamp_format" value={formData.timestamp_format ?? ''} onChange={handleChange} placeholder="Default: %Y%m%d_%H%M%S" className="input-field"/>
                   <a href="https://docs.python.org/3/library/datetime.html#strftime-and-strptime-format-codes" target="_blank" rel="noopener noreferrer" className="link-text">Format help</a>
               </div>
           </div>

          {/* ----- Backup & Retry Settings (Overrides) ----- */}
           <h3 className="section-title">Backup Retention & Retry (Optional Overrides)</h3>
            <p className="description-text">Leave blank to use defaults from the selected computer.</p>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div>
                  <label htmlFor="backup_keep_count" className="label-text">Keep Count</label>
                  <input type="number" id="backup_keep_count" name="backup_keep_count" value={formData.backup_keep_count ?? ''} onChange={handleChange} min="0" placeholder={keepCountPlaceholder} className="input-field"/>
               </div>
               <div>
                  <label htmlFor="retry_attempts" className="label-text">Retry Attempts</label>
                  <input type="number" id="retry_attempts" name="retry_attempts" value={formData.retry_attempts ?? ''} onChange={handleChange} min="0" placeholder={retryAttemptsPlaceholder} className="input-field"/>
               </div>
               <div>
                  <label htmlFor="retry_delay_seconds" className="label-text">Retry Delay (sec)</label>
                  <input type="number" id="retry_delay_seconds" name="retry_delay_seconds" value={formData.retry_delay_seconds ?? ''} onChange={handleChange} min="0" placeholder={retryDelayPlaceholder} className="input-field"/>
               </div>
           </div>
           
            {/* ----- Notification Settings ----- */}
            <h3 className="section-title">Notifications (Optional)</h3>
             <div>
                <label htmlFor="discord_webhook_url" className="label-text">Discord Webhook URL</label>
                <input type="url" id="discord_webhook_url" name="discord_webhook_url" value={formData.discord_webhook_url ?? ''} onChange={handleChange} placeholder="Enter your Discord webhook URL" className="input-field"/>
            </div>
             <div>
                <label htmlFor="notification_on_success" className="label-text">Success Message</label>
                <textarea id="notification_on_success" name="notification_on_success" value={formData.notification_on_success ?? ''} onChange={handleChange} rows={2} placeholder="e.g., ✅ Backup task '[Task Name]' completed successfully." className="input-field"></textarea>
            </div>
            <div>
                <label htmlFor="notification_on_failure" className="label-text">Failure Message</label>
                <textarea id="notification_on_failure" name="notification_on_failure" value={formData.notification_on_failure ?? ''} onChange={handleChange} rows={2} placeholder="e.g., ❌ Backup task '[Task Name]' failed!" className="input-field"></textarea>
            </div>

          {/* ----- Activation Toggle ----- */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-700">
            <span className="text-sm font-medium text-gray-300">Enable Task</span>
            <label htmlFor="is_active" className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" id="is_active" name="is_active" checked={formData.is_active ?? true} onChange={handleChange} className="sr-only peer"/>
               <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* ----- Action Buttons ----- */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
            <button type="button" onClick={onClose} className="button-secondary">Cancel</button>
            <button type="submit" className="button-primary">
              {isEditing ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}