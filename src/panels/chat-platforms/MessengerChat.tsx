import React from "react";
import BaseChatComponent from "./BaseChatComponent";
import { Video, Share2 } from "lucide-react";
import { channelConfig } from "./channelConfig";

const MessengerChat: React.FC = () => {
  const styles = {
    icon: channelConfig.messenger.icon,
    label: channelConfig.messenger.label,
    chatBg: "bg-blue-50",
    headerBg: "bg-blue-600",
    headerText: "text-white",
    messageSenderBg: "bg-blue-600", 
    messageReceiverBg: "bg-gray-100",
    messageReceiverText: "text-gray-800",
    messageSenderText: "text-white",
    messageSenderName: "text-blue-100",
    messageReceiverName: "text-blue-700 font-semibold",
    buttonColor: "bg-blue-600 hover:bg-blue-700",
    ringColor: "focus:ring-blue-500",
    nameColor: "text-blue-600",
    statsBg: "bg-blue-50",
    statsIcon: "text-blue-600",
    statsTitle: "text-blue-700",
    statsValue: "text-blue-800",
    statsSubtext: "text-blue-600",
    activeChatBg: "bg-blue-100",
    addButtonBg: "bg-blue-100 text-blue-600",
    statusColor: "text-gray-200"
  };

  const actionButtons = (
    <>
      <button className="p-2 rounded-lg hover:bg-opacity-20 hover:bg-white">
        <Video className="w-5 h-5 text-white" />
      </button>
      <button className="p-2 rounded-lg hover:bg-opacity-20 hover:bg-white">
        <Share2 className="w-5 h-5 text-white" />
      </button>
    </>
  );

  const inputButtons = null;

  return (
    <BaseChatComponent 
      channelType="messenger" 
      styles={styles} 
      actionButtons={actionButtons}
      inputButtons={inputButtons}
    />
  );
};

export default MessengerChat; 