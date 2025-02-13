import React, { useState } from 'react';
import {
  Mail,
  Inbox,
  Send,
  Clock,
  Archive,
  Filter,
  Calendar,
  Share2
} from 'lucide-react';

function EmailsPanel() {
  const [activeFilter, setActiveFilter] = useState('inbox');

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Mail className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold">Email Management</h2>
          </div>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            Compose
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Inbox className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Inbox</span>
            </div>
            <div className="text-2xl font-bold">28</div>
            <div className="text-sm text-blue-600">5 unread</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Send className="w-5 h-5 text-green-600" />
              <span className="font-medium">Sent</span>
            </div>
            <div className="text-2xl font-bold">145</div>
            <div className="text-sm text-green-600">This week</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <span className="font-medium">Average Response</span>
            </div>
            <div className="text-2xl font-bold">2.4h</div>
            <div className="text-sm text-yellow-600">Last 7 days</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Archive className="w-5 h-5 text-gray-600" />
              <span className="font-medium">Archived</span>
            </div>
            <div className="text-2xl font-bold">1,254</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <button
            className={`px-4 py-2 rounded-lg ${
              activeFilter === 'inbox'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setActiveFilter('inbox')}
          >
            Inbox
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${
              activeFilter === 'sent'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setActiveFilter('sent')}
          >
            Sent
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${
              activeFilter === 'archived'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setActiveFilter('archived')}
          >
            Archived
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-3">From</th>
                <th className="pb-3">Subject</th>
                <th className="pb-3">Time</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={`https://i.pravatar.cc/32?img=${i + 15}`}
                        alt="Sender"
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <div className="font-medium">Sarah Johnson</div>
                        <div className="text-sm text-gray-500">sarah@example.com</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">Question about product features</td>
                  <td className="py-3">3 hours ago</td>
                  <td className="py-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
                      New
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Mail className="w-5 h-5" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Archive className="w-5 h-5" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default EmailsPanel;