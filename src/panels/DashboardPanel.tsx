import React, { useState } from 'react';
import {
  CreditCard,
  CircleDollarSign,
  ArrowUpRight,
  Banknote,
  Clock,
  AlertCircle,
  ArrowDownRight,
  Brain,
  Mic,
  Bot,
  Sparkles,
  Target,
  Phone,
  Mail,
  MessageSquare,
  Users,
  ScrollText,
  Network,
  Boxes,
  FileSpreadsheet,
  Plug,
  Webhook,
  Link2,
  ServerCog,
  Database as DatabaseIcon,
  Building2,
  UserCog,
  Shield,
  ShieldCheck,
  Lock,
  FileKey,
  Fingerprint,
  KeyRound,
  ArrowRightLeft,
  History,
  ShieldAlert,
  Landmark,
  CheckCircle2
} from 'lucide-react';

function PaymentManagement() {
  const handleNewTransaction = () => {
    console.log('New transaction clicked');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-lg">
            <CreditCard className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold">Payment Management</h2>
        </div>
        <button 
          onClick={handleNewTransaction}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          New Transaction
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CircleDollarSign className="w-5 h-5 text-blue-600" />
            <span className="font-medium">Total Revenue</span>
          </div>
          <div className="text-2xl font-bold">$24,500</div>
          <div className="text-sm text-green-600 flex items-center gap-1">
            <ArrowUpRight className="w-4 h-4" />
            8% increase
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Banknote className="w-5 h-5 text-green-600" />
            <span className="font-medium">Payments</span>
          </div>
          <div className="text-2xl font-bold">1,543</div>
          <div className="text-sm text-green-600 flex items-center gap-1">
            <ArrowUpRight className="w-4 h-4" />
            12% increase
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <span className="font-medium">Pending</span>
          </div>
          <div className="text-2xl font-bold">64</div>
          <div className="text-sm text-red-600 flex items-center gap-1">
            <ArrowDownRight className="w-4 h-4" />
            3% increase
          </div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="font-medium">Failed</span>
          </div>
          <div className="text-2xl font-bold">12</div>
          <div className="text-sm text-green-600 flex items-center gap-1">
            <ArrowUpRight className="w-4 h-4" />
            2% decrease
          </div>
        </div>
      </div>
    </div>
  );
}

function AICoachingSection() {
  const startSession = () => {
    console.log('Starting AI coaching session');
  };

  const handleVoiceAnalysis = () => {
    console.log('Starting voice analysis');
  };

  const handleConversationPractice = () => {
    console.log('Starting conversation practice');
  };

  const handleViewInsights = () => {
    console.log('Viewing AI insights');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Brain className="w-6 h-6 text-purple-600" />
          </div>
          <h2 className="text-xl font-semibold">AI Coaching</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={startSession} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            Start Session
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Mic className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold">Voice Analysis</h3>
          </div>
          <p className="text-gray-600 mb-4">Real-time voice analysis for tone and clarity improvement</p>
          <button onClick={handleVoiceAnalysis} className="w-full px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50">
            Analyze
          </button>
        </div>
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Bot className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold">Conversation AI</h3>
          </div>
          <p className="text-gray-600 mb-4">Practice customer interactions with AI-powered scenarios</p>
          <button onClick={handleConversationPractice} className="w-full px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50">
            Practice
          </button>
        </div>
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold">Performance Insights</h3>
          </div>
          <p className="text-gray-600 mb-4">Get AI-powered suggestions for improvement</p>
          <button onClick={handleViewInsights} className="w-full px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50">
            View Insights
          </button>
        </div>
      </div>
    </div>
  );
}

