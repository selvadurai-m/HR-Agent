import { LayoutDashboard } from 'lucide-react';
import CreateOptions from './_components/CreateOptions';
import RecentInterviews from './_components/RecentInterviews';

function DashboardC() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-500/20">
          <LayoutDashboard className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-800 via-violet-700 to-violet-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-500 text-sm">
            Welcome back! Here&apos;s your activity overview
          </p>
        </div>
      </div>

      <CreateOptions />
      <RecentInterviews />
    </div>
  );
}

export default DashboardC;
