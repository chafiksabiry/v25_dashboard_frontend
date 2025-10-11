import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  Clock,
  DollarSign,
  Building2,
  Tags,
  ArrowUpRight,
  ArrowDownRight,
  Brain,
  Sparkles,
  Bot,
  Edit,
  Upload,
  AlertCircle,
  Phone,
  Mail,
  Settings,
  FileSpreadsheet,
  Globe,
  RefreshCw,
  UserPlus,
} from "lucide-react";
import { LeadUploader } from "../components/LeadUploader";
import { useNavigate } from 'react-router-dom';
import { leadsApi } from '../services/api/leads';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const zohoApiUrl = import.meta.env.VITE_ZOHO_API_URL;

// Add this custom hook at the top of the file, after imports
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Update the Lead interface at the top of the file, after imports
interface Lead {
  _id: string;
  userId: string;
  gigId: string;
  refreshToken: string;
  id: string; // Zoho CRM ID
  Last_Activity_Time: string | null;
  Deal_Name: string;
  Stage: string;
  Email_1: string;
  Phone?: string;
  updatedAt: string;
  // Champs optionnels pour compatibilité
  Owner?: {
    name: string;
    id: string;
    email: string;
  };
  Created_By?: {
    name: string;
    id: string;
    email: string;
  };
  Modified_By?: {
    name: string;
    id: string;
    email: string;
  };
  Contact_Name?: {
    name: string;
    id: string;
  };
  Telephony?: string | null;
  Pipeline?: {
    name: string;
    id: string;
  } | string;
  Created_Time?: string;
  Modified_Time?: string;
  Description?: string | null;
  Tag?: string[];
  Amount?: number;
  Probability?: number;
  Type?: string;
  $currency_symbol?: string;
  metadata?: {
    ai_analysis?: {
      score?: string;
    };
  };
}

