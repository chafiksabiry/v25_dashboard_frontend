import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  Clock,
  DollarSign,
  Building2,
  MapPin,
  Tags,
  ArrowUpRight,
  ArrowDownRight,
  Brain,
  Sparkles,
  Bot,
  Edit,
  Upload,
  AlertCircle,
} from "lucide-react";
import { LeadUploader } from "../components/LeadUploader";
import { ZohoTokenService } from '../services/zohoService';
import { useNavigate } from 'react-router-dom';

const zohoApiUrl = import.meta.env.VITE_ZOHO_API_URL;

function LeadManagementPanel() {
  const navigate = useNavigate();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isZohoConnected, setIsZohoConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zohoError, setZohoError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const retryDelay = 5000; // 5 seconds

  interface Lead {
    Pipeline_Id: string;
    id: string;
    Lead_Name: string;
    Amount: number;
    Probability: number;
    Stage: string;
    Closing_Date?: string;
    Account_Name?: {
      name: string;
      id: string;
    };
    Contact_Name?: {
      name: string;
      id: string;
    };
    Owner?: {
      name: string;
      email: string;
      id: string;
    };
    Created_Time?: string;
    Modified_Time?: string;
    Type?: string;
    $currency_symbol?: string;
    metadata?: {
      ai_analysis?: {
        score?: string;
      };
    };
  }

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
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [hasMoreRecords, setHasMoreRecords] = useState(false);
  const leadsPerPage = 200;
  const leadsPerView = 10; // Number of leads to display at once
  const [totalLeads, setTotalLeads] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentViewIndex, setCurrentViewIndex] = useState(0); // Index for horizontal scrolling
  const [allLeads, setAllLeads] = useState<Lead[]>([]);

  // Modify these new states to handle advanced filters
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filterStage, setFilterStage] = useState<string>('all');
  const [searchText, setSearchText] = useState('');

  // Calculate the lead range for the current page
  const getCurrentPageRange = () => {
    const start = (currentPage - 1) * leadsPerPage + 1;
    const end = Math.min(start + leadsPerPage - 1, totalLeads);
    return { start, end };
  };

  // Calculate the leads to display for the current view
  const getCurrentViewLeads = () => {
    const startIndex = currentViewIndex * leadsPerView;
    const endIndex = startIndex + leadsPerView;
    return leads.slice(startIndex, endIndex);
  };

  const handleNextView = () => {
    const maxViewIndex = Math.ceil(leads.length / leadsPerView) - 1;
    if (currentViewIndex < maxViewIndex) {
      setCurrentViewIndex(prev => prev + 1);
    }
  };

  const handlePrevView = () => {
    if (currentViewIndex > 0) {
      setCurrentViewIndex(prev => prev - 1);
    }
  };

  // Reset the view index when changing page
  useEffect(() => {
    setCurrentViewIndex(0);
  }, [currentPage]);

  // Modify the filtering logic to incorporate new filters
  useEffect(() => {
    if (!Array.isArray(allLeads)) {
      setFilteredLeads([]);
      setTotalLeads(0);
      return;
    }

    const filtered = allLeads.filter(lead => {
      // Filter by pipeline
      const pipelineMatch = selectedPipeline === 'all' || 
        pipelines.find(p => p.id === lead.Pipeline_Id)?.display_value === selectedPipeline;
      
      // Filter by stage
      const stageMatch = filterStage === 'all' || lead.Stage === filterStage;
      // Filter by search text
      const searchMatch = !searchText || 
        lead.Lead_Name.toLowerCase().includes(searchText.toLowerCase()) ||
        lead.Account_Name?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        lead.Contact_Name?.name?.toLowerCase().includes(searchText.toLowerCase());
      
      return pipelineMatch && stageMatch && searchMatch;
    });

    setFilteredLeads(filtered);
    setTotalLeads(filtered.length);
  }, [allLeads, selectedPipeline, filterStage, searchText, pipelines]);

  // Calculate the leads to display for the current page
  const getCurrentPageLeads = () => {
    return leads;
  };

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber < 1) return;
    setCurrentPage(pageNumber);
    fetchLeads(pageNumber);
  };

  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      handlePageChange(value);
    }
  };

  const fetchPipelines = async () => {
    try {
      setIsLoading(true);
      const token = ZohoTokenService.getToken();
      if (!token) throw new Error('No Zoho token found');

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
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeads = async (page: number = 1) => {
    try {
      const accessToken = localStorage.getItem('zoho_access_token');
      console.log("=== Fetch Leads ===");
      console.log("Token available:", accessToken ? "Yes" : "No");
      
      if (!accessToken) {
        setIsZohoConnected(false);
        handleZohoConnect();
        return;
      }

      const apiResponse = await fetch(`${zohoApiUrl}/leads?page=${page}`, {
        method: "GET",
        headers: {
          "Authorization": `Zoho-oauthtoken ${accessToken}`,
          "Content-Type": "application/json"
        }
      });

      if (!apiResponse.ok) {
        const errorData = JSON.parse(await apiResponse.text());
        throw new Error(errorData.message || "Error retrieving leads");
      }

      const result = JSON.parse(await apiResponse.text());
      
      console.log("Result leads : ", result.data.data.data);
      console.log("Result info : ", result.data.data.info);
      if (result.data?.data?.data) {
        setLeads(result.data.data.data);
        setIsZohoConnected(true);
        
        if (result.data.data.info) {
          setHasMoreRecords(result.data.data.info.more_records || false);
          setCurrentPage(result.data.data.info.page || 1);
        }

        // Update allLeads with new leads
        setAllLeads(prevLeads => {
          const newLeads = [...prevLeads];
          const startIndex = (page - 1) * leadsPerPage;
          result.data.data.data.forEach((lead: Lead, index: number) => {
            newLeads[startIndex + index] = lead;
          });
          return newLeads;
        });
      } else {
        setLeads([]);
        setAllLeads([]);
      }
      
    } catch (error) {
      console.error("Error retrieving leads:", error);
      setLeads([]);
      setAllLeads([]);
      if (error instanceof Error && 
          (error.message.includes('401') || error.message.includes('configuration'))) {
        setIsZohoConnected(false);
        await handleZohoConnect();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Modify the initial useEffect to not check configuration
  useEffect(() => {
    const token = localStorage.getItem('zoho_access_token');
    console.log("=== Initialization ===");
    console.log("Token at startup:", token ? "Present" : "Absent");
    
    if (token) {
      console.log("Token value:", token);
      setIsZohoConnected(true);
      fetchLeads(1);
      fetchPipelines();
    } else {
      console.log("No token found - Zoho configuration");
      setIsZohoConnected(false);
      setIsLoading(false);
      handleZohoConnect();
    }
  }, []);

  // Reset the current page when changing filter
  useEffect(() => {
    // Don't reset the page, but retrieve data from the current page
    fetchLeads(currentPage);
  }, [selectedPipeline]);

  const handlePipelineChange = (pipelineId: string) => {
    setSelectedPipeline(pipelineId);
    setSelectedStage('all'); // Reset selected stage
    
    // Find and log stages of the selected pipeline
    const selectedPipelineData = pipelines.find(p => p.id === pipelineId);
    if (selectedPipelineData) {
      console.log('Selected pipeline:', selectedPipelineData.display_value);
      console.log('Available stages:', selectedPipelineData.maps);
    }
  };

  console.log("Leads:", leads);

  const handleZohoConnect = async () => {
    try {
      setIsLoading(true);
      setZohoError(null);
      
      // Ensure you use the correct values for these parameters
      const configData = {
        clientId: "1000.xxxx", // Replace with your actual Client ID
        clientSecret: "xxxx", // Replace with your actual Client Secret
        refreshToken: "xxxx" // Replace with your actual Refresh Token
      };
      
      console.log("Attempting configuration with:", configData);
      
      // First step: Configuration
      const configResponse = await fetch(`${zohoApiUrl}/configure`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(configData)
      });

      const configResult = await configResponse.json();
      console.log("Configuration response:", configResult);

      if (!configResponse.ok) {
        if (configResult.error === "Access Denied" && configResult.error_description?.includes("too many requests")) {
          if (retryCount < maxRetries) {
            setZohoError(`Too many requests. New attempt in ${retryDelay/1000} seconds... (${retryCount + 1}/${maxRetries})`);
            setRetryCount(prev => prev + 1);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            return handleZohoConnect();
          } else {
            throw new Error("Maximum attempts reached. Please try again later.");
          }
        }
        throw new Error(configResult.message || 'Error during configuration');
      }

      if (configResult.success) {
        console.log("Configuration successful, retrieving token...");
        setRetryCount(0); // Reset counter in case of success
        
        // Second step: Retrieving token
        const tokenResponse = await fetch(`${zohoApiUrl}/token`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!tokenResponse.ok) {
          throw new Error('Error retrieving token');
        }

        const tokenResult = await tokenResponse.json();
        console.log("Token response:", tokenResult);
        
        if (tokenResult.access_token) {
          console.log("New token retrieved:", tokenResult.access_token);
          localStorage.setItem('zoho_access_token', tokenResult.access_token);
          setIsZohoConnected(true);
          // Reload data after obtaining token
          await Promise.all([fetchLeads(), fetchPipelines()]);
        } else {
          throw new Error('Token not received');
        }
      }
      
    } catch (error) {
      console.error('Error during configuration:', error);
      setIsZohoConnected(false);
      setZohoError(error instanceof Error ? error.message : 'Unknown error during connection to Zoho CRM');
    } finally {
      setIsLoading(false);
    }
  };

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
      if (error instanceof Error && error.message === "Access token not found") {
        setIsZohoConnected(false);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const [showEditForm, setShowEditForm] = useState(false);
  const [editableLead, setEditableLead] = useState<Lead | null>(null);

  const handleEditClick = (e: React.MouseEvent, lead: Lead) => {
    e.stopPropagation();  // Prevent click triggering on the line
    setEditableLead(lead);
    setShowEditForm(true);
  };

  const closeEditForm = () => {
    setShowEditForm(false);
    setEditableLead(null);
  };

  const handleEditFormSubmit = async (e: React.FormEvent, updatedLead: Lead) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      const accessToken = localStorage.getItem('zoho_access_token');
      if (!accessToken) {
        throw new Error("Access token not found");
      }
      
      const updateData = {
        Lead_Name: updatedLead.Lead_Name,
        Amount: updatedLead.Amount,
        Probability: updatedLead.Probability,
        Stage: updatedLead.Stage,
      };
      
      const response = await fetch(`${zohoApiUrl}/leads/${updatedLead.id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Zoho-oauthtoken ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        throw new Error("Failed to update lead");
      }
      
      // Update leads list
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          lead.id === updatedLead.id ? updatedLead : lead
        )
      );
      
      // Refresh leads from the server
      refreshLeads();
      
      closeEditForm();
      console.log("Lead updated successfully");
      
    } catch (error: unknown) {
      console.error("Error updating lead:", error);
      if (error instanceof Error && error.message === "Access token not found") {
        setIsZohoConnected(false);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Add a logout function
  const handleZohoDisconnect = () => {
    localStorage.removeItem('zoho_access_token');
    setIsZohoConnected(false);
    setLeads([]);
    setPipelines([]);
  };

  // Check if Zoho is connected
  const checkZohoConnection = () => {
    const token = ZohoTokenService.getToken();
    if (!token) {
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (!checkZohoConnection()) {
      setError('Connection to Zoho CRM required');
    } else {
      fetchLeads();
    }
  }, []);


  // Get stages of the selected pipeline
  const getSelectedPipelineStages = () => {
    if (selectedPipeline === 'all') {
      return [];
    }
    return pipelines.find(p => p.id === selectedPipeline)?.maps || [];
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!checkZohoConnection()) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-amber-600">
              <AlertCircle className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Connection Required</h2>
            </div>
            <p className="text-gray-600">
              You need to connect to Zoho CRM to access leads.
            </p>
            {zohoError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {zohoError}
              </div>
            )}
            <button
              onClick={handleZohoConnect}
              disabled={isLoading || retryCount >= maxRetries}
              className={`px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 ${
                (isLoading || retryCount >= maxRetries) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Connecting...' : 'Connect to Zoho CRM'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold">Lead Management</h2>
          </div>
          <div className="flex gap-2">
            {isZohoConnected && (
              <button
                onClick={handleZohoDisconnect}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Disconnect Zoho
              </button>
            )}
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Import Leads
            </button>
          </div>
        </div>

        {!isZohoConnected ? (
          <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <div className="text-center mb-6">
              <div className="p-4 bg-blue-100 rounded-full inline-block mb-4">
                <Building2 className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Connect to Zoho CRM</h2>
              <p className="text-gray-600 max-w-md mb-6">
                To access your leads and manage your leads, you must first connect to your Zoho CRM account.
              </p>
              <button
                onClick={handleZohoConnect}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium flex items-center gap-2 mx-auto"
              >
                <Users className="w-5 h-5" />
                Connect to Zoho CRM
              </button>
            </div>
          </div>
        ) : (
          <>
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
                      placeholder="Search by name, company, amount..."
                      className="pl-10 pr-4 py-2 border rounded-lg w-96 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button 
                    onClick={() => setShowFilterPanel(!showFilterPanel)}
                    className="p-2 border rounded-lg hover:bg-gray-100 flex items-center gap-1"
                  >
                    <Filter className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-600">Advanced Filters</span>
                  </button>
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
                  
                  <div className="grid grid-cols-2 gap-6">
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
                            <option key={pipeline.id} value={pipeline.id}>
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
                          onChange={(e) => setSelectedStage(e.target.value)}
                          className="w-full p-2.5 text-gray-700 bg-white border border-purple-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                        >
                          <option value="all">All Stages</option>
                          {getSelectedPipelineStages().map((stage) => (
                            <option key={stage.id} value={stage.id}>
                              {stage.display_value} ({stage.forecast_type})
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
                {selectedPipeline !== 'all' && (
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    Pipeline: {selectedPipeline}
                    <button onClick={() => handlePipelineChange('all')} className="ml-1 hover:text-blue-900">×</button>
                  </div>
                )}
                
                {selectedStage !== 'all' && (
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    Stage: {selectedStage}
                    <button onClick={() => setSelectedStage('all')} className="ml-1 hover:text-green-900">×</button>
                  </div>
                )}
                
                {searchText && (
                  <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    Search: {searchText}
                    <button onClick={() => setSearchText('')} className="ml-1 hover:text-purple-900">×</button>
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="relative">
                <table className="w-full">
                  <thead className="sticky top-0 bg-white z-10">
                    <tr key="header" className="text-left border-b">
                      <th className="pb-3 px-4 py-3 text-sm font-semibold text-gray-600 bg-gray-50">#</th>
                      <th className="pb-3 px-4 py-3 text-sm font-semibold text-gray-600 bg-gray-50">Lead Details</th>
                      <th className="pb-3 px-4 py-3 text-sm font-semibold text-gray-600 bg-gray-50">Stage</th>
                      <th className="pb-3 px-4 py-3 text-sm font-semibold text-gray-600 bg-gray-50">Value</th>
                      <th className="pb-3 px-4 py-3 text-sm font-semibold text-gray-600 bg-gray-50">AI Insights</th>
                      <th className="pb-3 px-4 py-3 text-sm font-semibold text-gray-600 bg-gray-50">Last Contact</th>
                      <th className="pb-3 px-4 py-3 text-sm font-semibold text-gray-600 bg-gray-50">Next Action</th>
                      <th className="pb-3 px-4 py-3 text-sm font-semibold text-gray-600 bg-gray-50">Actions</th>
                    </tr>
                  </thead>
                </table>
                <div className="max-h-[400px] overflow-y-auto">
                  <table className="w-full">
                    <tbody className="divide-y">
                      {getCurrentPageLeads().length > 0 ? (
                        getCurrentPageLeads().map((lead, index) => (
                          <tr 
                            key={lead.id} 
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleLeadClick(lead)}
                          >
                            <td className="py-3">
                              <div className="text-gray-600 font-medium">
                                {index + 1}
                              </div>
                            </td>
                            <td className="py-3">
                              <div>
                                <div className="font-medium">{lead.Lead_Name}</div>
                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                  <Building2 className="w-4 h-4" />
                                  {lead.Account_Name?.name || "N/A"}
                                </div>
                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {lead.Contact_Name?.name || "N/A"}
                                </div>
                              </div>
                            </td>
                            <td className="py-3">
                              <span className="text-black text-xs font-bold">
                                {lead.Stage}
                              </span>
                            </td>
                            <td className="py-3">
                              <div>
                                <div className="font-medium">
                                  {lead.$currency_symbol || "$"}{lead.Amount?.toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {lead.Probability}% probability
                                </div>
                              </div>
                            </td>
                            <td className="py-3">
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
                            <td className="py-3">
                              <div>
                                <div className="text-sm">
                                  {lead.Modified_Time ? new Date(lead.Modified_Time).toLocaleDateString() : "N/A"}
                                </div>
                                <div className="text-sm text-gray-500">{lead.Owner?.name || "N/A"}</div>
                              </div>
                            </td>
                            <td className="py-3">
                              <div className="text-sm">Follow-up</div>
                              <div className="text-sm text-gray-500">Tomorrow</div>
                            </td>
                            <td className="py-3">
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
                          <td colSpan={7} className="py-4 text-center text-gray-500">
                            {isLoading ? "Loading..." : "No leads found"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      
      {isZohoConnected && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
            <input
              type="number"
              min="1"
              value={currentPage}
              onChange={handlePageInput}
              className="w-20 px-2 py-1 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
            />
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!hasMoreRecords}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
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

      {showEditForm && editableLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Edit className="w-5 h-5 text-blue-600" />
                  Edit Lead
                </h2>
                <button 
                  onClick={closeEditForm}
                  className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <form onSubmit={(e) => handleEditFormSubmit(e, editableLead)}>
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
                      className={`${editableLead.Stage === "Qualification" ? "bg-blue-500 text-white" : "bg-blue-100 text-gray-800"} py-1 px-4 rounded-l-md flex items-center cursor-pointer`}
                      onClick={() => setEditableLead({...editableLead, Stage: "Qualification"})}
                    >
                      <span className="text-sm">Qualification</span>
                    </div>
                    <div 
                      className={`${editableLead.Stage === "Analyze Needs" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"} py-1 px-4 flex items-center relative cursor-pointer`}
                      onClick={() => setEditableLead({...editableLead, Stage: "Analyze Needs"})}
                    >
                      <div className={`absolute left-0 top-0 bottom-0 border-l-[12px] border-l-transparent border-t-[15px] border-b-[15px] ${editableLead.Stage === "Qualification" ? "border-t-blue-500 border-b-blue-500" : "border-t-blue-100 border-b-blue-100"} -ml-[12px]`}></div>
                      <span className="text-sm">Analyze Needs</span>
                      <div className={`absolute right-0 top-0 bottom-0 border-l-[12px] border-l-transparent border-t-[15px] border-b-[15px] ${editableLead.Stage === "Analyze Needs" ? "border-t-blue-500 border-b-blue-500" : "border-t-gray-100 border-b-gray-100"} ml-[12px] z-10 rotate-180 -mr-[12px]`}></div>
                    </div>
                    <div 
                      className={`${editableLead.Stage === "Negotiation" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"} py-1 px-4 flex items-center relative cursor-pointer`}
                      onClick={() => setEditableLead({...editableLead, Stage: "Negotiation"})}
                    >
                      <div className={`absolute left-0 top-0 bottom-0 border-l-[12px] border-l-transparent border-t-[15px] border-b-[15px] ${editableLead.Stage === "Analyze Needs" ? "border-t-blue-500 border-b-blue-500" : "border-t-gray-100 border-b-gray-100"} -ml-[12px]`}></div>
                      <span className="text-sm">Negotiation</span>
                      <div className={`absolute right-0 top-0 bottom-0 border-l-[12px] border-l-transparent border-t-[15px] border-b-[15px] ${editableLead.Stage === "Negotiation" ? "border-t-blue-500 border-b-blue-500" : "border-t-gray-100 border-b-gray-100"} ml-[12px] z-10 rotate-180 -mr-[12px]`}></div>
                    </div>
                    <div 
                      className={`${editableLead.Stage === "Proposal/Pricing" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"} py-1 px-4 flex items-center relative cursor-pointer`}
                      onClick={() => setEditableLead({...editableLead, Stage: "Proposal/Pricing"})}
                    >
                      <div className={`absolute left-0 top-0 bottom-0 border-l-[12px] border-l-transparent border-t-[15px] border-b-[15px] ${editableLead.Stage === "Negotiation" ? "border-t-blue-500 border-b-blue-500" : "border-t-gray-100 border-b-gray-100"} -ml-[12px]`}></div>
                      <span className="text-sm">Proposal/Pricing</span>
                      <div className={`absolute right-0 top-0 bottom-0 border-l-[12px] border-l-transparent border-t-[15px] border-b-[15px] ${editableLead.Stage === "Proposal/Pricing" ? "border-t-blue-500 border-b-blue-500" : "border-t-gray-100 border-b-gray-100"} ml-[12px] z-10 rotate-180 -mr-[12px]`}></div>
                    </div>
                    <div 
                      className={`${editableLead.Stage === "Proposal Commercial" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"} py-1 px-4 flex items-center relative cursor-pointer`}
                      onClick={() => setEditableLead({...editableLead, Stage: "Proposal Commercial"})}
                    >
                      <div className={`absolute left-0 top-0 bottom-0 border-l-[12px] border-l-transparent border-t-[15px] border-b-[15px] ${editableLead.Stage === "Proposal/Pricing" ? "border-t-blue-500 border-b-blue-500" : "border-t-gray-100 border-b-gray-100"} -ml-[12px]`}></div>
                      <span className="text-sm">Proposal Commercial</span>
                      <div className={`absolute right-0 top-0 bottom-0 border-l-[12px] border-l-transparent border-t-[15px] border-b-[15px] ${editableLead.Stage === "Proposal Commercial" ? "border-t-blue-500 border-b-blue-500" : "border-t-gray-100 border-b-gray-100"} ml-[12px] z-10 rotate-180 -mr-[12px]`}></div>
                    </div>
                    <div 
                      className={`${editableLead.Stage === "Identify Decision Makers" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"} py-1 px-4 rounded-r-md flex items-center relative cursor-pointer`}
                      onClick={() => setEditableLead({...editableLead, Stage: "Identify Decision Makers"})}
                    >
                      <div className={`absolute left-0 top-0 bottom-0 border-l-[12px] border-l-transparent border-t-[15px] border-b-[15px] ${editableLead.Stage === "Proposal Commercial" ? "border-t-blue-500 border-b-blue-500" : "border-t-gray-100 border-b-gray-100"} -ml-[12px]`}></div>
                      <span className="text-sm">Identify Decision Makers</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lead Name</label>
                      <input
                        type="text"
                        value={editableLead.Lead_Name}
                        onChange={(e) => setEditableLead({...editableLead, Lead_Name: e.target.value})}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                          {editableLead.$currency_symbol || "$"}
                        </span>
                        <input
                          type="number"
                          value={editableLead.Amount}
                          onChange={(e) => setEditableLead({...editableLead, Amount: Number(e.target.value)})}
                          className="w-full p-2.5 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        defaultValue="2025-02-11"
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Probability (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editableLead.Probability}
                        onChange={(e) => setEditableLead({...editableLead, Probability: Number(e.target.value)})}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
                      <input
                        type="text"
                        value={editableLead.Account_Name?.name || ""}
                        onChange={(e) => setEditableLead({
                          ...editableLead,
                          Account_Name: {
                            id: editableLead.Account_Name?.id || '',
                            name: e.target.value
                          }
                        })}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Closing Date</label>
                      <input
                        type="date"
                        defaultValue="2025-02-14"
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={closeEditForm}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isUpdating ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Updating...
                      </>
                    ) : (
                      <>Save Changes</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeadManagementPanel;
