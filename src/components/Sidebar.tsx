import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Phone,
  Mail,
  MessageSquare,
  TrendingUp,
  Settings,
  Plug,
  Briefcase,
  ClipboardCheck,
  ScrollText,
  UserPlus,
  Building2,
  Calendar,
  DollarSign,
  ContactIcon,
  Book,
  ChevronDown,
  ChevronRight,
  Lightbulb
} from 'lucide-react';
import { getHiddenSections } from '../config/sections';

export function Sidebar() {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  // Get hidden sections from configuration
  const hiddenSections = getHiddenSections();

  const allMenuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Overview', path: '/', key: 'overview' },
    { icon: <Building2 size={20} />, label: 'Company', path: '/company', key: 'company' },
    { icon: <Users size={20} />, label: 'Rep Matching', path: '/rep-matching', key: 'rep-matching' },
    { icon: <UserPlus size={20} />, label: 'Leads', path: '/leads', key: 'leads' },
    // { icon: <DollarSign size={20} />, label: 'Deals', path: '/deals' },
    // { icon: <ContactIcon size={20} />, label: 'Contacts', path: '/contacts' },
    { icon: <Calendar size={20} />, label: 'Scheduler', path: '/scheduler', key: 'scheduler' },
    { icon: <Phone size={20} />, label: 'Calls', path: '/calls', key: 'calls' },
    { icon: <Phone size={20} />, label: 'Telnyx Call Test', path: '/telnyx-call-test', key: 'telnyx-call-test' },
    { icon: <Mail size={20} />, label: 'Emails', path: '/emails', key: 'emails' },
    { icon: <MessageSquare size={20} />, label: 'Live Chat', path: '/chat', key: 'live-chat' },
    { icon: <Briefcase size={20} />, label: 'Gigs', path: '/gigs', key: 'gigs' },
    { icon: <ClipboardCheck size={20} />, label: 'Quality Assurance', path: '/quality-assurance', key: 'quality-assurance' },
    { icon: <ScrollText size={20} />, label: 'Operations', path: '/operations', key: 'operations' },
    { icon: <TrendingUp size={20} />, label: 'Analytics', path: '/analytics', key: 'analytics' },
    { icon: <Plug size={20} />, label: 'Integrations', path: '/integrations', key: 'integrations' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/settings', key: 'settings' },
  ];

  // Filter out hidden sections
  const menuItems = allMenuItems.filter(item => !hiddenSections.includes(item.key));

  return (
    <div className="w-64 bg-gray-900 h-screen fixed left-0 top-0 text-white p-4 flex flex-col">
      {/* Sidebar Header */}
      <div className="flex items-center gap-2 mb-4">
        <LayoutDashboard className="w-8 h-8 text-blue-500" />
        <span className="text-xl font-bold">HARX</span>
      </div>

      {/* Scrollable Menu with Custom Scrollbar */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-800 text-gray-300 hover:text-white"
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}

          {/* Knowledge Base - Collapsible Section */}
          <div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-between w-full p-3 rounded-lg transition-colors hover:bg-gray-800 text-gray-300 hover:text-white"
            >
              <div className="flex items-center gap-3">
                <Book size={20} />
                <span>Knowledge Base</span>
              </div>
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {isExpanded && (
              <div className="ml-6 space-y-2">
                <NavLink
                  to="/knowledge-base"
                  className={({ isActive }) =>
                    `flex items-center gap-3 w-full p-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "hover:bg-gray-800 text-gray-300 hover:text-white"
                    }`
                  }
                >
                  <Book size={18} />
                  <span>Knowledge Base</span>
                </NavLink>
                <NavLink
                  to="/kb-insight"
                  className={({ isActive }) =>
                    `flex items-center gap-3 w-full p-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "hover:bg-gray-800 text-gray-300 hover:text-white"
                    }`
                  }
                >
                  <Lightbulb size={18} />
                  <span>KB Insight</span>
                </NavLink>
              </div>
            )}
          </div>

        </nav>
      </div>
    </div>
  );
}

export default Sidebar;
