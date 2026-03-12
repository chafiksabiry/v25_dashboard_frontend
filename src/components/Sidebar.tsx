import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Phone,
  Mail,
  MessageSquare,
  TrendingUp,
  Plug,
  Briefcase,
  ClipboardCheck,
  ScrollText,
  UserPlus,
  Building2,
  Calendar,
  Book,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  LogOut
} from 'lucide-react';
import { getHiddenSections } from '../config/sections';
import Cookies from 'js-cookie';
import { useAuth } from '../contexts/AuthContext';

export function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasCompany, setHasCompany] = useState(false);
  const [hasGigs, setHasGigs] = useState(false);
  const [hasLeads, setHasLeads] = useState(false);
  const [hasKb, setHasKb] = useState(false);
  const [hasRepMatching, setHasRepMatching] = useState(false);

  // Get hidden sections from configuration
  const hiddenSections = getHiddenSections();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const userId = Cookies.get('userId');
      if (!userId) return;

      try {
        // 1. Check if user has a company
        const companyRes = await fetch(`${import.meta.env.VITE_BACKEND_URL_COMPANY}/companies/user/${userId}`);
        if (companyRes.ok) {
          const companyData = await companyRes.json();
          const companyExists = companyData.success && companyData.data;
          setHasCompany(companyExists);

          // 2. If they have a company, check the full onboarding progress
          if (companyExists && companyData.data._id) {
            try {
              const progressRes = await fetch(`${import.meta.env.VITE_BACKEND_URL_COMPANY}/onboarding/companies/${companyData.data._id}/onboarding`);

              let stepGigs = false;
              let stepLeads = false;
              let stepKb = false;
              let stepRepMatching = false;
              let payload: any = null;

              if (progressRes.ok) {
                const progressData = await progressRes.json();
                console.log("📊 Sidebar Onboarding Progress Data:", progressData);

                // Handle both direct object form and wrapped { data: { ... } } form
                payload = progressData.data ? progressData.data : progressData;

                if (payload && Array.isArray(payload.completedSteps)) {
                  // Step 3 = Gigs
                  if (payload.completedSteps.includes(3)) stepGigs = true;
                  // Step 5 = Upload Contacts (Leads)
                  if (payload.completedSteps.includes(5)) stepLeads = true;
                  // Step 8, 9, 10 = Knowledge Base phase roughly, step 9 is specifically KB
                  if (payload.completedSteps.includes(8) || payload.completedSteps.includes(9)) stepKb = true;
                  // Step 13 = Match HARX REPS
                  if (payload.completedSteps.includes(13)) stepRepMatching = true;
                }
              }

              // Fallbacks or final setters
              setHasGigs(stepGigs || Cookies.get('createGigStepCompleted') === 'true');
              setHasLeads(stepLeads);
              setHasKb(stepKb);
              setHasRepMatching(stepRepMatching);

            } catch (err) {
              console.error("Error checking onboarding progress", err);
              setHasGigs(false);
              setHasLeads(false);
              setHasKb(false);
              setHasRepMatching(false);
            }
          }
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      }
    };

    checkOnboardingStatus();
  }, [location.pathname]); // Re-check when route changes, as they might have just created one

  const allMenuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Overview', path: '/', key: 'overview', alwaysShow: true },
    { icon: <Building2 size={20} />, label: 'Company', path: '/company', key: 'company', alwaysShow: true },
    // Needs Gigs
    { icon: <Briefcase size={20} />, label: 'Gigs', path: '/gigs', key: 'gigs', requiresGigs: true },
    // Needs Leads
    { icon: <UserPlus size={20} />, label: 'Leads', path: '/leads', key: 'leads', requiresLeads: true },
    // Needs Rep Matching
    { icon: <Users size={20} />, label: 'Rep Matching', path: '/rep-matching', key: 'rep-matching', requiresRepMatching: true },
    // After that, requires Rep Matching ideally, but for now we link it to leads/gigs as a baseline
    { icon: <Phone size={20} />, label: 'Calls', path: '/calls', key: 'calls', requiresRepMatching: true },
    { icon: <Calendar size={20} />, label: 'Scheduler', path: '/scheduler', key: 'scheduler', requiresRepMatching: true },
    { icon: <Phone size={20} />, label: 'Telnyx Call Test', path: '/telnyx-call-test', key: 'telnyx-call-test', requiresRepMatching: true },
    { icon: <Mail size={20} />, label: 'Emails', path: '/emails', key: 'emails', requiresRepMatching: true },
    { icon: <MessageSquare size={20} />, label: 'Live Chat', path: '/chat', key: 'live-chat', requiresRepMatching: true },
    { icon: <ClipboardCheck size={20} />, label: 'Quality Assurance', path: '/quality-assurance', key: 'quality-assurance', requiresRepMatching: true },
    { icon: <ScrollText size={20} />, label: 'Operations', path: '/operations', key: 'operations', requiresRepMatching: true },
    { icon: <TrendingUp size={20} />, label: 'Analytics', path: '/analytics', key: 'analytics', requiresRepMatching: true },
    { icon: <Plug size={20} />, label: 'Integrations', path: '/integrations', key: 'integrations', alwaysShow: true },
  ];

  // Filter out hidden sections and apply onboarding logic
  const menuItems = allMenuItems.filter(item => {
    if (hiddenSections.includes(item.key)) return false;
    if (item.alwaysShow) return true;

    if ((item as any).requiresGigs && !hasGigs) return false;
    if ((item as any).requiresLeads && !hasLeads) return false;
    if ((item as any).requiresRepMatching && !hasRepMatching) return false;
    if ((item as any).requiresCompany && !hasCompany) return false;
    return true;
  });

  return (
    <div className="w-64 bg-gray-900 h-screen fixed left-0 top-0 text-white p-4 flex flex-col">
      {/* Sidebar Header */}
      <div className="flex items-center gap-2 mb-4">
        <LayoutDashboard className="w-8 h-8 text-rose-500" />
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
                `flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${isActive
                  ? "bg-gradient-to-r from-orange-400 to-rose-500 text-white shadow-lg shadow-rose-900/20"
                  : "hover:bg-gray-800 text-gray-300 hover:text-rose-400"
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}

          {/* Knowledge Base - Collapsible Section (Depends on hasKb) */}
          {hasKb && (
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
                <div className="ml-6 space-y-2 mt-2">
                  <NavLink
                    to="/knowledge-base"
                    className={({ isActive }) =>
                      `flex items-center gap-3 w-full p-2 rounded-lg transition-colors ${isActive
                        ? "bg-rose-500 text-white"
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
                      `flex items-center gap-3 w-full p-2 rounded-lg transition-colors ${isActive
                        ? "bg-gradient-to-r from-orange-400 to-rose-500 text-white"
                        : "hover:bg-gray-800 text-gray-300 hover:text-rose-400"
                      }`
                    }
                  >
                    <Lightbulb size={18} />
                    <span>Knowledge Base Insight</span>
                  </NavLink>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>

      {/* Sidebar Footer - Logout */}
      <div className="mt-auto pt-4 border-t border-gray-800">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full p-3 rounded-lg transition-colors text-red-400 hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
