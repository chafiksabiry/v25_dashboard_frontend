import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { store } from './store';
import { AuthProvider } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import DashboardPanel from './panels/DashboardPanel';
import CompanyProfilePanel from './panels/CompanyProfilePanel';
import LeadManagementPanel from './panels/LeadManagementPanel';
import RepMatchingPanel from './panels/RepMatchingPanel';
import SchedulerPanel from './panels/SchedulerPanel';
import CallsPanel from './panels/CallsPanel';
import EmailsPanel from './panels/EmailsPanel';
import ChatPanel from './panels/ChatPanel';
import CallReportCard from './components/CallReport';
import GigsPanel from './panels/GigsPanel';
import QualityAssurancePanel from './panels/QualityAssurancePanel';
import OperationsPanel from './panels/OperationsPanel';
import AnalyticsPanel from './panels/AnalyticsPanel';
import IntegrationsPanel from './panels/IntegrationsPanel';
import SettingsPanel from './panels/SettingsPanel';
import KnowledgeBase from './panels/KnowledgeBase';
import KnowledgeInsights from './panels/KnowledgeInsights';
import MatchingDashboard from './panels/MatchingDashboard';

import { setUserId } from "./store/slices/userSlice"; // Import Redux action
import { useDispatch } from "react-redux";
import { useEffect } from "react";

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <Router>
          <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 pl-64">
              <div className="p-8">
                <Routes>
                  <Route path="/dashboardcompany" element={<DashboardPanel />} />
                  <Route path="/" element={<Navigate to="/dashboardcompany" replace />} />
                  {/*<Route path="/dashboardcompany" element={<Navigate to="/dashboardcompany" replace />} />*/}
                  <Route path="/company" element={<CompanyProfilePanel />} />
                  <Route path="/leads" element={<LeadManagementPanel />} />
                  <Route path="/rep-matching" element={<RepMatchingPanel />} />
                  <Route path="/scheduler" element={<SchedulerPanel />} />
                  <Route path="/calls" element={<CallsPanel />} />
                  <Route path="/call-report" element={<CallReportCard />} />
                  <Route path="/emails" element={<EmailsPanel />} />
                  <Route path="/chat" element={<ChatPanel />} />
                  <Route path="/gigs" element={<GigsPanel />} />
                  <Route path="/quality-assurance" element={<QualityAssurancePanel />} />
                  <Route path="/operations" element={<OperationsPanel />} />
                  <Route path="/analytics" element={<AnalyticsPanel />} />
                  <Route path="/integrations" element={<IntegrationsPanel />} />
                  <Route path="/settings" element={<SettingsPanel />} />
                  <Route path="/knowledge-base" element={<KnowledgeBase />} />
                <Route path="/kb-insight" element={<KnowledgeInsights />} />
                <Route path="/matching" element={<MatchingDashboard />} />

                </Routes>
              </div>
            </div>
          </div>
          <ToastContainer />
        </Router>
      </AuthProvider>
    </Provider>
  );
}

export default App;