function LeadManagementPanel() {
  const navigate = useNavigate();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isZohoConnected] = useState(true); // Toujours connecté pour simplifier
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  interface Stage {
    display_value: string;
    sequence_number: number;
    forecast_category: {
      name: string;
      id: string;
    };
    actual_value: string;
    id: string;
    forecast_type: string;
  }

  interface Pipeline {
    display_value: string;
    default: boolean;
    maps: Stage[];
    actual_value: string;
    id: string;
  }

  interface PipelinesResponse {
    success: boolean;
    data: {
      layoutId: string;
      pipelines: {
        pipeline: Pipeline[];
      };
    };
  }

  const [leads, setLeads] = useState<Lead[]>([]);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [hasMoreRecords] = useState(false);
  const LEADS_PER_PAGE = 20; // Réduire à 20 leads par page pour une meilleure performance
  const [totalLeads, setTotalLeads] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [displayedLeads, setDisplayedLeads] = useState<Lead[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  
  // États pour la gestion des gigs
  const [gigs, setGigs] = useState<any[]>([]);
  const [selectedGig, setSelectedGig] = useState<any>(null);
  const [isLoadingGigs, setIsLoadingGigs] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Modify these new states to handle advanced filters
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const debouncedSearchText = useDebounce(searchText, 300); // 300ms delay

  // Calculate the leads to display for the current page
  const getCurrentPageLeads = () => {
    const startIndex = (currentPage - 1) * LEADS_PER_PAGE;
    const endIndex = startIndex + LEADS_PER_PAGE;
    return allLeads.slice(startIndex, endIndex);
  };

  // Update displayed leads when page changes
  useEffect(() => {
    const currentPageLeads = getCurrentPageLeads();
    setDisplayedLeads(currentPageLeads);
    setTotalPages(Math.ceil(allLeads.length / LEADS_PER_PAGE));
  }, [currentPage, allLeads]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  const fetchGigs = async () => {
    try {
      setIsLoadingGigs(true);
      
      const userId: string = Cookies.get('userId') || '680a27ffefa3d29d628d0016';
      console.log('Stored userId:', userId);
      
      if (!userId) {
        console.error("No user ID found");
        setGigs([]);
        setIsLoadingGigs(false);
        return;
      }

      console.log("Fetching gigs for user:", userId);
      const response = await fetch(`${import.meta.env.VITE_API_URL_GIGS}/gigs/user/${userId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Server response:", {
          status: response.status,
          statusText: response.statusText,
          data: errorData
        });
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Received data:", data);
      
      if (!data.data || !Array.isArray(data.data)) {
        throw new Error("Invalid data format");
      }

      const validGigs = data.data;
      setGigs(validGigs);
      
      // Sélectionner le premier gig par défaut
      if (validGigs.length > 0) {
        setSelectedGig(validGigs[0]);
      }
    } catch (error) {
      console.error("Detailed error:", error);
      setGigs([]);
    } finally {
      setIsLoadingGigs(false);
    }
  };

  const fetchPipelines = async () => {
    try {
      const token = localStorage.getItem('zoho_access_token');
      if (!token) {
        console.log('No Zoho token found, skipping pipelines fetch');
        return;
      }

      const response = await fetch(`${zohoApiUrl}/pipelines`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pipelines');
      }

      const data: PipelinesResponse = await response.json();
      if (data.success && data.data?.pipelines?.pipeline) {
        setPipelines(data.data.pipelines.pipeline);
      }
    } catch (error) {
      console.error('Error fetching pipelines:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch pipelines');
    }
  };

  const fetchLeads = async (page: number = 1) => {
    try {
      setIsLoadingMore(true);
      
      // Vérifier qu'un gig est sélectionné
      if (!selectedGig) {
        console.log("No gig selected, skipping leads fetch");
        setAllLeads([]);
        setTotalLeads(0);
        return;
      }

      // Utiliser le nouvel endpoint avec pagination
      const result = await leadsApi.getByGig(selectedGig._id, page, LEADS_PER_PAGE);
      
      if (result.success && result.data) {
        let filteredData = result.data;
        
        // Appliquer les filtres côté client si nécessaire
        if (selectedStage !== 'all') {
          filteredData = filteredData.filter((lead: Lead) => lead.Stage === selectedStage);
        }
        
        if (debouncedSearchText) {
          filteredData = filteredData.filter((lead: Lead) => 
            lead.Deal_Name.toLowerCase().includes(debouncedSearchText.toLowerCase()) ||
            (lead.Email_1 && lead.Email_1.toLowerCase().includes(debouncedSearchText.toLowerCase())) ||
            (lead.Phone && lead.Phone.includes(debouncedSearchText))
          );
        }
        
        setAllLeads(filteredData);
        setTotalLeads(result.total);
        setTotalPages(result.totalPages);
        setCurrentPage(result.currentPage);
      } else {
        setAllLeads([]);
        setTotalLeads(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error retrieving leads:", error);
      setAllLeads([]);
      setTotalLeads(0);
      setTotalPages(1);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Charger les gigs et pipelines directement au démarrage
  useEffect(() => {
    fetchGigs();
    fetchPipelines();
    setIsLoading(false);
  }, []);

  // Effet pour récupérer les leads quand un gig est sélectionné
  useEffect(() => {
    if (selectedGig) {
      fetchLeads(1);
    }
  }, [selectedGig]);

  // Gestionnaire pour le changement de gig
  const handleGigChange = async (gig: any) => {
    console.log('Gig sélectionné:', gig);
    setSelectedGig(gig);
    setSelectedPipeline('all');
    setSelectedStage('all');
    setCurrentPage(1);
  };

  // Optimize pipeline change handler
  const handlePipelineChange = async (pipelineName: string) => {
    console.log('Pipeline sélectionné:', pipelineName);
    const selectedPipelineData = pipelines.find(p => p.display_value === pipelineName);
    console.log('Données du pipeline sélectionné:', selectedPipelineData);
    setSelectedPipeline(pipelineName);
    setSelectedStage('all');
    setCurrentPage(1);
    await fetchLeads(1);
  };

  console.log("Leads:", leads);

  // Fonction de connexion Zoho supprimée - non nécessaire

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showLeadDetails, setShowLeadDetails] = useState(false);

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setShowLeadDetails(true);
  };

  const closeLeadDetails = () => {
    setShowLeadDetails(false);
    setSelectedLead(null);
  };

  // Add a new state to track selected stage
  const [selectedStageInModal, setSelectedStageInModal] = useState<string>("Analyze Needs");
  
  const refreshLeads = () => {
    // Don't reset the page, but retrieve data from the current page
    fetchLeads(currentPage);
  };

  // Add a new state for tracking updates
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStageClick = async (stage: string) => {
    if (!selectedLead || stage === selectedLead.Stage) return;
    
    setIsUpdating(true);
    setSelectedStageInModal(stage);
    
    try {
      const accessToken = localStorage.getItem('zoho_access_token');
      if (!accessToken) {
        throw new Error("Access token not found");
      }
      
      const updateData = {
        Stage: stage
      };
      
      const response = await fetch(`${zohoApiUrl}/leads/${selectedLead.id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Zoho-oauthtoken ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        throw new Error("Failed to update lead stage");
      }
      
      // Update local lead data to reflect the change
      const updatedLead = { ...selectedLead, Stage: stage };
      setSelectedLead(updatedLead);
      
      // Update leads list
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          lead.id === selectedLead.id ? updatedLead : lead
        )
      );
      
      // Refresh leads from the server to get the latest data
      refreshLeads();
      
      // Show success notification
      console.log("Lead updated successfully");
      
    } catch (error: unknown) {
      console.error("Error updating lead:", error);
      // Gérer l'erreur si nécessaire
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditClick = (e: React.MouseEvent, _lead: Lead) => {
    e.stopPropagation();  // Prevent click triggering on the line
    // TODO: Implement lead editing functionality
  };

  // Fonction de déconnexion Zoho supprimée - non nécessaire

  // Pas besoin de vérifier la connexion Zoho


  // Get stages of the selected pipeline
  const getSelectedPipelineStages = () => {
    if (selectedPipeline === 'all' || !pipelines) {
      return [];
    }
    const selectedPipelineData = pipelines.find(p => p.display_value === selectedPipeline);
    console.log('Pipeline Stages:', selectedPipelineData?.maps); // Debug log
    return selectedPipelineData?.maps || [];
  };

  // Optimize stage change handler
  const handleStageChange = async (stageName: string) => {
    setSelectedStage(stageName);
    setCurrentPage(1);
    await fetchLeads(1);
  };

  const [isImporting, setIsImporting] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const handleImportFromZoho = async () => {
    setIsImporting(true);
    try {
      const accessToken = localStorage.getItem('zoho_access_token');
      if (!accessToken) {
        throw new Error("Access token not found");
      }

      // Récupérer les leads depuis Zoho
      const response = await fetch(`${zohoApiUrl}/leads?page=${currentPage}`, {
        method: "GET",
        headers: {
          "Authorization": `Zoho-oauthtoken ${accessToken}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch leads from Zoho");
      }

      const result = await response.json();
      const zohoLeads = result.data?.data?.data || [];

      // Sauvegarder les leads dans la base de données
      const saveResponse = await fetch('/api/leads/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ leads: zohoLeads }),
      });

      if (!saveResponse.ok) {
        throw new Error("Failed to save leads");
      }

      const saveResult = await saveResponse.json();
      
      // Rafraîchir la liste des leads
      await fetchLeads(currentPage);
      
      // Afficher une notification de succès
      console.log(`Successfully imported ${saveResult.data.length} leads`);
    } catch (error) {
      console.error("Error importing leads:", error);
    } finally {
      setIsImporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center mb-2">
          <div className="p-3 bg-blue-100 rounded-lg mr-3">
            <UserPlus className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Upload Contacts</h2>
        </div>
        <p className="text-gray-600 ml-16">
          Import, manage, and organize your leads efficiently. Choose between connecting with your CRM system or uploading contact files directly.
        </p>
      </div>

      {/* Select a Gig Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center mb-4">
          <Settings className="w-5 h-5 text-gray-700 mr-2" />
          <h3 className="text-xl font-semibold text-gray-900">Select a Gig</h3>
        </div>
        <select
          value={selectedGig?._id || ''}
          onChange={(e) => {
            const gig = gigs.find(g => g._id === e.target.value);
            if (gig) handleGigChange(gig);
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 font-medium"
          disabled={isLoadingGigs}
        >
          <option value="">Select a Gig</option>
          {gigs.map((gig) => (
            <option key={gig._id} value={gig._id}>
              {gig.title || gig.name || `Gig ${gig._id}`}
            </option>
          ))}
        </select>
      </div>

      {/* Import Leads Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center mb-2">
          <Upload className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-xl font-semibold text-gray-900">Import Leads</h3>
        </div>
        <p className="text-gray-600 mb-6">
          Choose your preferred method to import leads into your selected gig.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Zoho CRM Integration Card */}
          <div className="bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-200 rounded-2xl p-6 hover:border-green-300 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mr-4 border-2 border-green-200 shadow-sm">
                <img 
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%2334a853' d='M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z'/%3E%3C/svg%3E" 
                  alt="Zoho" 
                  className="h-6 w-6"
                />
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-green-900">Zoho CRM Integration</h4>
                <p className="text-sm text-green-700">Connect and sync with your Zoho CRM</p>
              </div>
            </div>
            
            {/* Connection Status */}
            <div className="mb-4">
              {isZohoConnected ? (
                <div className="flex items-center justify-between bg-green-100 border border-green-200 rounded-lg p-3">
                  <span className="text-sm font-medium text-green-800 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    ✓ Connected to Zoho CRM
                  </span>
                  <button
                    onClick={() => {/* Add disconnect handler */}}
                    className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors duration-200"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <span className="text-sm font-medium text-yellow-800">⚠ Not connected</span>
                  <button
                    onClick={() => {/* Add connect handler */}}
                    className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors duration-200"
                  >
                    Connect
                  </button>
                </div>
              )}
            </div>
            
            {/* Action Button - Pushed to bottom */}
            <div className="mt-auto">
              <button
                onClick={async () => {
                  if (!selectedGig) {
                    toast.error('Please select a gig first');
                    return;
                  }
                  await handleImportFromZoho();
                }}
                disabled={!isZohoConnected || isImporting}
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold py-4 px-6 rounded-xl hover:from-green-700 hover:to-teal-700 disabled:opacity-50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                {isImporting ? (
                  <>
                    <RefreshCw className="mr-3 h-5 w-5 animate-spin" />
                    Importing from Zoho...
                  </>
                ) : !isZohoConnected ? (
                  <>
                    <Settings className="h-5 w-5 mr-3" />
                    Connect to Zoho CRM First
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-5 w-5 mr-3" />
                    Sync with Zoho CRM
                  </>
                )}
              </button>
            </div>
          </div>

          {/* File Upload Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mr-4 border-2 border-blue-200 shadow-sm">
                <FileSpreadsheet className="h-6 w-6 text-blue-700" />
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-blue-900">File Upload</h4>
                <p className="text-sm text-blue-700">Upload and process contact files</p>
              </div>
            </div>
            
            {/* File Info */}
            <div className="mb-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <span className="text-sm font-medium text-blue-800">📁 Supported: CSV, Excel, JSON, TXT</span>
              </div>
            </div>
            
            {/* Upload Button - Pushed to bottom */}
            <div className="mt-auto">
              <button
                onClick={() => setShowUploadModal(true)}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer flex items-center justify-center"
              >
                <FileSpreadsheet className="h-5 w-5 mr-3 text-white" />
                <span className="text-base font-semibold text-white">
                  Click to upload or drag and drop
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Channel Filter Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center mb-4">
          <Globe className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-xl font-semibold text-gray-900">Channel Filter</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="flex items-center space-x-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 transform hover:scale-105 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
          >
            <Globe className="h-4 w-4" />
            <span>All Channels</span>
          </button>
          <button
            className="flex items-center space-x-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 transform hover:scale-105 bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
          >
            <Phone className="h-4 w-4" />
            <span>Voice Calls</span>
          </button>
        </div>
      </div>

      {/* Leads List Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center">
                <Users className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="text-xl font-semibold text-gray-900">Leads List</h3>
              </div>
              <div className="mt-2">
                {selectedGig ? (
                  <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium">
                    Showing {displayedLeads.length} of {totalLeads} leads
                  </span>
                ) : (
                  <p className="text-sm text-gray-500">Please select a gig to view leads</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-64 rounded-lg border-gray-300 pl-10 focus:border-blue-600 focus:ring-blue-600 sm:text-sm shadow-sm"
                  placeholder="Search leads..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>
              <select
                className="rounded-lg border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-600 focus:outline-none focus:ring-blue-600 sm:text-sm shadow-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <button
                onClick={() => fetchLeads(currentPage)}
                className="flex items-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
                disabled={isLoadingMore || !selectedGig}
              >
                {isLoadingMore ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="overflow-x-auto">
          <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 bg-gray-50">
                    Lead
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 bg-gray-50">
                    Lead Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 bg-gray-50">
                    Pipeline
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {isLoadingMore ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                        Loading leads...
                      </div>
                    </td>
                  </tr>
                ) : displayedLeads.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                      <div className="flex flex-col items-center justify-center py-8">
                        <UserPlus className="h-12 w-12 text-gray-300 mb-2" />
                        <p>No leads found</p>
                        <p className="text-xs text-gray-400 mt-1">Try importing some leads or check your filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayedLeads.map((lead, index) => (
                    <tr 
                      key={`${lead._id}-${lead.id}-${index}`} 
                      className={`hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                      onClick={() => handleLeadClick(lead)}
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-full flex items-center justify-center bg-blue-100">
                            <UserPlus className="h-6 w-6 text-blue-700" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 flex items-center">
                              {lead.Email_1 || 'No Email'}
                            </div>
                            <div className="text-sm text-gray-500">{lead.Phone || 'No Phone'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {lead.Deal_Name || 'N/A'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {typeof lead.Pipeline === 'object' ? lead.Pipeline.name : lead.Pipeline || 'Reps Pipeline'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
        {displayedLeads.length > 0 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-700">
                <span>
                  Showing <span className="font-medium">{displayedLeads.length}</span> of{' '}
                  <span className="font-medium">{totalLeads > 0 ? totalLeads : displayedLeads.length}</span> leads
                </span>
              </div>
              
              {totalPages > 1 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    <span className="px-3 py-2 text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <LeadUploader
              onComplete={() => {
                setShowUploadModal(false);
              }}
              onClose={() => setShowUploadModal(false)}
            />
          </div>
        </div>
      )}

      {showLeadDetails && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex mb-4">
                <div className="flex space-x-4">
                  <button className="px-6 py-2 bg-white text-gray-800 border-b-2 border-blue-600 font-medium">Overview</button>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <div className="text-gray-500 text-sm">
                    Last Update : 09:20 AM
                  </div>
                  <button 
                    onClick={closeLeadDetails}
                    className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                <div className="flex justify-between mb-4">
                  <div>
                    <h3 className="text-gray-500 text-sm uppercase">START</h3>
                    <p className="font-medium">11/02/2025</p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-gray-500 text-sm uppercase">CLOSING</h3>
                    <p className="font-medium">14/02/2025</p>
                  </div>
                </div>

                <div className="flex">
                  <div 
                    className={`${selectedStageInModal === "Qualification" ? "bg-blue-500 text-white" : "bg-blue-100 text-gray-800"} py-1 px-4 rounded-l-md flex items-center cursor-pointer ${isUpdating ? "opacity-50 cursor-wait" : ""}`}
                    onClick={() => !isUpdating && handleStageClick("Qualification")}
                  >
                    <span className="text-sm">
                      {isUpdating && selectedStageInModal === "Qualification" ? "Updating..." : "Qualification"}
                    </span>
                  </div>
                  <div 
                    className={`${selectedStageInModal === "Analyze Needs" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"} py-1 px-4 flex items-center relative cursor-pointer`}
                    onClick={() => !isUpdating && handleStageClick("Analyze Needs")}
                  >
                    <div className={`absolute left-0 top-0 bottom-0 border-l-[12px] border-l-transparent border-t-[15px] border-b-[15px] ${selectedStageInModal === "Qualification" ? "border-t-blue-500 border-b-blue-500" : "border-t-blue-100 border-b-blue-100"} -ml-[12px]`}></div>
                    <span className="text-sm">Analyze Needs</span>
                    <div className={`absolute right-0 top-0 bottom-0 border-l-[12px] border-l-transparent border-t-[15px] border-b-[15px] ${selectedStageInModal === "Analyze Needs" ? "border-t-blue-500 border-b-blue-500" : "border-t-gray-100 border-b-gray-100"} ml-[12px] z-10 rotate-180 -mr-[12px]`}></div>
                  </div>
                  <div 
                    className={`${selectedStageInModal === "Negotiation" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"} py-1 px-4 flex items-center relative cursor-pointer`}
                    onClick={() => !isUpdating && handleStageClick("Negotiation")}
                  >
                    <div className={`absolute left-0 top-0 bottom-0 border-l-[12px] border-l-transparent border-t-[15px] border-b-[15px] ${selectedStageInModal === "Analyze Needs" ? "border-t-blue-500 border-b-blue-500" : "border-t-gray-100 border-b-gray-100"} -ml-[12px]`}></div>
                    <span className="text-sm">Negotiation</span>
                    <div className={`absolute right-0 top-0 bottom-0 border-l-[12px] border-l-transparent border-t-[15px] border-b-[15px] ${selectedStageInModal === "Negotiation" ? "border-t-blue-500 border-b-blue-500" : "border-t-gray-100 border-b-gray-100"} ml-[12px] z-10 rotate-180 -mr-[12px]`}></div>
                  </div>
                  <div 
                    className={`${selectedStageInModal === "Proposal/Pricing" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"} py-1 px-4 flex items-center relative cursor-pointer`}
                    onClick={() => !isUpdating && handleStageClick("Proposal/Pricing")}
                  >
                    <div className={`absolute left-0 top-0 bottom-0 border-l-[12px] border-l-transparent border-t-[15px] border-b-[15px] ${selectedStageInModal === "Negotiation" ? "border-t-blue-500 border-b-blue-500" : "border-t-gray-100 border-b-gray-100"} -ml-[12px]`}></div>
                    <span className="text-sm">Proposal/Pricing</span>
                    <div className={`absolute right-0 top-0 bottom-0 border-l-[12px] border-l-transparent border-t-[15px] border-b-[15px] ${selectedStageInModal === "Proposal/Pricing" ? "border-t-blue-500 border-b-blue-500" : "border-t-gray-100 border-b-gray-100"} ml-[12px] z-10 rotate-180 -mr-[12px]`}></div>
                  </div>
                  <div 
                    className={`${selectedStageInModal === "Proposal Commercial" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"} py-1 px-4 flex items-center relative cursor-pointer`}
                    onClick={() => !isUpdating && handleStageClick("Proposal Commercial")}
                  >
                    <div className={`absolute left-0 top-0 bottom-0 border-l-[12px] border-l-transparent border-t-[15px] border-b-[15px] ${selectedStageInModal === "Proposal/Pricing" ? "border-t-blue-500 border-b-blue-500" : "border-t-gray-100 border-b-gray-100"} -ml-[12px]`}></div>
                    <span className="text-sm">Proposal Commercial</span>
                    <div className={`absolute right-0 top-0 bottom-0 border-l-[12px] border-l-transparent border-t-[15px] border-b-[15px] ${selectedStageInModal === "Proposal Commercial" ? "border-t-blue-500 border-b-blue-500" : "border-t-gray-100 border-b-gray-100"} ml-[12px] z-10 rotate-180 -mr-[12px]`}></div>
                  </div>
                  <div 
                    className={`${selectedStageInModal === "Identify Decision Makers" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"} py-1 px-4 rounded-r-md flex items-center relative cursor-pointer`}
                    onClick={() => !isUpdating && handleStageClick("Identify Decision Makers")}
                  >
                    <div className={`absolute left-0 top-0 bottom-0 border-l-[12px] border-l-transparent border-t-[15px] border-b-[15px] ${selectedStageInModal === "Proposal Commercial" ? "border-t-blue-500 border-b-blue-500" : "border-t-gray-100 border-b-gray-100"} -ml-[12px]`}></div>
                    <span className="text-sm">Identify Decision Makers</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex justify-between items-center text-sm py-3 border-b">
                  <span className="text-gray-500">Lead Owner</span>
                  <span className="font-medium">{selectedLead.Owner?.name}</span>
                </div>
                <div className="flex justify-between items-center text-sm py-3 border-b">
                  <span className="text-gray-500">Stage</span>
                  <span className="font-medium">{selectedStageInModal}</span>
                </div>
                <div className="flex justify-between items-center text-sm py-3 border-b">
                  <span className="text-gray-500">Probability (%)</span>
                  <span className="font-medium">20</span>
                </div>
                <div className="flex justify-between items-center text-sm py-3 border-b">
                  <span className="text-gray-500">Expected Revenue</span>
                  <span className="font-medium">MAD 12,000</span>
                </div>
                <div className="flex justify-between items-center text-sm py-3 border-b">
                  <span className="text-gray-500">Closing Date</span>
                  <span className="font-medium">14/02/2025</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default LeadManagementPanel;
