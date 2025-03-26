import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
                  <Route path="/" element={<DashboardPanel />} />
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