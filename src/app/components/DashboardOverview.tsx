interface OverviewProps {
  totalComputers: number;
  onlineComputers: number;
  offlineComputers: number;
  totalTasks: number;
}


const StatCard = ({ title, value, colorClass }: { title: string; value: number; colorClass: string }) => (
  <div className={`bg-gray-800 p-4 rounded-lg shadow-md flex flex-col items-center justify-center text-center border-l-4 ${colorClass}`}>
    <span className="text-3xl font-bold text-white">{value}</span>
    <span className="text-sm text-gray-400 mt-1">{title}</span>
  </div>
);

export default function DashboardOverview({
  totalComputers,
  onlineComputers,
  offlineComputers,
  totalTasks,
}: OverviewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard title="Total Computers" value={totalComputers} colorClass="border-blue-500" />
      <StatCard title="Online" value={onlineComputers} colorClass="border-green-500" />
      <StatCard title="Offline" value={offlineComputers} colorClass="border-red-500" />
      <StatCard title="Total Tasks" value={totalTasks} colorClass="border-yellow-500" />
    </div>
  );
}