import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, Send, Loader2 } from 'lucide-react';

function ChatPanel() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [isWhatsAppConnected, setIsWhatsAppConnected] = useState(false);
  const userId = "65d2b8f4e45a3c5a12e8f123";

  useEffect(() => {
    const checkWhatsAppConnection = async () => {
      try {
        const response = await axios.get(`http://localhost:5009/api/whatsapp/status?userId=${userId}`);
        setIsWhatsAppConnected(response.data?.success && response.data.status === 'connected');
      } catch (error) {
        console.error('Failed to check WhatsApp connection:', error);
        setIsWhatsAppConnected(false);
      }
    };
    checkWhatsAppConnection();
  }, [userId]);

  useEffect(() => {
    if (!isWhatsAppConnected) return;

    const fetchConversations = async () => {
      try {
        const response = await axios.get(`http://localhost:5009/api/conversations?userId=${userId}`);
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
      try {
        const response = await axios.get(`http://localhost:5009/api/whatsapp/messages?contact=${activeChat}`);
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
      const response = await axios.post('http://localhost:5009/api/whatsapp/send', {
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
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-100 p-4 border-r">
        <h3 className="text-lg font-semibold mb-4">Conversations ({conversations.length})</h3>
        <ul>
          {conversations.map((chat, index) => (
            <li key={index} onClick={() => setActiveChat(chat.contact)} className="cursor-pointer p-2 hover:bg-gray-200 rounded">
              {chat.contact}
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Panel */}
      <div className="flex-1 space-y-6 p-6 bg-white rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-green-600" /> Live Chat
          </h2>
        </div>

        <div className="mb-4">
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter phone number..."
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="h-96 p-4 bg-gray-50 overflow-y-auto border rounded-lg flex flex-col">
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

        <div className="p-4 border-t flex gap-2">
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
  );
}

export default ChatPanel;
