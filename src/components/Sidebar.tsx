import React from 'react';
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
  Calendar
} from 'lucide-react';

export function Sidebar() {
  const location = useLocation();
  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Overview', path: '/' },
    { icon: <Building2 size={20} />, label: 'Company', path: '/company' },
    { icon: <UserPlus size={20} />, label: 'Leads', path: '/leads' },
    { icon: <Users size={20} />, label: 'Rep Matching', path: '/rep-matching' },
    { icon: <Calendar size={20} />, label: 'Scheduler', path: '/scheduler' },
    { icon: <Phone size={20} />, label: 'Calls', path: '/calls' },
    { icon: <Mail size={20} />, label: 'Emails', path: '/emails' },
    { icon: <MessageSquare size={20} />, label: 'Live Chat', path: '/chat' },
    { icon: <Briefcase size={20} />, label: 'Gigs', path: '/gigs' },
    { icon: <ClipboardCheck size={20} />, label: 'Quality Assurance', path: '/quality-assurance' },
    { icon: <ScrollText size={20} />, label: 'Operations', path: '/operations' },
    { icon: <TrendingUp size={20} />, label: 'Analytics', path: '/analytics' },
    { icon: <Plug size={20} />, label: 'Integrations', path: '/integrations' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/settings' },
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
      </nav>
    </div>
  );
}

export default Sidebar;