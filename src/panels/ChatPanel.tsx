import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Users,
  Clock,
  CheckCircle2,
  Video,
  Share2,
  BarChart2,
} from "lucide-react";

function ChatPanel() {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);

  const fetchChats = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/zoho/chats");
      console.log("status de la réponse :", response.status); // Log du code de statut
      console.log("headers de la réponse :", response.headers); // Log des headers pour le débogage

      if (!response.ok) {
        throw new Error(
          `Échec de la récupération des chats : ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Données reçues :", data); // Log des données de réponse

      setChats(data.data || []); // Assurez-vous d'utiliser le bon format des données
    } catch (error) {
      console.error("Erreur lors de la récupération des chats :", error);
    }
  };

  const fetchChatMessages = async (chatId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/zoho/chats/1631/transcript`);
      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des messages : ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Messages reçus :", data);
  
      setChatMessages(data.data || []);
      setActiveChat(chatId);
    } catch (error) {
      console.error("Erreur lors de la récupération des messages :", error);
    }
  };
  

  // Fetch chats when the component is mounted
  useEffect(() => {
    fetchChats();
  }, []);

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
            <div className="text-2xl font-bold">{chats.length}</div>
            <div className="text-sm text-blue-600">Online now</div>
          </div>
          {/* Other stats */}
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-1 border rounded-lg overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h3 className="font-semibold">Active Conversations</h3>
            </div>
            <div className="divide-y">
              {chats.map((chat: any) => (
                <button
                  key={chat.chat_id} // Use unique id from the chat object
                  className="w-full p-4 text-left hover:bg-gray-50 flex items-center gap-3"
                  onClick={() => setActiveChat(chat.chat_id)}
                >
                  <img
                    src={`https://i.pravatar.cc/32?img=${chat.chat_id}`} // Example placeholder image
                    alt="Customer"
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="font-medium">
                      {chat.visitor_name || "Customer"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {chat.time || "2 min ago"}
                    </div>
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
              {/* Chat messages */}
              <div className="text-center text-gray-500 mt-32">
                {activeChat
                  ? `Chat with ${activeChat}`
                  : "Select a conversation to start chatting"}
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
