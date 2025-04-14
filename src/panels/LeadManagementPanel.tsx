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
import { ZohoTokenService, API_BASE_URL } from '../services/zohoService';
import { useNavigate } from 'react-router-dom';

function LeadManagementPanel() {
  const navigate = useNavigate();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isZohoConnected, setIsZohoConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  interface Deal {
    Pipeline_Id: string;
    id: string;
    Deal_Name: string;
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

  const [deals, setDeals] = useState<Deal[]>([]);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  
  const [currentPage, setCurrentPage] = useState(1);
  const dealsPerPage = 20;

  // Modifier ces nouveaux états pour gérer les filtres avancés
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filterStage, setFilterStage] = useState<string>('all');
  const [searchText, setSearchText] = useState('');

  // Modifier la logique de filtrage pour intégrer les nouveaux filtres
  const filteredDeals = deals.filter(deal => {
    // Filtre par pipeline
    const pipelineMatch = selectedPipeline === 'all' || 
      pipelines.find(p => p.id === deal.Pipeline_Id)?.display_value === selectedPipeline;
    
    // Filtre par stage
    const stageMatch = filterStage === 'all' || deal.Stage === filterStage;
    // Filtre par texte de recherche
    const searchMatch = !searchText || 
      deal.Deal_Name.toLowerCase().includes(searchText.toLowerCase()) ||
      deal.Account_Name?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      deal.Contact_Name?.name?.toLowerCase().includes(searchText.toLowerCase());
    
    return pipelineMatch && stageMatch && searchMatch;
  });

  // Extraire les stages uniques
  const uniqueStages = [...new Set(deals.map(deal => deal.Stage))].filter(Boolean);

  const indexOfLastDeal = currentPage * dealsPerPage;
  const indexOfFirstDeal = indexOfLastDeal - dealsPerPage;
  const currentDeals = filteredDeals.slice(indexOfFirstDeal, indexOfLastDeal);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const totalPages = Math.ceil(filteredDeals.length / dealsPerPage);

  const fetchPipelines = async () => {
    try {
      setIsLoading(true);
      const token = ZohoTokenService.getToken();
      if (!token) throw new Error('No Zoho token found');

      const response = await fetch('https://api-dashboard.harx.ai/api/zoho/pipelines', {
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

  const fetchDeals = async () => {
    try {
      const accessToken = localStorage.getItem('zoho_access_token');
      console.log("=== Fetch Deals ===");
      console.log("Token disponible:", accessToken ? "Oui" : "Non");
      
      if (!accessToken) {
        setIsZohoConnected(false);
        handleZohoConnect();
        return;
      }

      const response = await fetch(`https://api-dashboard.harx.ai/api/zoho/leads`, {
        method: "GET",
        headers: {
          "Authorization": `Zoho-oauthtoken ${accessToken}`,
          "Content-Type": "application/json"
        }
      });

      console.log("Status de la réponse:", response.status);
      const responseText = await response.text();
      console.log("Réponse brute:", responseText);

      if (!response.ok) {
        const errorData = JSON.parse(responseText);
        console.error("Erreur réponse leads:", errorData);
        
        if (errorData.message.includes('configuration')) {
          console.log("Configuration requise, tentative de configuration...");
          await handleZohoConnect();
          return;
        }
        
        throw new Error(errorData.message || "Erreur lors de la récupération des leads");
      }

      const result = JSON.parse(responseText);
      console.log("Leads récupérés :", result);
      
      if (result.data?.data) {
        setDeals(result.data.data);
        setIsZohoConnected(true);
      } else {
        console.log("Aucun lead trouvé dans la réponse");
      }
      
    } catch (error: unknown) {
      console.error("Erreur lors de la récupération des leads:", error);
      if (error instanceof Error && 
          (error.message.includes('401') || error.message.includes('configuration'))) {
        setIsZohoConnected(false);
        await handleZohoConnect();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Modifier l'useEffect initial pour ne pas vérifier la configuration
  useEffect(() => {
    const token = localStorage.getItem('zoho_access_token');
    console.log("=== Initialisation ===");
    console.log("Token au démarrage:", token ? "Présent" : "Absent");
    
    if (token) {
      console.log("Token value:", token);
      setIsZohoConnected(true);
      fetchDeals();
      fetchPipelines();
    } else {
      console.log("Aucun token trouvé - Configuration de Zoho");
      setIsZohoConnected(false);
      setIsLoading(false);
      handleZohoConnect();
    }
  }, []);

  // Réinitialiser la page courante quand on change de filtre
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedPipeline]);

  const handlePipelineChange = (pipelineId: string) => {
    setSelectedPipeline(pipelineId);
    setSelectedStage('all'); // Réinitialiser le stage sélectionné
    
    // Trouver et logger les stages de la pipeline sélectionnée
    const selectedPipelineData = pipelines.find(p => p.id === pipelineId);
    if (selectedPipelineData) {
      console.log('Pipeline sélectionnée:', selectedPipelineData.display_value);
      console.log('Stages disponibles:', selectedPipelineData.maps);
    }
  };

  const handleZohoConnect = async () => {
    try {
      setIsLoading(true);
      
      // Assurez-vous d'utiliser les bonnes valeurs pour ces paramètres
      const configData = {
        clientId: "1000.xxxx", // Remplacer par votre vrai Client ID
        clientSecret: "xxxx", // Remplacer par votre vrai Client Secret
        refreshToken: "xxxx" // Remplacer par votre vrai Refresh Token
      };
      
      console.log("Tentative de configuration avec:", configData);
      
      // Première étape : Configuration
      const configResponse = await fetch('https://api-dashboard.harx.ai/api/zoho/configure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(configData)
      });

      const configResult = await configResponse.json();
      console.log("Configuration response:", configResult);

      if (!configResponse.ok) {
        throw new Error(configResult.message || 'Erreur lors de la configuration de Zoho');
      }

      if (configResult.success) {
        console.log("Configuration réussie, récupération du token...");
        // Deuxième étape : Récupération du token
        const tokenResponse = await fetch('https://api-dashboard.harx.ai/api/zoho/token', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!tokenResponse.ok) {
          throw new Error('Erreur lors de la récupération du token');
        }

        const tokenResult = await tokenResponse.json();
        console.log("Token response:", tokenResult);
        
        if (tokenResult.access_token) {
          console.log("Nouveau token récupéré:", tokenResult.access_token);
          localStorage.setItem('zoho_access_token', tokenResult.access_token);
          setIsZohoConnected(true);
          // Recharger les données après avoir obtenu le token
          await Promise.all([fetchDeals(), fetchPipelines()]);
        } else {
          throw new Error('Token non reçu');
        }
      }
      
    } catch (error) {
      console.error('Erreur lors de la configuration:', error);
      setIsZohoConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [showDealDetails, setShowDealDetails] = useState(false);

  const handleDealClick = (deal: Deal) => {
    setSelectedDeal(deal);
    setShowDealDetails(true);
  };

  const closeDealDetails = () => {
    setShowDealDetails(false);
    setSelectedDeal(null);
  };

  // Ajouter un nouvel état pour suivre le stage sélectionné
  const [selectedStageInModal, setSelectedStageInModal] = useState<string>("Analyse des besoins");
  
  const refreshDeals = () => {
    fetchDeals();
  };

  // Add a new state for tracking updates
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStageClick = async (stage: string) => {
    if (!selectedDeal || stage === selectedDeal.Stage) return;
    
    setIsUpdating(true);
    setSelectedStageInModal(stage);
    
    try {
      const accessToken = localStorage.getItem('zoho_access_token');
      if (!accessToken) {
        throw new Error("Token d'accès non trouvé");
      }
      
      const updateData = {
        Stage: stage
      };
      
      const response = await fetch(`https://api-dashboard.harx.ai/api/zoho/leads/${selectedDeal.id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Zoho-oauthtoken ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        throw new Error("Failed to update deal stage");
      }
      
      // Update the local deal data to reflect the change
      const updatedDeal = { ...selectedDeal, Stage: stage };
      setSelectedDeal(updatedDeal);
      
      // Update the deals list
      setDeals(prevDeals => 
        prevDeals.map(deal => 
          deal.id === selectedDeal.id ? updatedDeal : deal
        )
      );
      
      // Refresh deals from the server to get the latest data
      refreshDeals();
      
      // Show success notification
      console.log("Deal updated successfully");
      
    } catch (error: unknown) {
      console.error("Error updating deal:", error);
      if (error instanceof Error && error.message === "Token d'accès non trouvé") {
        setIsZohoConnected(false);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const [showEditForm, setShowEditForm] = useState(false);
  const [editableDeal, setEditableDeal] = useState<Deal | null>(null);

  const handleEditClick = (e: React.MouseEvent, deal: Deal) => {
    e.stopPropagation();  // Empêche le déclenchement du clic sur la ligne
    setEditableDeal(deal);
    setShowEditForm(true);
  };

  const closeEditForm = () => {
    setShowEditForm(false);
    setEditableDeal(null);
  };

  const handleEditFormSubmit = async (e: React.FormEvent, updatedDeal: Deal) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      const accessToken = localStorage.getItem('zoho_access_token');
      if (!accessToken) {
        throw new Error("Token d'accès non trouvé");
      }
      
      const updateData = {
        Deal_Name: updatedDeal.Deal_Name,
        Amount: updatedDeal.Amount,
        Probability: updatedDeal.Probability,
        Stage: updatedDeal.Stage,
      };
      
      const response = await fetch(`https://api-dashboard.harx.ai/api/zoho/leads/${updatedDeal.id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Zoho-oauthtoken ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        throw new Error("Failed to update deal");
      }
      
      // Mettre à jour la liste des deals
      setDeals(prevDeals => 
        prevDeals.map(deal => 
          deal.id === updatedDeal.id ? updatedDeal : deal
        )
      );
      
      // Rafraîchir les deals depuis le serveur
      refreshDeals();
      
      closeEditForm();
      console.log("Deal updated successfully");
      
    } catch (error: unknown) {
      console.error("Error updating deal:", error);
      if (error instanceof Error && error.message === "Token d'accès non trouvé") {
        setIsZohoConnected(false);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Ajouter une fonction de déconnexion
  const handleZohoDisconnect = () => {
    localStorage.removeItem('zoho_access_token');
    setIsZohoConnected(false);
    setDeals([]);
    setPipelines([]);
  };

  // Vérifier si Zoho est connecté
  const checkZohoConnection = () => {
    const token = ZohoTokenService.getToken();
    if (!token) {
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (!checkZohoConnection()) {
      setError('Connexion à Zoho CRM requise');
    } else {
      fetchDeals();
    }
  }, []);

  const getStageColor = (forecastType: string) => {
    switch (forecastType) {
      case 'Closed Won':
        return 'bg-green-100 text-green-800';
      case 'Closed Lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // Obtenir les stages de la pipeline sélectionnée
  const getSelectedPipelineStages = () => {
    if (selectedPipeline === 'all') {
      return [];
    }
    return pipelines.find(p => p.id === selectedPipeline)?.maps || [];
  };

  const selectedStages = getSelectedPipelineStages();
  const selectedPipelineData = pipelines.find(p => p.id === selectedPipeline);

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
              <h2 className="text-xl font-semibold">Connexion requise</h2>
            </div>
            <p className="text-gray-600">
              Vous devez vous connecter à Zoho CRM pour accéder aux leads.
            </p>
            <button
              onClick={() => navigate('/integrations')}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
            >
              Se connecter à Zoho CRM
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
            <h2 className="text-xl font-semibold">Deal Management</h2>
          </div>
          <div className="flex gap-2">
            {isZohoConnected && (
              <button
                onClick={handleZohoDisconnect}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Déconnexion Zoho
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
              <h2 className="text-xl font-semibold mb-2">Connectez-vous à Zoho CRM</h2>
              <p className="text-gray-600 max-w-md mb-6">
                Pour accéder à vos deals et gérer vos leads, vous devez d'abord vous connecter à votre compte Zoho CRM.
              </p>
              <button
                onClick={handleZohoConnect}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium flex items-center gap-2 mx-auto"
              >
                <Users className="w-5 h-5" />
                Se connecter à Zoho CRM
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-6 h-6" />
                  <span className="font-medium">Total Deals</span>
                </div>
                <div className="text-3xl font-bold">{deals.length}</div>
                <div className="text-sm text-blue-50 flex items-center gap-1 mt-2">
                  <ArrowUpRight className="w-4 h-4" />
                  12% increase
                </div>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-xl shadow-lg text-white">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5" />
                  <span className="font-medium">Pipeline Value</span>
                </div>
                <div className="text-2xl font-bold">$1.2M</div>
                <div className="text-sm text-emerald-50 flex items-center gap-1">
                  <ArrowUpRight className="w-4 h-4" />
                  8% increase
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-5 h-5" />
                  <span className="font-medium">AI Score</span>
                </div>
                <div className="text-2xl font-bold">85%</div>
                <div className="text-sm text-purple-50 flex items-center gap-1">
                  <ArrowUpRight className="w-4 h-4" />
                  5% increase
                </div>
              </div>
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 rounded-xl shadow-lg text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">Avg Response</span>
                </div>
                <div className="text-2xl font-bold">2.4h</div>
                <div className="text-sm text-amber-50 flex items-center gap-1">
                  <ArrowDownRight className="w-4 h-4" />
                  3% increase
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
                      placeholder="Search..."
                    className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  </div>
                  <button 
                    onClick={() => setShowFilterPanel(!showFilterPanel)}
                    className="p-2 border rounded-lg hover:bg-gray-100 flex items-center gap-1"
                  >
                    <Filter className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-600">Filtres</span>
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {filteredDeals.length} deals found
                  </span>
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
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-purple-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                          </svg>
                        </div>
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
              <table className="w-full">
                <thead>
                  <tr key="header" className="text-left border-b">
                    <th className="pb-3">Deal Details</th>
                    <th className="pb-3">Stage</th>
                    <th className="pb-3">Value</th>
                    <th className="pb-3">AI Insights</th>
                    <th className="pb-3">Last Contact</th>
                    <th className="pb-3">Next Action</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {currentDeals.map((deal) => (
                    <tr 
                      key={deal.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleDealClick(deal)}
                    >
                      <td className="py-3">
                        <div>
                          <div className="font-medium">{deal.Deal_Name}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {deal.Account_Name?.name || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {deal.Contact_Name?.name || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="text-black text-xs font-bold">
                          {deal.Stage}
                        </span>
                      </td>
                      <td className="py-3">
                        <div>
                          <div className="font-medium">
                            {deal.$currency_symbol || "$"}{deal.Amount?.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {deal.Probability}% probability
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Brain className="w-4 h-4 text-purple-600" />
                            <span>
                              Score: {deal.metadata?.ai_analysis?.score || "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Sparkles className="w-4 h-4 text-yellow-600" />
                            <span>
                              {deal.Type || "N/A"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <div>
                          <div className="text-sm">
                            {deal.Modified_Time ? new Date(deal.Modified_Time).toLocaleDateString() : "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">{deal.Owner?.name || "N/A"}</div>
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
                            title="Edit Deal"
                            onClick={(e) => handleEditClick(e, deal)}
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      
      {isZohoConnected && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
          >
            Previous
          </button>
          
          <span className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
          >
            Next
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

      {showDealDetails && selectedDeal && (
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
                    onClick={closeDealDetails}
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
                    className={`${selectedStageInModal === "Analyse des besoins" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"} py-1 px-4 flex items-center relative cursor-pointer`}
                    onClick={() => !isUpdating && handleStageClick("Analyse des besoins")}
                  >
                    <div className={`absolute left-0 top-0 bottom-0 border-l-[12px] border-l-transparent border-t-[15px] border-b-[15px] ${selectedStageInModal === "Qualification" ? "border-t-blue-500 border-b-blue-500" : "border-t-blue-100 border-b-blue-100"} -ml-[12px]`}></div>
                    <span className="text-sm">Analyse des besoins</span>
                    <div className={`absolute right-0 top-0 bottom-0 border-l-[12px] border-l-transparent border-t-[15px] border-b-[15px] ${selectedStageInModal === "Analyse des besoins" ? "border-t-blue-500 border-b-blue-500" : "border-t-gray-100 border-b-gray-100"} ml-[12px] z-10 rotate-180 -mr-[12px]`}></div>
                  </div>
                  <div 
                    className={`${selectedStageInModal === "Négociation" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"} py-1 px-4 flex items-center relative cursor-pointer`}
                    onClick={() => !isUpdating && handleStageClick("Négociation")}
                  >
                    <div className={`absolute left-0 top-0 bottom-0 border-l-[12px] border-l-transparent border-t-[15px] border-b-[15px] ${selectedStageInModal === "Analyse des besoins" ? "border-t-blue-500 border-b-blue-500" : "border-t-gray-100 border-b-gray-100"} -ml-[12px]`}></div>
                    <span className="text-sm">Négociation</span>
                    <div className={`absolute right-0 top-0 bottom-0 border-l-[12px] border-l-transparent border-t-[15px] border-b-[15px] ${selectedStageInModal === "Négociation" ? "border-t-blue-500 border-b-blue-500" : "border-t-gray-100 border-b-gray-100"} ml-[12px] z-10 rotate-180 -mr-[12px]`}></div>
                  </div>
                  <div 
                    className={`${selectedStageInModal === "Proposition/Chiffrage" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"} py-1 px-4 flex items-center relative cursor-pointer`}
                    onClick={() => !isUpdating && handleStageClick("Proposition/Chiffrage")}
                  >
                    <div className={`absolute left-0 top-0 bottom-0 border-l-[12px] border-l-transparent border-t-[15px] border-b-[15px] ${selectedStageInModal === "Négociation" ? "border-t-blue-500 border-b-blue-500" : "border-t-gray-100 border-b-gray-100"} -ml-[12px]`}></div>
                    <span className="text-sm">Proposition/Chiffrage</span>
                    <div className={`absolute right-0 top-0 bottom-0 border-l-[12px] border-l-transparent border-t-[15px] border-b-[15px] ${selectedStageInModal === "Proposition/Chiffrage" ? "border-t-blue-500 border-b-blue-500" : "border-t-gray-100 border-b-gray-100"} ml-[12px] z-10 rotate-180 -mr-[12px]`}></div>
                  </div>
                  <div 
                    className={`${selectedStageInModal === "Proposition commerciale" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"} py-1 px-4 flex items-center relative cursor-pointer`}
                    onClick={() => !isUpdating && handleStageClick("Proposition commerciale")}
                  >
                    <div className={`absolute left-0 top-0 bottom-0 border-l-[12px] border-l-transparent border-t-[15px] border-b-[15px] ${selectedStageInModal === "Proposition/Chiffrage" ? "border-t-blue-500 border-b-blue-500" : "border-t-gray-100 border-b-gray-100"} -ml-[12px]`}></div>
                    <span className="text-sm">Proposition commerciale</span>
                    <div className={`absolute right-0 top-0 bottom-0 border-l-[12px] border-l-transparent border-t-[15px] border-b-[15px] ${selectedStageInModal === "Proposition commerciale" ? "border-t-blue-500 border-b-blue-500" : "border-t-gray-100 border-b-gray-100"} ml-[12px] z-10 rotate-180 -mr-[12px]`}></div>
                  </div>
                  <div 
                    className={`${selectedStageInModal === "Identifiez les décideurs" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"} py-1 px-4 rounded-r-md flex items-center relative cursor-pointer`}
                    onClick={() => !isUpdating && handleStageClick("Identifiez les décideurs")}
                  >
                    <div className={`absolute left-0 top-0 bottom-0 border-l-[12px] border-l-transparent border-t-[15px] border-b-[15px] ${selectedStageInModal === "Proposition commerciale" ? "border-t-blue-500 border-b-blue-500" : "border-t-gray-100 border-b-gray-100"} -ml-[12px]`}></div>
                    <span className="text-sm">Identifiez les décideurs</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex justify-between items-center text-sm py-3 border-b">
                  <span className="text-gray-500">Deal Owner</span>
                  <span className="font-medium">{selectedDeal.Owner?.name}</span>
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

      {showEditForm && editableDeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Edit className="w-5 h-5 text-blue-600" />
                  Edit Deal
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
              
              <form onSubmit={(e) => handleEditFormSubmit(e, editableDeal)}>
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
                      className={`${editableDeal.Stage === "Qualification" ? "bg-blue-500 text-white" : "bg-blue-100 text-gray-800"} py-1 px-4 rounded-l-md flex items-center cursor-pointer`}
                      onClick={() => setEditableDeal({...editableDeal, Stage: "Qualification"})}
                    >
                      <span className="text-sm">Qualification</span>
                    </div>
                    <div 
                      className={`${editableDeal.Stage === "Analyse des besoins" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"} py-1 px-4 flex items-center relative cursor-pointer`}
                      onClick={() => setEditableDeal({...editableDeal, Stage: "Analyse des besoins"})}
                    >
                      <div className={`absolute left-0 top-0 bottom-0 border-l-[12px] border-l-transparent border-t-[15px] border-b-[15px] ${editableDeal.Stage === "Qualification" ? "border-t-blue-500 border-b-blue-500" : "border-t-blue-100 border-b-blue-100"} -ml-[12px]`}></div>
                      <span className="text-sm">Analyse des besoins</span>
                      <div className={`absolute right-0 top-0 bottom-0 border-l-[12px] border-l-transparent border-t-[15px] border-b-[15px] ${editableDeal.Stage === "Analyse des besoins" ? "border-t-blue-500 border-b-blue-500" : "border-t-gray-100 border-b-gray-100"} ml-[12px] z-10 rotate-180 -mr-[12px]`}></div>
                    </div>
                    <div 
                      className={`${editableDeal.Stage === "Négociation" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"} py-1 px-4 flex items-center relative cursor-pointer`}
                      onClick={() => setEditableDeal({...editableDeal, Stage: "Négociation"})}
                    >
                      <div className={`absolute left-0 top-0 bottom-0 border-l-[12px] border-l-transparent border-t-[15px] border-b-[15px] ${editableDeal.Stage === "Analyse des besoins" ? "border-t-blue-500 border-b-blue-500" : "border-t-gray-100 border-b-gray-100"} -ml-[12px]`}></div>
                      <span className="text-sm">Négociation</span>
                      <div className={`absolute right-0 top-0 bottom-0 border-l-[12px] border-l-transparent border-t-[15px] border-b-[15px] ${editableDeal.Stage === "Négociation" ? "border-t-blue-500 border-b-blue-500" : "border-t-gray-100 border-b-gray-100"} ml-[12px] z-10 rotate-180 -mr-[12px]`}></div>
                    </div>
                    <div 
                      className={`${editableDeal.Stage === "Proposition/Chiffrage" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"} py-1 px-4 flex items-center relative cursor-pointer`}
                      onClick={() => setEditableDeal({...editableDeal, Stage: "Proposition/Chiffrage"})}
                    >
                      <div className={`absolute left-0 top-0 bottom-0 border-l-[12px] border-l-transparent border-t-[15px] border-b-[15px] ${editableDeal.Stage === "Négociation" ? "border-t-blue-500 border-b-blue-500" : "border-t-gray-100 border-b-gray-100"} -ml-[12px]`}></div>
                      <span className="text-sm">Proposition/Chiffrage</span>
                      <div className={`absolute right-0 top-0 bottom-0 border-l-[12px] border-l-transparent border-t-[15px] border-b-[15px] ${editableDeal.Stage === "Proposition/Chiffrage" ? "border-t-blue-500 border-b-blue-500" : "border-t-gray-100 border-b-gray-100"} ml-[12px] z-10 rotate-180 -mr-[12px]`}></div>
                    </div>
                    <div 
                      className={`${editableDeal.Stage === "Proposition commerciale" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"} py-1 px-4 flex items-center relative cursor-pointer`}
                      onClick={() => setEditableDeal({...editableDeal, Stage: "Proposition commerciale"})}
                    >
                      <div className={`absolute left-0 top-0 bottom-0 border-l-[12px] border-l-transparent border-t-[15px] border-b-[15px] ${editableDeal.Stage === "Proposition/Chiffrage" ? "border-t-blue-500 border-b-blue-500" : "border-t-gray-100 border-b-gray-100"} -ml-[12px]`}></div>
                      <span className="text-sm">Proposition commerciale</span>
                      <div className={`absolute right-0 top-0 bottom-0 border-l-[12px] border-l-transparent border-t-[15px] border-b-[15px] ${editableDeal.Stage === "Proposition commerciale" ? "border-t-blue-500 border-b-blue-500" : "border-t-gray-100 border-b-gray-100"} ml-[12px] z-10 rotate-180 -mr-[12px]`}></div>
                    </div>
                    <div 
                      className={`${editableDeal.Stage === "Identifiez les décideurs" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"} py-1 px-4 rounded-r-md flex items-center relative cursor-pointer`}
                      onClick={() => setEditableDeal({...editableDeal, Stage: "Identifiez les décideurs"})}
                    >
                      <div className={`absolute left-0 top-0 bottom-0 border-l-[12px] border-l-transparent border-t-[15px] border-b-[15px] ${editableDeal.Stage === "Proposition commerciale" ? "border-t-blue-500 border-b-blue-500" : "border-t-gray-100 border-b-gray-100"} -ml-[12px]`}></div>
                      <span className="text-sm">Identifiez les décideurs</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Deal Name</label>
                      <input
                        type="text"
                        value={editableDeal.Deal_Name}
                        onChange={(e) => setEditableDeal({...editableDeal, Deal_Name: e.target.value})}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                          {editableDeal.$currency_symbol || "$"}
                        </span>
                        <input
                          type="number"
                          value={editableDeal.Amount}
                          onChange={(e) => setEditableDeal({...editableDeal, Amount: Number(e.target.value)})}
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
                        value={editableDeal.Probability}
                        onChange={(e) => setEditableDeal({...editableDeal, Probability: Number(e.target.value)})}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
                      <input
                        type="text"
                        value={editableDeal.Account_Name?.name || ""}
                        onChange={(e) => setEditableDeal({
                          ...editableDeal,
                          Account_Name: {
                            id: editableDeal.Account_Name?.id || '',
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
