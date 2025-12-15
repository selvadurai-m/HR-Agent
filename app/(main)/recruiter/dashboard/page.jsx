// 'React' import not required and WelcomeContainer unused in this file
'use client';
import CreateOptions from './_components/CreateOptions';
import LatestInterviewsList from './_components/LatestInterviewsList';
import CreditsDisplay from './_components/CreditsDisplay';
import StatCards from './_components/StatCards';

function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <StatCards />

      {/* Credits Display */}
      <CreditsDisplay />

      {/* Quick Actions */}
      <CreateOptions />

      {/* Recent Interviews */}
      <LatestInterviewsList />
    </div>
  );
}

export default Dashboard;
