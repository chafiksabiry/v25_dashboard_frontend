import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Mail,
  Inbox,
  Send,
  Clock,
  Archive,
  Share2
} from 'lucide-react';

function EmailsPanel() {
  const [activeFilter, setActiveFilter] = useState('inbox');
  const [gmailStatus, setGmailStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const userId = "65d2b8f4e45a3c5a12e8f123"; // Replace with dynamic user ID if needed

  useEffect(() => {
    const fetchGmailStatus = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL_INTEGRATIONS}/gmail/gmail-status?userId=${userId}`);

        if (response.data.success) {
          setGmailStatus(response.data.status);
        } else {
          throw new Error("Failed to fetch Gmail status.");
        }
      } catch (err) {
        console.error("Error fetching Gmail status:", err);
        setError("Failed to load Gmail integration status.");
      } finally {
        setLoading(false);
      }
    };

    fetchGmailStatus();
  }, [userId]);

  // ✅ Show modal when trying to perform an action while Gmail is not connected
  const handleRestrictedAction = () => {
    if (gmailStatus !== "connected") {
      setShowModal(true);
      
    }
  };

  return (
    <div className="space-y-6">
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Gmail is not connected</h2>
            <p className="mb-4">Please connect your Gmail account to access emails.</p>
            <button 
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Mail className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold">Email Management</h2>
          </div>
          <button 
            onClick={handleRestrictedAction}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
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
            onClick={handleRestrictedAction}
            className={`px-4 py-2 rounded-lg ${
              activeFilter === 'inbox'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Inbox
          </button>
          <button
            onClick={handleRestrictedAction}
            className={`px-4 py-2 rounded-lg ${
              activeFilter === 'sent'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Sent
          </button>
          <button
            onClick={handleRestrictedAction}
            className={`px-4 py-2 rounded-lg ${
              activeFilter === 'archived'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
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
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="py-3">Sarah Johnson</td>
                  <td className="py-3">Question about product features</td>
                  <td className="py-3">3 hours ago</td>
                  <td className="py-3">
                    <button onClick={handleRestrictedAction} className="p-2 hover:bg-gray-100 rounded-lg">
                      <Mail className="w-5 h-5" />
                    </button>
                    <button onClick={handleRestrictedAction} className="p-2 hover:bg-gray-100 rounded-lg">
                      <Archive className="w-5 h-5" />
                    </button>
                    <button onClick={handleRestrictedAction} className="p-2 hover:bg-gray-100 rounded-lg">
                      <Share2 className="w-5 h-5" />
                    </button>
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
