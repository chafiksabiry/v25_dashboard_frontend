import React, { useEffect, useState } from "react";
import {
  MessageSquare,
  Users,
  Clock,
  CheckCircle2,
  Video,
  Share2,
  BarChart2,
} from "lucide-react";
import axios from "axios";

function ChatPanel() {
  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  // const [chatId, setChatId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let accessToken = localStorage.getItem("zoho_access_token");
    if (!accessToken) {
      window.location.href = `${import.meta.env.VITE_API_URL}/zoho/auth`;
      return;
    }
    axios
      .get(`${import.meta.env.VITE_API_URL}/zoho/chats`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((res) => {
        console.log("Réponse complète :", res.data.data.data);
        setChats(res.data.data.data || []);
      })
      .catch((err) => {
        console.error("Erreur de récupération des discussions :", err);
      });
  }, []); // Supprime `chats` comme dépendance

  console.log("Chats :", chats);

  const loadMessages = async (chatId: string) => {
    let accessToken = localStorage.getItem("zoho_access_token");
    if (!accessToken) {
      window.location.href = `${import.meta.env.VITE_API_URL}/zoho/auth`;
      return;
    }
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/zoho/chats/${chatId}/transcript`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const messagesData = res.data.data || [];
      console.log("Données des messages :", messagesData);
      const extractedMessages = messagesData.flatMap(
        (item: {
          question: any;
          visitor_name: any;
          chatinitiated_time: any;
          msg: { mode: string; att_type: string; fileId: any };
          dname: any;
          time: any;
        }) => {
          if (item.question) {
            return [
              {
                text: item.question,
                sender: item.visitor_name || "Visiteur",
                time: item.chatinitiated_time,
              },
            ];
          } else if (
            item.msg?.mode === "att" &&
            item.msg.att_type === "voice_message"
          ) {
            // Message vocal détecté
            const audioUrl = `${
              import.meta.env.VITE_API_URL
            }/zoho/chats/${chatId}/attachments/${item.msg.fileId}`;
            return [
              {
                text: "Message vocal",
                sender: item.dname || "Visiteur",
                time: item.time,
                audioUrl,
              },
            ];
          } else if (typeof item.msg === "string") {
            return [
              {
                text: item.msg,
                sender: item.dname || "Système",
                time: item.time,
              },
            ];
          }
          return [];
        }
      );

      setMessages(extractedMessages);
      setActiveChat(chatId);
    } catch (err) {
      console.error("Erreur de récupération des messages :", err);
    }
  };

  const sendMessage = async () => {
    if (!activeChat) {
      alert("Veuillez sélectionner un chat !");
      return;
    }

    if (typeof message !== "string") {
      console.error(
        "Erreur : le message n'est pas une chaîne de caractères",
        message
      );
      return;
    }

    try {
      const payload = {
        message: message.trim(), // Assurez-vous que c'est bien du texte
        visitorid: activeChat,
      };

      const response = await axios.post(
        `https://salesiq.zoho.com/api/v2/harxtechnologiesinc/visitors/${activeChat}/message`,
        payload,
        {
          headers: {
            Authorization: `1000.40b780c02d1ec6e99ddd357e57befd07.a11ee9d32fdc1cca221539a937d275f1`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Message envoyé :", response.data);
      setMessage(""); // Vider le champ après envoi
    } catch (error) {
      console.error("Erreur lors de l'envoi du message :", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-purple-600">Live Chat</h2>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200">
              Settings
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              New Chat
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-700">Active Chats</span>
            </div>
            <div className="text-2xl font-bold text-green-800">
              {chats.length}
            </div>
            <div className="text-sm text-green-600">Online now</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-700">Resolved</span>
            </div>
            <div className="text-2xl font-bold text-blue-800">48</div>
            <div className="text-sm text-blue-600">Today</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <span className="font-medium text-yellow-700">Average Time</span>
            </div>
            <div className="text-2xl font-bold text-yellow-800">8m</div>
            <div className="text-sm text-yellow-600">Response time</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <BarChart2 className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-purple-700">Satisfaction</span>
            </div>
            <div className="text-2xl font-bold text-purple-800">94%</div>
            <div className="text-sm text-purple-600">Last 7 days</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-1 border rounded-lg overflow-hidden bg-gray-50">
            <div className="p-4 border-b bg-white">
              <h3 className="font-semibold text-pink-600">
                Active Conversations
              </h3>
            </div>
            <div className="divide-y h-96 overflow-y-auto">
              {chats.map((chat) => (
                <button
                  key={chat.chat_id}
                  className={`w-full p-4 text-left hover:bg-pink-100 flex items-center gap-3 rounded-lg transition-all ${
                    activeChat === chat.chat_id ? "bg-pink-200" : ""
                  }`}
                  onClick={() => loadMessages(chat.chat_id)}
                >
                  <img
                    src={`https://i.pravatar.cc/32?img=${chat.chat_id}`}
                    alt=""
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-lg text-blue-600">
                      {chat.visitor_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(
                        Number(chat.chatinitiated_time)
                      ).toLocaleString()}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="col-span-2 border rounded-lg overflow-hidden bg-gray-50">
            <div className="p-4 bg-white border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="https://i.pravatar.cc/32?img=21"
                  alt="Customer"
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <div className="font-medium text-indigo-600">
                    {chats.find((chat) => chat.chat_id === activeChat)
                      ?.visitor_name || "Visiteur"}
                  </div>

                  <div className="text-sm text-gray-500">Online</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-indigo-100 rounded-lg">
                  <Video className="w-5 h-5 text-indigo-600" />
                </button>
                <button className="p-2 hover:bg-indigo-100 rounded-lg">
                  <Share2 className="w-5 h-5 text-indigo-600" />
                </button>
              </div>
            </div>
            <div className="h-96 p-4 overflow-y-auto bg-white">
              {messages.length > 0 ? (
                messages.map((msg, index) => {
                  const isSenderAgent =
                    msg.sender !==
                    chats.find((chat) => chat.chat_id === activeChat)
                      ?.visitor_name;
                  return (
                    <div
                      key={index}
                      className={`mb-4 p-3 rounded-lg flex w-full max-w-[50%] ${
                        isSenderAgent
                          ? "bg-blue-100 ml-auto"
                          : "bg-gray-200 mr-auto"
                      }`}
                      style={{
                        width: "auto", // Allow dynamic width
                        maxWidth: "70%", // Optional: Limit the maximum width to avoid overflowing
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <img
                          src={
                            isSenderAgent
                              ? "https://app.harx.ai/favicon.png"
                              : "https://i.pravatar.cc/32?img=21"
                          }
                          alt={isSenderAgent ? "Agent" : "Visiteur"}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="flex flex-col">
                          <div className="text-sm font-semibold text-pink-600">
                            {msg.sender}
                          </div>
                          {msg.audioUrl ? (
                            <audio controls>
                              <source src={msg.audioUrl} type="audio/mpeg" />
                              Votre navigateur ne supporte pas l'audio.
                            </audio>
                          ) : (
                            <div className="text-md text-purple-600">
                              {msg.text}
                            </div>
                          )}
                          <div className="text-xs text-gray-500">
                            {new Date(parseInt(msg.time, 10)).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-gray-500 mt-32">
                  Sélectionnez une conversation pour voir les messages
                </div>
              )}
            </div>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  onClick={sendMessage}
                >
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
