import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  ChevronDown,
  ChevronRight,
  Book,
  Lightbulb
} from 'lucide-react';

export function Sidebar() {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Overview', path: '/' },
    { icon: <Building2 size={20} />, label: 'Company', path: '/company' },
    { icon: <UserPlus size={20} />, label: 'Leads', path: '/leads' },
    { icon: <Users size={20} />, label: 'Rep Matching', path: '/matching' },
    { icon: <Phone size={20} />, label: 'Calls', path: '/calls' },
    { icon: <Mail size={20} />, label: 'Emails', path: '/emails' },
    { icon: <MessageSquare size={20} />, label: 'Live Chat', path: '/chat' },
    { icon: <Briefcase size={20} />, label: 'Gigs', path: '/gigs' },
    { icon: <Plug size={20} />, label: 'Integrations', path: '/integrations' },
  ];

  return (
    <div className="w-64 bg-gray-900 h-screen fixed left-0 top-0 text-white p-4">
      <div className="flex items-center gap-2 mb-8">
        <LayoutDashboard className="w-8 h-8 text-blue-500" />
        <span className="text-xl font-bold">HARX</span>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-800 text-gray-300 hover:text-white'
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
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-800 text-gray-300 hover:text-white'
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
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-800 text-gray-300 hover:text-white'
                  }`
                }
              >
                <Lightbulb size={18} />
                <span>KB Insight</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* Settings */}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'hover:bg-gray-800 text-gray-300 hover:text-white'
            }`
          }
        >
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </nav>
    </div>
  );
}

export default Sidebar;
