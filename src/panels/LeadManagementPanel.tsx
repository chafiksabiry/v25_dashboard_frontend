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
} from "lucide-react";
import { LeadUploader } from "../components/LeadUploader";
import { useNavigate } from 'react-router-dom';
import { leadsApi } from '../services/api/leads';
import Cookies from 'js-cookie';

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

  // Modifier le composant PaginationControls pour permettre la navigation pendant le chargement
  const PaginationControls = () => {
    const pageNumbers = [];
    const maxVisiblePages = 7;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
        <div className="flex justify-between flex-1 sm:hidden">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              {/* {isLoadingMore ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                  Loading more data...
                </span>
              ) : ( */}
                <>
                  Showing <span className="font-medium">{(currentPage - 1) * LEADS_PER_PAGE + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * LEADS_PER_PAGE, totalLeads)}
                  </span>{" "}
                  of <span className="font-medium">{totalLeads}</span> results
                </>
              {/* )} */}
            </p>
          </div>
          <div>
            <nav className="inline-flex -space-x-px rounded-md shadow-sm isolate" aria-label="Pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-l-md border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Previous</span>
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                </svg>
              </button>
              {pageNumbers.map((number) => (
                <button
                  key={number}
                  onClick={() => handlePageChange(number)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                    currentPage === number
                      ? "z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                      : "text-gray-900 border border-gray-300 bg-white hover:bg-gray-50"
                  }`}
                >
                  {number}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-r-md border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Next</span>
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-gradient-to-br from-blue-50 to-white min-h-screen p-4">
      {/* Page Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-3 flex items-center">
              <Users className="mr-3 h-8 w-8 text-blue-600" />
              Upload Contacts
            </h1>
            <p className="text-lg text-gray-600">
              Import, manage, and organize your leads efficiently. Choose between connecting with your CRM system or uploading contact files directly.
            </p>
          </div>
        </div>
      </div>

      {/* Gigs Selection Dropdown */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 transition-all duration-300 ease-in-out">
        <h4 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
          <Building2 className="mr-3 h-6 w-6 text-slate-600" />
          Select a Gig
        </h4>
        {isLoadingGigs ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
            <span className="ml-4 text-base text-slate-600 font-medium">Loading gigs...</span>
          </div>
        ) : gigs.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-16 w-16 text-slate-300 mb-4">
              <Building2 className="h-16 w-16" />
            </div>
            <p className="text-base text-slate-500 font-medium">No gigs available.</p>
          </div>
        ) : (
          <div className="max-w-lg">
            <select
              value={selectedGig?._id || ''}
              onChange={(e) => {
                const gig = gigs.find(g => g._id === e.target.value);
                if (gig) handleGigChange(gig);
              }}
              className="w-full rounded-xl border-2 border-slate-300 py-4 px-5 text-base font-medium focus:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-2 bg-white shadow-sm hover:border-slate-400 transition-all duration-200"
            >
              <option value="" className="text-slate-500">Select a gig...</option>
              {gigs.map((gig) => (
                <option key={gig._id} value={gig._id} className="text-slate-900">
                  {gig.title || gig.name || `Gig ${gig._id}`}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Import Methods Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <Upload className="mr-2 h-5 w-5 text-blue-600" />
            Import Leads
          </h3>
          <p className="mt-1 text-sm text-gray-600">Choose your preferred method to import leads into your selected gig.</p>
        </div>

        {/* Import Methods Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
          {/* Zoho Import Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mr-4 border-2 border-blue-200 shadow-sm">
                <Upload className="h-6 w-6 text-blue-700" />
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-blue-900">Zoho CRM Integration</h4>
                <p className="text-sm text-blue-700">Connect and sync with your Zoho CRM</p>
              </div>
            </div>
            
            {/* Connection Status */}
            <div className="mb-4">
              {localStorage.getItem('zoho_access_token') ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                  <span className="text-sm font-medium text-green-800">✓ Connected to Zoho CRM</span>
                  <button
                    className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors duration-200"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <span className="text-sm font-medium text-yellow-800">⚠ Not connected</span>
                  <button
                    onClick={() => navigate('/integrations')}
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
                    alert('Please select a gig first');
                    return;
                  }
                  if (!localStorage.getItem('zoho_access_token')) {
                    navigate('/integrations');
                    return;
                  }
                  await handleImportFromZoho();
                }}
                disabled={isImporting}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                {isImporting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                    Importing from Zoho...
                  </>
                ) : !localStorage.getItem('zoho_access_token') ? (
                  <>
                    <Upload className="h-5 w-5 mr-3" />
                    Connect to Zoho CRM First
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 mr-3" />
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
                <Upload className="h-6 w-6 text-blue-700" />
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
                onClick={() => {
                  if (!selectedGig) {
                    alert('Please select a gig first');
                    return;
                  }
                  setShowUploadModal(true);
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                <Upload className="h-5 w-5 mr-3" />
                Click to upload or drag and drop
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Message when no gig is selected */}
      {!selectedGig && (
        <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Gig Selected</h3>
          <p className="text-gray-600">Please select a gig from the dropdown above to view and manage leads.</p>
        </div>
      )}

      {/* Leads List Section - Only show if a gig is selected */}
      {selectedGig && (
        <>
          {/* Statistics Cards */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100" style={{ backgroundColor: '#f3f4f6' }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="font-medium text-gray-700">Total Leads</div>
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-2">{leads?.length ?? 0}</div>
                <div className="text-sm text-gray-600 flex items-center gap-1">
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                  <span className="text-green-500">12% increase</span>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100" style={{ backgroundColor: '#f3f4f6' }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="font-medium text-gray-700">Pipeline Value</span>
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-2">$1.2M</div>
                <div className="text-sm text-gray-600 flex items-center gap-1">
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                  <span className="text-green-500">8% increase</span>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100" style={{ backgroundColor: '#f3f4f6' }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <Brain className="w-5 h-5 text-amber-600" />
                  </div>
                  <span className="font-medium text-gray-700">AI Score</span>
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-2">85%</div>
                <div className="text-sm text-gray-600 flex items-center gap-1">
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                  <span className="text-green-500">5% increase</span>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100" style={{ backgroundColor: '#f3f4f6' }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <Clock className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="font-medium text-gray-700">Avg Response</span>
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-2">2.4h</div>
                <div className="text-sm text-gray-600 flex items-center gap-1">
                  <ArrowDownRight className="w-4 h-4 text-red-500" />
                  <span className="text-red-500">3% increase</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      placeholder="Search by name, company, email, phone, stage..."
                      className="pl-10 pr-4 py-2 border rounded-lg w-96 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {searchText && (
                      <button
                        onClick={() => setSearchText('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <button 
                    onClick={() => setShowFilterPanel(!showFilterPanel)}
                    className="p-2 border rounded-lg hover:bg-gray-100 flex items-center gap-1"
                  >
                    <Filter className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-600">Advanced Filters</span>
                  </button>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">{allLeads.length}</span>
                  <span>leads found</span>
                </div>
              </div>

              {showFilterPanel && (
                <div className="bg-gradient-to-br from-white to-blue-50 p-5 rounded-lg border border-blue-100 shadow-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-lg text-gray-800 flex items-center gap-2">
                      <Filter className="w-5 h-5 text-blue-600" />
                      <span>Advanced Filters</span>
                    </h3>
                    <button
                      onClick={() => setShowFilterPanel(false)}
                      className="text-gray-500 hover:text-gray-700 bg-white p-1.5 rounded-full hover:bg-gray-100"
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <h3 className="font-medium text-green-700 border-b border-green-200 pb-2 flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Gig
                      </h3>
                      <div className="w-full relative">
                        <select
                          value={selectedGig?._id || ''}
                          onChange={(e) => {
                            const gig = gigs.find(g => g._id === e.target.value);
                            if (gig) handleGigChange(gig);
                          }}
                          className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="font-medium text-blue-700 border-b border-blue-200 pb-2 flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Pipeline
                      </h3>
                      <div className="w-full relative">
                        <select
                          value={selectedPipeline}
                          onChange={(e) => handlePipelineChange(e.target.value)}
                          className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                          <option value="all">All Pipelines</option>
                          {pipelines.map((pipeline) => (
                            <option key={pipeline.id} value={pipeline.display_value}>
                              {pipeline.display_value}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="font-medium text-purple-700 border-b border-purple-200 pb-2 flex items-center gap-2">
                        <Tags className="w-4 h-4" />
                        Stage
                      </h3>
                      <div className="w-full relative">
                        <select
                          value={selectedStage}
                          onChange={(e) => handleStageChange(e.target.value)}
                          className="w-full p-2.5 text-gray-700 bg-white border border-purple-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                        >
                          <option value="all">All Stages</option>
                          {getSelectedPipelineStages().map((stage) => (
                            <option key={stage.id} value={stage.display_value}>
                              {stage.display_value}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-5 pt-3 border-t border-blue-100 flex justify-between items-center">
                    <button
                      onClick={() => {
                        setSearchText('');
                        setSelectedStage('all');
                        handlePipelineChange('all');
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-300 transition-colors flex items-center gap-2"
                    >
                      <Filter className="w-4 h-4" />
                      Reset Filters
                    </button>
                    
                    <button
                      onClick={() => setShowFilterPanel(false)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors flex items-center gap-2"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2">
                {selectedGig && (
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    Gig: {selectedGig.title || selectedGig.name || `Gig ${selectedGig._id}`}
                    <button onClick={() => setSelectedGig(null)} className="ml-1 hover:text-green-900">×</button>
                  </div>
                )}
                
                {selectedPipeline !== 'all' && (
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    Pipeline: {selectedPipeline}
                    <button onClick={() => handlePipelineChange('all')} className="ml-1 hover:text-blue-900">×</button>
                  </div>
                )}
                
                {selectedStage !== 'all' && (
                  <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    Stage: {getSelectedPipelineStages().find(s => s.display_value === selectedStage)?.display_value || selectedStage}
                    <button onClick={() => setSelectedStage('all')} className="ml-1 hover:text-purple-900">×</button>
                  </div>
                )}
                
                {searchText && (
                  <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    Search: {searchText}
                    <button onClick={() => setSearchText('')} className="ml-1 hover:text-orange-900">×</button>
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="relative">
                <div className="max-h-[400px] overflow-y-auto">
                  <table className="w-full border border-gray-200 table-fixed">
                    <thead className="sticky top-0 bg-white z-10">
                      <tr key="header" className="text-left border-b border-gray-200">
                        <th className="w-[18%] px-4 py-4 text-sm font-semibold text-gray-700 bg-gray-100 border-r border-gray-200 text-left">Lead Details</th>
                        <th className="w-[13%] px-4 py-4 text-sm font-semibold text-gray-700 bg-gray-100 border-r border-gray-200 text-left">Value</th>
                        <th className="w-[13%] px-4 py-4 text-sm font-semibold text-gray-700 bg-gray-100 border-r border-gray-200 text-left">AI Insights</th>
                        <th className="w-[13%] px-4 py-4 text-sm font-semibold text-gray-700 bg-gray-100 border-r border-gray-200 text-left">Last Contact</th>
                        <th className="w-[12%] px-4 py-4 text-sm font-semibold text-gray-700 bg-gray-100 border-r border-gray-200 text-left">Next Action</th>
                        <th className="w-[13%] px-4 py-4 text-sm font-semibold text-gray-700 bg-gray-100 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {isLoadingMore ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center">
                            <div className="flex flex-col items-center justify-center space-y-3">
                              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                              <p className="text-gray-600 font-medium">Loading leads...</p>
                            </div>
                          </td>
                        </tr>
                      ) : displayedLeads.length > 0 ? (
                        displayedLeads.map((lead, index) => (
                          <tr 
                            key={`${lead._id}-${lead.id}-${index}`}
                            className="hover:bg-gray-50 cursor-pointer border-b border-gray-200"
                            onClick={() => handleLeadClick(lead)}
                          >
                            <td className="w-[18%] px-4 py-4 border-r border-gray-200 text-left">
                              <div>
                                <div className="font-medium">{lead.Deal_Name}</div>
                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                  <Building2 className="w-4 h-4" />
                                  {lead.Contact_Name?.name || "N/A"}
                                </div>
                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                  <Phone className="w-4 h-4" />
                                  {lead.Phone || lead.Telephony || "N/A"}
                                </div>
                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                  <Mail className="w-4 h-4" />
                                  {lead.Email_1 || "N/A"}
                                </div>
                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                  <p>
                                    <b>Pipeline :</b> {typeof lead.Pipeline === 'object' ? lead.Pipeline.name : lead.Pipeline || "N/A"}
                                    <br />
                                    <b>Stage :</b> {lead.Stage || "N/A"}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="w-[13%] px-4 py-4 border-r border-gray-200 text-left">
                              <div>
                                <div className="font-medium">
                                  {lead.$currency_symbol || "$"}{lead.Amount ? lead.Amount.toLocaleString() : "0"}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {lead.Probability ? `${lead.Probability}%` : "0%"} probability
                                </div>
                              </div>
                            </td>
                            <td className="w-[13%] px-4 py-4 border-r border-gray-200 text-left">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                  <Brain className="w-4 h-4 text-purple-600" />
                                  <span>
                                    Score: {lead.metadata?.ai_analysis?.score || "N/A"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Sparkles className="w-4 h-4 text-yellow-600" />
                                  <span>
                                    {lead.Type || "N/A"}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="w-[13%] px-4 py-4 border-r border-gray-200 text-left">
                              <div>
                                <div className="text-sm">
                                  {lead.Modified_Time ? new Date(lead.Modified_Time).toLocaleDateString() : "N/A"}
                                </div>
                                <div className="text-sm text-gray-500">{lead.Owner?.name || "N/A"}</div>
                              </div>
                            </td>
                            <td className="w-[12%] px-4 py-4 border-r border-gray-200 text-left">
                              <div className="text-sm">Follow-up</div>
                              <div className="text-sm text-gray-500">Tomorrow</div>
                            </td>
                            <td className="w-[13%] px-4 py-4 text-left">
                              <div className="flex items-center gap-2">
                                <button
                                  className="p-2 hover:bg-gray-100 rounded-lg text-purple-600"
                                  title="AI Analysis"
                                >
                                  <Brain className="w-5 h-5" />
                                </button>
                                <button
                                  className="p-2 hover:bg-gray-100 rounded-lg text-blue-600"
                                  title="Generate Script"
                                >
                                  <Bot className="w-5 h-5" />
                                </button>
                                <button
                                  className="p-2 hover:bg-gray-100 rounded-lg"
                                  title="Edit Lead"
                                  onClick={(e) => handleEditClick(e, lead)}
                                >
                                  <Edit className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-4 text-center text-gray-500 border-b border-gray-200">
                            No leads found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Add pagination controls */}
            <PaginationControls />
          </div>
        </>
      )}

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

      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-amber-600">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Connection Required</h2>
              <p className="text-gray-600">
                You need to connect to Zoho CRM to import leads. Please configure your Zoho CRM integration first.
              </p>
              <div className="flex justify-center gap-3 mt-6">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    navigate('/integrations');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Configure Zoho Integration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeadManagementPanel;
