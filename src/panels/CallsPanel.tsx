import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { callsApi, Call } from "../services/api/calls";
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Clock,
  Filter,
  Calendar,
  PhoneCall,
  MessageCircle,
  Share2,
  LineChart,
  PieChart,
  X,
  Info
} from 'lucide-react';
import { CallInterface } from '../components/CallInterface';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface ActiveCall {
  number: string;
  agentId: string;
}

function CallsPanel() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [allCalls, setCalls] = useState<Call[]>([]);
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();


  const handleCall = (phoneNumber: string) => {
    const phoneRegex = /^\+([1-9]{1,4})\d{1,14}$/;  // Expression régulière pour valider le numéro international
    if (phoneRegex.test(phoneNumber)) {
      const mockAgentId = '65d8f1234567890123456789';  // ID agent statique
      setActiveCall({
        number: phoneNumber,
        agentId: mockAgentId
      });
      setShowPhoneInput(false);
      setError('');
    } else {
      setError('Please enter a valid international phone number (e.g. +13024440090)');
    }
  };

  const fetchCalls = async () => {
    try {
      setLoading(true);
      const response = await callsApi.getAll(); // Fetch calls from API
      console.log("response :", response)
      setCalls(response.data);
    } catch (err) {
      console.error("Error fetching calls:", err);
      setError("Failed to load calls.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Phone className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold">Calls Dashboard</h2>
          </div>
          {!showPhoneInput ? (
            <button
              onClick={() => setShowPhoneInput(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              New Call
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter phone number"
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={() => handleCall(phoneNumber)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Call
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-100 text-red-600 text-sm p-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <PhoneIncoming className="w-5 h-5 text-green-600" />
              <span className="font-medium">Incoming</span>
            </div>
            <div className="text-2xl font-bold">24</div>
            <div className="text-sm text-green-600">Last 24 hours</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <PhoneOutgoing className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Outgoing</span>
            </div>
            <div className="text-2xl font-bold">18</div>
            <div className="text-sm text-blue-600">Last 24 hours</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <span className="font-medium">Average Duration</span>
            </div>
            <div className="text-2xl font-bold">5m 23s</div>
            <div className="text-sm text-yellow-600">This week</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <PhoneMissed className="w-5 h-5 text-red-600" />
              <span className="font-medium">Missed</span>
            </div>
            <div className="text-2xl font-bold">3</div>
            <div className="text-sm text-red-600">Today</div>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <button
            className={`px-4 py-2 rounded-lg ${activeFilter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            onClick={() => setActiveFilter('all')}
          >
            All Calls
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${activeFilter === 'incoming'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            onClick={() => setActiveFilter('incoming')}
          >
            Incoming
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${activeFilter === 'outgoing'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            onClick={() => setActiveFilter('outgoing')}
          >
            Outgoing
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${activeFilter === 'missed'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            onClick={() => setActiveFilter('missed')}
          >
            Missed
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-3">Type</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Time</th>
                <th className="pb-3">Duration</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {Array.isArray(allCalls) && allCalls.map((call, index) => (
                <tr key={call._id} className="hover:bg-gray-50">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      {call.direction === "inbound" ? (
                        <PhoneIncoming className="w-5 h-5 text-green-600" />
                      ) : (
                        <PhoneOutgoing className="w-5 h-5 text-blue-600" />
                      )}
                      <span>{call.direction.charAt(0).toUpperCase() + call.direction.slice(1)}</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={`https://i.pravatar.cc/32?img=${index + 10}`}
                        alt="Customer"
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <div className="font-medium">{(call.lead) ? call.lead.name : ""}</div>
                        <div className="text-sm text-gray-500">{(call.lead) ? call.lead.phone : ""}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">{new Date(call.createdAt).toLocaleString()}</td>
                  <td className="py-3">{call.duration} sec</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${call.status === "completed"
                        ? "bg-green-100 text-green-600"
                        : call.status === "missed"
                          ? "bg-red-100 text-red-600"
                          : "bg-gray-100 text-gray-600"
                        }`}
                    >
                      {call.status.charAt(0).toUpperCase() + call.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        onClick={() => handleCall(call.lead.phone)}
                      >
                        <PhoneCall className="w-5 h-5" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <MessageCircle className="w-5 h-5" />
                      </button>
                      <button
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        onClick={() => navigate(`/call-report`, { state: { call } })}
                      >
                        <Info className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {activeCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
            <button
              onClick={() => setActiveCall(null)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            <CallInterface
              phoneNumber={activeCall.number}
              agentId={activeCall.agentId}
              onEnd={() => setActiveCall(null)}
              onCallSaved={fetchCalls}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default CallsPanel;