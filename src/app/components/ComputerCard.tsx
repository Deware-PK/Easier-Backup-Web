import { FaServer, FaTasks } from 'react-icons/fa'; // ไอคอนตัวอย่าง

export interface Computer {
  id: string;
  name: string;
  os?: string | null;
  status: 'online' | 'offline';
  last_seen_at?: Date | string | null;
  taskCount: number;
}

interface ComputerCardProps {
  computer: Computer;
}

export default function ComputerCard({ computer }: ComputerCardProps) {
  const isOnline = computer.status === 'online';
  const statusColor = isOnline ? 'text-green-400' : 'text-red-400';
  const statusBorder = isOnline ? 'border-green-500' : 'border-red-500';

  // Format เวลา Last Seen (ถ้ามี)
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

  return (
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
      </div>
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-700">
         <div className="flex items-center space-x-1 text-gray-400 text-sm">
             <FaTasks />
             <span>{computer.taskCount} Tasks</span>
         </div>
        <button className="text-xs text-blue-400 hover:text-blue-300">
          View Details
        </button>
      </div>
    </div>
  );
}