function LeadManagementSection() {
  const handleAddLead = () => {
    console.log('Adding new lead');
  };

  const handleCall = (id: string) => {
    console.log('Initiating call', id);
  };

  const handleEmail = (id: string) => {
    console.log('Composing email', id);
  };

  const handleChat = (id: string) => {
    console.log('Starting chat', id);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Target className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold">Lead Management</h2>
        </div>
        <button onClick={handleAddLead} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Add Lead
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b">
              <th className="pb-3">Name</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Value</th>
              <th className="pb-3">Last Contact</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {[1, 2, 3].map((i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <img
                      src={`https://i.pravatar.cc/32?img=${i + 10}`}
                      alt="Contact"
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <div className="font-medium">John Smith</div>
                      <div className="text-sm text-gray-500">+1 234 567 890</div>
                    </div>
                  </div>
                </td>
                <td className="py-3">
                  <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-sm">
                    Active
                  </span>
                </td>
                <td className="py-3">$5,000</td>
                <td className="py-3">2 hours ago</td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleCall('1')} className="p-2 hover:bg-gray-100 rounded-lg">
                      <Phone className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleEmail('1')} className="p-2 hover:bg-gray-100 rounded-lg">
                      <Mail className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleChat('1')} className="p-2 hover:bg-gray-100 rounded-lg">
                      <MessageSquare className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TeamCollaborationSection() {
  const handleNewProject = () => {
    console.log('Creating new project');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 rounded-lg">
            <Users className="w-6 h-6 text-indigo-600" />
          </div>
          <h2 className="text-xl font-semibold">Team Collaboration</h2>
        </div>
        <button onClick={handleNewProject} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          New Project
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <ScrollText className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold">Active Projects</h3>
          </div>
          <div className="text-2xl font-bold mb-2">12</div>
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <img
                key={i}
                src={`https://i.pravatar.cc/32?img=${i + 25}`}
                alt="Team member"
                className="w-8 h-8 rounded-full border-2 border-white"
              />
            ))}
          </div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Network className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold">Team Updates</h3>
          </div>
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-start gap-2">
                <img
                  src={`https://i.pravatar.cc/32?img=${i + 30}`}
                  alt="Team member"
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <div className="text-sm font-medium">Sarah updated Project X</div>
                  <div className="text-xs text-gray-500">2 hours ago</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Boxes className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold">Resources</h3>
          </div>
          <div className="space-y-2">
            <button className="w-full px-4 py-2 text-left hover:bg-gray-50 rounded-lg flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-gray-400" />
              <span>Q1 Reports</span>
            </button>
            <button className="w-full px-4 py-2 text-left hover:bg-gray-50 rounded-lg flex items-center gap-2">
              <ScrollText className="w-5 h-5 text-gray-400" />
              <span>Team Guidelines</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function IntegrationsSection() {
  const handleAddIntegration = () => {
    console.log('Adding new integration');
  };

  const handleConfigureIntegration = (name: string) => {
    console.log('Configuring integration:', name);
  };

  const handleConnect = (name: string) => {
    console.log('Connecting to:', name);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-100 rounded-lg">
            <Plug className="w-6 h-6 text-cyan-600" />
          </div>
          <h2 className="text-xl font-semibold">Integrations</h2>
        </div>
        <button onClick={handleAddIntegration} className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">
          Add Integration
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Webhook className="w-5 h-5 text-cyan-600" />
              <h3 className="font-semibold">Active Integrations</h3>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-sm">
              Connected
            </span>
          </div>
          <div className="space-y-4">
            {[
              { icon: <Link2 className="w-5 h-5" />, name: 'CRM System' },
              { icon: <ServerCog className="w-5 h-5" />, name: 'Help Desk' },
              { icon: <DatabaseIcon className="w-5 h-5" />, name: 'Analytics Platform' },
            ].map((integration, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {integration.icon}
                  <span>{integration.name}</span>
                </div>
                <button onClick={() => handleConfigureIntegration(integration.name)} className="text-cyan-600 hover:text-cyan-700">
                  Configure
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-cyan-600" />
            <h3 className="font-semibold">Available Integrations</h3>
          </div>
          <div className="space-y-4">
            {[
              { icon: <UserCog className="w-5 h-5" />, name: 'HR System' },
              { icon: <Shield className="w-5 h-5" />, name: 'Security Suite' },
              { icon: <ScrollText className="w-5 h-5" />, name: 'Document Management' },
            ].map((integration, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {integration.icon}
                  <span>{integration.name}</span>
                </div>
                <button onClick={() => handleConnect(integration.name)} className="px-3 py-1 border border-cyan-600 text-cyan-600 rounded-lg hover:bg-cyan-50">
                  Connect
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ComplianceSection() {
  const handleSecurityAudit = () => {
    console.log('Starting security audit');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-100 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-rose-600" />
          </div>
          <h2 className="text-xl font-semibold">Compliance & Security</h2>
        </div>
        <button onClick={handleSecurityAudit} className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700">
          Security Audit
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-rose-600" />
            <h3 className="font-semibold">Security Status</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>2FA Enabled</span>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex items-center justify-between">
              <span>SSL Certificate</span>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex items-center justify-between">
              <span>Data Encryption</span>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <FileKey className="w-5 h-5 text-rose-600" />
            <h3 className="font-semibold">Access Control</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-5 h-5 text-gray-400" />
                <span>Biometric Auth</span>
              </div>
              <KeyRound className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-gray-400" />
                <span>API Access</span>
              </div>
              <KeyRound className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-rose-600" />
            <h3 className="font-semibold">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            {[
              { icon: <ShieldAlert className="w-5 h-5" />, text: 'Security scan completed' },
              { icon: <Landmark className="w-5 h-5" />, text: 'Compliance check passed' },
            ].map((activity, i) => (
              <div key={i} className="flex items-center gap-2">
                {activity.icon}
                <span className="text-sm">{activity.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardPanel() {
  return (
    <div className="space-y-6">
      <PaymentManagement />
      <AICoachingSection />
      <LeadManagementSection />
      <TeamCollaborationSection />
      <IntegrationsSection />
      <ComplianceSection />
    </div>
  );
}

export default DashboardPanel;