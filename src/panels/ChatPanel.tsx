import React, { useState } from 'react';
import {
  MessageSquare,
  Users,
  Clock,
  CheckCircle2,
  Video,
  Share2,
  BarChart2
} from 'lucide-react';

function ChatPanel() {
  const [activeChat, setActiveChat] = useState(null);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold">Live Chat</h2>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
              Settings
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              New Chat
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Active Chats</span>
            </div>
            <div className="text-2xl font-bold">12</div>
            <div className="text-sm text-blue-600">Online now</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="font-medium">Resolved</span>
            </div>
            <div className="text-2xl font-bold">48</div>
            <div className="text-sm text-green-600">Today</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <span className="font-medium">Average Time</span>
            </div>
            <div className="text-2xl font-bold">8m</div>
            <div className="text-sm text-yellow-600">Response time</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <BarChart2 className="w-5 h-5 text-purple-600" />
              <span className="font-medium">Satisfaction</span>
            </div>
            <div className="text-2xl font-bold">94%</div>
            <div className="text-sm text-purple-600">Last 7 days</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-1 border rounded-lg overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h3 className="font-semibold">Active Conversations</h3>
            </div>
            <div className="divide-y">
              {[1, 2, 3, 4].map((i) => (
                <button
                  key={i}
                  className="w-full p-4 text-left hover:bg-gray-50 flex items-center gap-3"
                  onClick={() => setActiveChat(i)}
                >
                  <img
                    src={`https://i.pravatar.cc/32?img=${i + 20}`}
                    alt="Customer"
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="font-medium">John Smith</div>
                    <div className="text-sm text-gray-500">2 min ago</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="col-span-2 border rounded-lg">
            <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="https://i.pravatar.cc/32?img=21"
                  alt="Customer"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <div className="font-medium">John Smith</div>
                  <div className="text-sm text-gray-500">Online</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-200 rounded-lg">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-gray-200 rounded-lg">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="h-96 p-4 bg-gray-50">
              {/* Chat messages would go here */}
              <div className="text-center text-gray-500 mt-32">
                Select a conversation to start chatting
              </div>
            </div>
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatPanel;