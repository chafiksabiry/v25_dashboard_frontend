import { LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function DashboardPanel() {
  const { logout } = useAuth();
  const handleOrchestratorClick = () => {
    window.location.href = '/auth';
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center overflow-hidden relative" style={{ backgroundColor: 'rgb(243, 244, 246)' }}>
      {/* Logout Button - Top Right */}
      <div className="absolute top-8 right-8">
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 rounded-lg shadow-sm border border-red-100 hover:bg-red-50 hover:shadow-md transition-all duration-200 font-medium"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>

      {/* Orchestrator Button - Centered */}
      <button
        onClick={handleOrchestratorClick}
        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl text-xl"
      >
        Orchestrator
      </button>
    </div>
  );
}

export default DashboardPanel;