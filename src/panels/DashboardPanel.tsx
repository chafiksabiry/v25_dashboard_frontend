import React from 'react';

export function DashboardPanel() {
  const handleOrchestratorClick = () => {
    window.location.href = '/auth';
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center overflow-hidden relative" style={{ backgroundColor: 'rgb(243, 244, 246)' }}>
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