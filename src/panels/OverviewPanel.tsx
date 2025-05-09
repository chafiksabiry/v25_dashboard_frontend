import React from 'react';

const OverviewPanel = () => {
  const handleClick = () => {
    window.location.href = "/comporchestrator";
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <button
        onClick={handleClick}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-2xl shadow-lg transition duration-300 ease-in-out"
      >
        Orchestrator
      </button>
    </div>
  );
};

export default OverviewPanel;
