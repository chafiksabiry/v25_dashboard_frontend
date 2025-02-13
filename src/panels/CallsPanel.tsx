import React, { useState } from 'react';
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
  X
} from 'lucide-react';
import { CallInterface } from '../components/CallInterface';

interface ActiveCall {
  number: string;
  agentId: string;
}

function CallsPanel() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);

  const handleCall = (phoneNumber: string) => {
    // Pour cet exemple, nous utilisons un ID d'agent statique
    // Dans une application réelle, cela viendrait du contexte d'authentification
    // ou des props du composant
    const mockAgentId = '65d8f1234567890123456789';
    setActiveCall({ 
      number: phoneNumber,
      agentId: mockAgentId
    });
  };

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
          <button 
            onClick={() => handleCall('+1234567890')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            New Call
          </button>
        </div>

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
            className={`px-4 py-2 rounded-lg ${
              activeFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setActiveFilter('all')}
          >
            All Calls
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${
              activeFilter === 'incoming'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setActiveFilter('incoming')}
          >
            Incoming
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${
              activeFilter === 'outgoing'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setActiveFilter('outgoing')}
          >
            Outgoing
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${
              activeFilter === 'missed'
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
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <PhoneIncoming className="w-5 h-5 text-green-600" />
                      <span>Incoming</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={`https://i.pravatar.cc/32?img=${i + 10}`}
                        alt="Customer"
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <div className="font-medium">John Smith</div>
                        <div className="text-sm text-gray-500">+1 234 567 890</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">2 hours ago</td>
                  <td className="py-3">4m 12s</td>
                  <td className="py-3">
                    <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-sm">
                      Completed
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <PhoneCall className="w-5 h-5" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <MessageCircle className="w-5 h-5" />
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
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default CallsPanel;