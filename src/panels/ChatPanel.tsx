import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  MessageSquare,
  Users,
  Clock,
  CheckCircle2,
  Video,
  Share2,
  BarChart2,
  Send,
  Loader2
} from 'lucide-react';

function ChatPanel() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [isWhatsAppConnected, setIsWhatsAppConnected] = useState(false);
  const userId = "65d2b8f4e45a3c5a12e8f123";

  /*useEffect(() => {
    const checkWhatsAppConnection = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL_INTEGRATIONS}/whatsapp/status?userId=${userId}`);
        setIsWhatsAppConnected(response.data?.success && response.data.status === 'connected');
      } catch (error) {
        console.error('Failed to check WhatsApp connection:', error);
        setIsWhatsAppConnected(false);
      }
    };
    checkWhatsAppConnection();
  }, [userId]);*/

  useEffect(() => {
    if (!isWhatsAppConnected) return;

    const fetchConversations = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL_INTEGRATIONS}/whatsapp/conversations?userId=${userId}`);
        if (response.data.success) {
          setConversations(response.data.conversations);
        }
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
      }
    };
    fetchConversations();
  }, [isWhatsAppConnected]);

  useEffect(() => {
    if (!activeChat) return;

    const fetchMessages = async () => {
      console.log('Fetching messages for:', activeChat);
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL_INTEGRATIONS}/whatsapp/messages?contact=${activeChat}`);
        console.log('Messages fetched:', response.data);
        setMessages(response.data || []);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      }
    };
    fetchMessages();
  }, [activeChat]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !phoneNumber.trim()) return;
    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL_INTEGRATIONS}/whatsapp/send`, {
        userId,
        to: phoneNumber,
        text: newMessage,
      });
      if (response.data.success) {
        setMessages(prev => [...prev, { text: newMessage, fromMe: true, timestamp: new Date().toISOString() }]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
    setLoading(false);
  };

  if (!isWhatsAppConnected) {
    return (
      <div className="space-y-6 p-6 bg-white rounded-xl shadow-sm">
        <div className="text-center text-gray-500">WhatsApp is not connected. Please integrate WhatsApp from the Integrations Panel.</div>
      </div>
    );
  }

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
              {conversations.map((chat, index) => (
                <button
                  key={index}
                  className="w-full p-4 text-left hover:bg-gray-50 flex items-center gap-3"
                  onClick={() => {
                    console.log('Selected chat:', chat.contact);
                    setActiveChat(chat.contact);
                    setPhoneNumber(chat.contact); // Autofill phone number
                  }}
                >
                  <img
                    src={`https://i.pravatar.cc/32?img=${index + 20}`}
                    alt="Customer"
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="font-medium">{chat.contact}</div>
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
                  <div className="font-medium">{activeChat}</div>
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
            <div className="h-96 p-4 bg-gray-50 overflow-y-auto">
              {messages.length ? (
                messages.map((msg, index) => (
                  <div key={index} className={`p-3 my-1 rounded-lg max-w-xs ${msg.fromMe ? 'bg-green-200 self-end' : 'bg-gray-200 self-start'}`}>
                    <div className="text-sm">{msg.text}</div>
                    <div className="text-xs text-gray-500 text-right">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 mt-32">No messages yet</div>
              )}
            </div>
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button 
                  onClick={sendMessage} 
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                >
                  {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
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