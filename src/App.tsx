import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
//import { Provider } from 'react-redux';
import Providers from "./Providers";
import { ToastContainer } from 'react-toastify';
//import { store } from './store';
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
import { setUserId } from "./store/slices/userSlice"; // Import Redux action
import { useDispatch } from "react-redux";
import { useEffect } from "react";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const staticUserId = "65d2b8f4e45a3c5a12e8f123"; // ✅ Static test user ID
    localStorage.setItem("userId", staticUserId); // ✅ Store in localStorage
    dispatch(setUserId(staticUserId)); // ✅ Store in Redux for global access
  }, []);
  return (
    <Providers >
      <Router>
        <div className="flex min-h-screen bg-gray-100">
          <Sidebar />
          <div className="flex-1 pl-64">
            <div className="p-8">
              <Routes>
                <Route path="/" element={<DashboardPanel />} />
                <Route path="/app7" element={<DashboardPanel />} />
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
              </Routes>
            </div>
          </div>
        </div>
        <ToastContainer />
      </Router>
    </Providers>
  );
}

export default App;