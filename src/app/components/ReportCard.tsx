interface ReportsOverviewProps {
  totalJobs: number;
  successfulJobs: number;
  failedJobs: number;
  runningJobs: number;
}

const StatCard = ({ title, value, colorClass, percentage }: { 
  title: string; 
  value: number; 
  colorClass: string;
  percentage?: string;
}) => (
  <div className={`bg-gray-800 p-4 rounded-lg shadow-md flex flex-col items-center justify-center text-center border-l-4 ${colorClass}`}>
    <span className="text-3xl font-bold text-white">{value}</span>
    <span className="text-sm text-gray-400 mt-1">{title}</span>
    {percentage && (
      <span className="text-xs text-gray-500 mt-1">{percentage}</span>
    )}
  </div>
);

export default function ReportsOverview({
  totalJobs,
  successfulJobs,
  failedJobs,
  runningJobs,
}: ReportsOverviewProps) {
  const successRate = totalJobs > 0 ? ((successfulJobs / totalJobs) * 100).toFixed(1) : '0.0';
  const failureRate = totalJobs > 0 ? ((failedJobs / totalJobs) * 100).toFixed(1) : '0.0';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard 
        title="Total Jobs" 
        value={totalJobs} 
        colorClass="border-blue-500" 
      />
      <StatCard 
        title="Successful" 
        value={successfulJobs} 
        colorClass="border-green-500"
        percentage={`${successRate}%`}
      />
      <StatCard 
        title="Failed" 
        value={failedJobs} 
        colorClass="border-red-500"
        percentage={`${failureRate}%`}
      />
      <StatCard 
        title="Running" 
        value={runningJobs} 
        colorClass="border-yellow-500"
      />
    </div>
  );
}