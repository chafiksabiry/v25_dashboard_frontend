import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Star,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  Clock,
  DollarSign,
  Building2,
  MapPin,
  Tags,
  BarChart2,
  ArrowUpRight,
  ArrowDownRight,
  Brain,
  Sparkles,
  Bot,
  FileText,
  Edit,
  Trash2,
  Upload
} from 'lucide-react';
import { useLeads } from '../hooks/useLeads';
import { LeadUploader } from '../components/LeadUploader';

function LeadManagementPanel() {
  const { leads, loading, error, analyzeLead, generateScript, generateResponse } = useLeads();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold">Lead Management</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowNewLeadModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Lead
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Import Leads
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Total Leads</span>
            </div>
            <div className="text-2xl font-bold">156</div>
            <div className="text-sm text-green-600 flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" />
              12% increase
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="font-medium">Pipeline Value</span>
            </div>
            <div className="text-2xl font-bold">$1.2M</div>
            <div className="text-sm text-green-600 flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" />
              8% increase
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-5 h-5 text-purple-600" />
              <span className="font-medium">AI Score</span>
            </div>
            <div className="text-2xl font-bold">85%</div>
            <div className="text-sm text-green-600 flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" />
              5% increase
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <span className="font-medium">Avg Response</span>
            </div>
            <div className="text-2xl font-bold">2.4h</div>
            <div className="text-sm text-red-600 flex items-center gap-1">
              <ArrowDownRight className="w-4 h-4" />
              3% increase
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search leads..."
                className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Filter className="w-5 h-5 text-gray-400" />
          </div>

          <div className="flex gap-2">
            {['all', 'new', 'contacted', 'qualified', 'proposal', 'won'].map((filter) => (
              <button
                key={filter}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-3">Lead Details</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Value</th>
                <th className="pb-3">AI Insights</th>
                <th className="pb-3">Last Contact</th>
                <th className="pb-3">Next Action</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {leads?.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="py-3">
                    <div>
                      <div className="font-medium">{lead.name}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {lead.company}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {lead.email}
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">
                      {lead.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <div>
                      <div className="font-medium">${lead.value?.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">{lead.probability}% probability</div>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Brain className="w-4 h-4 text-purple-600" />
                        <span>Score: {lead.metadata?.ai_analysis?.score || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Sparkles className="w-4 h-4 text-yellow-600" />
                        <span>{lead.metadata?.ai_analysis?.sentiment || 'N/A'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <div>
                      <div className="text-sm">{new Date(lead.updated_at).toLocaleDateString()}</div>
                      <div className="text-sm text-gray-500">Email</div>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="text-sm">Follow-up</div>
                    <div className="text-sm text-gray-500">Tomorrow</div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => analyzeLead(lead)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-purple-600"
                        title="AI Analysis"
                      >
                        <Brain className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => generateScript(lead, 'email')}
                        className="p-2 hover:bg-gray-100 rounded-lg text-blue-600"
                        title="Generate Script"
                      >
                        <Bot className="w-5 h-5" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Edit className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <LeadUploader
              onComplete={() => {
                setShowUploadModal(false);
              }}
              onClose={() => setShowUploadModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default LeadManagementPanel;