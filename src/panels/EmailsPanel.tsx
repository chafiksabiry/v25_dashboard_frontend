import React, { useState, useEffect } from 'react';
import {
  Mail,
  Inbox,
  Send,
  Clock,
  Archive,
  Filter,
  Calendar,
  Share2,
  X,
  AlertCircle,
  Users
} from 'lucide-react';
import axios from 'axios';
import { ZohoTokenService } from '../services/zohoService';
import { useNavigate } from 'react-router-dom';

interface Email {
  id: string;
  subject: string;
  sender: string;
  receivedTime: string;
  status: string;
  fromAddress: string;
  toAddress?: string;
  summary?: string;
}

function EmailsPanel() {
  const [activeFilter, setActiveFilter] = useState('inbox');
  const [emails, setEmails] = useState<Email[]>([]);
  const [sentEmailsCount, setSentEmailsCount] = useState(0);
  const [inboxCount, setInboxCount] = useState(0);
  const [archivedCount, setArchivedCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [emailForm, setEmailForm] = useState({
    to: '',
    subject: '',
    content: ''
  });
  const navigate = useNavigate();
  const [isZohoConnected, setIsZohoConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isEmailDetailOpen, setIsEmailDetailOpen] = useState(false);

  const fetchEmails = async () => {
    let accessToken = localStorage.getItem("zoho_access_token");
    if (!accessToken) {
        window.location.href = `${import.meta.env.VITE_API_URL}/zoho/auth`;
        return;
    }
    try {
      setLoading(true);
      const endpoints = {
        inbox: '/zoho/emails/inbox',
        sent: '/zoho/emails/sent',
        archived: '/zoho/emails/archived'
      };
      
      const endpoint = endpoints[activeFilter as keyof typeof endpoints] || '/zoho/emails/inbox';
      const response = await axios.get(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.data.success) {
        const emailsData = response.data.data.data;
        const cleanedEmails = (Array.isArray(emailsData) ? emailsData : emailsData.data || []).map((email: Email) => ({
          ...email,
          toAddress: email.toAddress
            ?.replace(/&quot;/g, '"')
            ?.replace(/&lt;/g, '<')
            ?.replace(/&gt;/g, '>')
        }));
        setEmails(cleanedEmails);

        if (activeFilter === 'inbox') {
          setInboxCount(cleanedEmails.length);
          setUnreadCount(cleanedEmails.filter((email: { status: string; }) => email.status === "0").length);
        } else if (activeFilter === 'sent') {
          setSentEmailsCount(cleanedEmails.length);
        } else if (activeFilter === 'archived') {
          setArchivedCount(cleanedEmails.length);
        }
      }
    } catch (err) {
      setError("Erreur lors de la récupération des emails");
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: string | number) => {
    const parsedTime = Number(timestamp); // Assure que c'est bien un nombre
    if (isNaN(parsedTime)) return "Date invalide"; // Gestion des erreurs

    return new Date(parsedTime).toLocaleString();
  };

  const cleanEmailAddress = (email: string = '') => {
    // Décode d'abord tous les caractères HTML
    let cleaned = email
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();

    // Extrait le nom ou l'email
    const matches = cleaned.match(/["']?([^"'<]*?)["']?\s*<(.+?)>/);
    if (matches) {
      // Retourne le nom s'il existe, sinon la partie locale de l'email
      return matches[1].trim() || matches[2].split('@')[0];
    }
    
    // Si pas de format spécial, retourner la partie avant @ ou l'email complet
    return cleaned.split('@')[0];
  };

  const getEmailPart = (email: string) => {
    return email
      ?.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0] // Extrait l'adresse email
      || email;
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implémenter l'envoi d'email
    console.log('Email à envoyer:', emailForm);
    setIsComposeOpen(false);
    setEmailForm({ to: '', subject: '', content: '' });
  };

  const handleReply = (email: Email) => {
    setEmailForm({
      to: email.fromAddress,
      subject: `Re: ${email.subject}`,
      content: `\n\n-------- Original Message --------\nFrom: ${email.sender}\nSubject: ${email.subject}\n`
    });
    setIsComposeOpen(true);
  };

  const handleArchive = async (email: Email) => {
    const accessToken = localStorage.getItem("zoho_access_token");
    if (!accessToken) return;

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/zoho/emails/${email.id}/archive`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      // Rafraîchir les données après l'archivage
      await fetchEmails();
      await fetchAllCounts(); // Mettre à jour tous les compteurs
      
      // Optionnel : Afficher un message de succès
      alert("Email archivé avec succès");
    } catch (err) {
      console.error("Erreur lors de l'archivage:", err);
      setError("Erreur lors de l'archivage de l'email");
      alert("Erreur lors de l'archivage de l'email");
    }
  };

  const handleShare = async (email: Email) => {
    // Créer un lien partageble
    const shareText = `
Sujet: ${email.subject}
De: ${email.sender}
Date: ${formatDate(email.receivedTime)}
    `;
    
    try {
      await navigator.clipboard.writeText(shareText);
      alert("Détails de l'email copiés dans le presse-papier !");
    } catch (err) {
      console.error("Erreur lors de la copie:", err);
      alert("Erreur lors de la copie des détails");
    }
  };

  const handleZohoConnect = async () => {
    try {
      setIsLoading(true);
      
      const configData = {
        clientId: "1000.xxxx", // Remplacer par votre vrai Client ID
        clientSecret: "xxxx", // Remplacer par votre vrai Client Secret
        refreshToken: "xxxx" // Remplacer par votre vrai Refresh Token
      };
      
      console.log("Tentative de configuration avec:", configData);
      
      // Première étape : Configuration
      const configResponse = await fetch('http://localhost:5005/api/zoho/configure', {
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
        const tokenResponse = await fetch('http://localhost:5005/api/zoho/token', {
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
          // Vous pouvez ajouter ici d'autres actions après la connexion réussie
        } else {
          throw new Error('Token non reçu');
        }
      }
      
    } catch (error) {
      console.error('Erreur lors de la configuration:', error);
      setIsZohoConnected(false);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const checkZohoConnection = () => {
    const token = localStorage.getItem('zoho_access_token');
    if (!token) {
      setIsZohoConnected(false);
      return false;
    }
    return true;
  };

  const fetchAllCounts = async () => {
    let accessToken = localStorage.getItem("zoho_access_token");
    if (!accessToken) return;
    
    try {
      const [sentResponse, archivedResponse, inboxResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/zoho/emails/sent`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/zoho/emails/archived`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/zoho/emails/inbox`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
      ]);

      if (sentResponse.data.success) {
        const sentEmails = sentResponse.data.data.data;
        setSentEmailsCount(Array.isArray(sentEmails) ? sentEmails.length : (sentEmails.data || []).length);
      }

      if (archivedResponse.data.success) {
        const archivedEmails = archivedResponse.data.data.data;
        setArchivedCount(Array.isArray(archivedEmails) ? archivedEmails.length : (archivedEmails.data || []).length);
      }

      if (inboxResponse.data.success) {
        const inboxEmails = inboxResponse.data.data.data;
        const cleanedInbox = Array.isArray(inboxEmails) ? inboxEmails : (inboxEmails.data || []);
        setInboxCount(cleanedInbox.length);
        setUnreadCount(cleanedInbox.filter((email: { status: string }) => email.status === "0").length);
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des compteurs:", err);
    }
  };

  const handleDisconnect = () => {
    // Supprimer le token
    localStorage.removeItem('zoho_access_token');
    
    // Réinitialiser les états
    setIsZohoConnected(false);
    setEmails([]);
    setSentEmailsCount(0);
    setInboxCount(0);
    setArchivedCount(0);
    setUnreadCount(0);
    setError(null);
    
    // Rediriger vers la page d'intégrations
    navigate('/integrations');
  };

  const handleEmailClick = (email: Email) => {
    setSelectedEmail(email);
    setIsEmailDetailOpen(true);
  };

  useEffect(() => {
    const token = localStorage.getItem('zoho_access_token');
    console.log("=== Initialisation ===");
    console.log("Token au démarrage:", token ? "Présent" : "Absent");
    
    if (token) {
      console.log("Token value:", token);
      setIsZohoConnected(true);
      fetchAllCounts();
    } else {
      console.log("Aucun token trouvé - Configuration de Zoho");
      setIsZohoConnected(false);
      setIsLoading(false);
      handleZohoConnect();
    }
  }, []);

  useEffect(() => {
    fetchEmails();
  }, [activeFilter]);

  useEffect(() => {
    console.log("Emails actuels:", emails);
    console.log("Loading state:", loading);
    console.log("Error state:", error);
  }, [emails, loading, error]);

  useEffect(() => {
    if (!checkZohoConnection()) {
      navigate('/integrations');
    } else {
      fetchAllCounts();
    }
  }, [navigate]);

  // if (isLoading) {
  //   return (
  //     <div className="flex items-center justify-center h-64">
  //       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  //     </div>
  //   );
  // }

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
              Vous devez vous connecter à Zoho CRM pour accéder aux emails.
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
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      {isComposeOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          onClick={() => setIsComposeOpen(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-800">Compose Email</h3>
              <button 
                onClick={() => setIsComposeOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleSendEmail} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To
                </label>
                <input
                  type="email"
                  value={emailForm.to}
                  onChange={(e) => setEmailForm({...emailForm, to: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="recipient@example.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({...emailForm, subject: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Email subject"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  value={emailForm.content}
                  onChange={(e) => setEmailForm({...emailForm, content: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-48 resize-none"
                  placeholder="Write your message here..."
                  required
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEmailDetailOpen && selectedEmail && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center backdrop-blur-sm"
          onClick={() => setIsEmailDetailOpen(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all p-8 m-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Email Details</h3>
              <button 
                onClick={() => setIsEmailDetailOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <span className="text-sm font-medium text-gray-500">From</span>
                <p className="mt-1 text-gray-800 font-medium">{selectedEmail.sender}</p>
                <p className="text-sm text-gray-600">{selectedEmail.fromAddress}</p>
              </div>

              {selectedEmail.toAddress && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <span className="text-sm font-medium text-gray-500">To</span>
                  <p className="mt-1 text-gray-800">{selectedEmail.toAddress}</p>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg">
                <span className="text-sm font-medium text-gray-500">Subject</span>
                <p className="mt-1 text-gray-800 font-medium">{selectedEmail.subject}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <span className="text-sm font-medium text-gray-500">Date</span>
                <p className="mt-1 text-gray-800">{formatDate(selectedEmail.receivedTime)}</p>
              </div>

              {/* Ajouter la section du contenu de l'email */}
              <div className="bg-white border border-gray-200 p-6 rounded-lg">
                <span className="text-sm font-medium text-gray-500 block mb-3">Message Content</span>
                <div className="prose max-w-none">
                  {selectedEmail.summary ? (
                    <p className="text-gray-800 whitespace-pre-wrap">{selectedEmail.summary}</p>
                  ) : (
                    <p className="text-gray-500 italic">No content available</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    handleReply(selectedEmail);
                    setIsEmailDetailOpen(false);
                  }}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <Mail className="w-4 h-4" />
                  Reply
                </button>
                <button
                  onClick={() => {
                    handleArchive(selectedEmail);
                    setIsEmailDetailOpen(false);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <Archive className="w-4 h-4" />
                  Archive
                </button>
                <button
                  onClick={() => handleShare(selectedEmail)}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-purple-100 rounded-lg transform transition-transform hover:scale-105">
              <Mail className="w-7 h-7 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Email Management</h2>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsComposeOpen(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transform transition-all duration-300 hover:scale-105 hover:shadow-md flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Compose
            </button>
            <button 
              onClick={handleDisconnect}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transform transition-all duration-300 hover:scale-105 hover:shadow-md flex items-center gap-2"
            >
              Déconnexion
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-xl hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-3">
              <Inbox className="w-6 h-6 text-blue-600" />
              <span className="font-semibold text-blue-800">Inbox</span>
            </div>
            <div className="text-3xl font-bold text-blue-800">{inboxCount}</div>
            <div className="text-sm font-medium text-blue-600">
              {unreadCount} unread
            </div>
          </div>
          <div className="bg-green-50 p-6 rounded-xl hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-3">
              <Send className="w-6 h-6 text-green-600" />
              <span className="font-semibold text-green-800">Sent</span>
            </div>
            <div className="text-3xl font-bold text-green-800">{sentEmailsCount}</div>
            <div className="text-sm font-medium text-green-600">Total sent</div>
          </div>
          <div className="bg-yellow-50 p-6 rounded-xl hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-6 h-6 text-yellow-600" />
              <span className="font-semibold text-yellow-800">Average Response</span>
            </div>
            <div className="text-3xl font-bold text-yellow-800">2.4h</div>
            <div className="text-sm font-medium text-yellow-600">Last 7 days</div>
          </div>
          <div className="bg-gray-50 p-6 rounded-xl hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-3">
              <Archive className="w-6 h-6 text-gray-600" />
              <span className="font-semibold text-gray-800">Archived</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">{archivedCount}</div>
            <div className="text-sm font-medium text-gray-600">Total</div>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <button
            className={`px-6 py-3 rounded-lg transition-all duration-300 flex items-center gap-2 ${
              activeFilter === 'inbox'
                ? 'bg-purple-600 text-white shadow-md transform scale-105'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow'
            }`}
            onClick={() => setActiveFilter('inbox')}
          >
            <Inbox className="w-4 h-4" />
            Inbox
          </button>
          <button
            className={`px-6 py-3 rounded-lg transition-all duration-300 flex items-center gap-2 ${
              activeFilter === 'sent'
                ? 'bg-purple-600 text-white shadow-md transform scale-105'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow'
            }`}
            onClick={() => setActiveFilter('sent')}
          >
            Sent
          </button>
          <button
            className={`px-6 py-3 rounded-lg transition-all duration-300 flex items-center gap-2 ${
              activeFilter === 'archived'
                ? 'bg-purple-600 text-white shadow-md transform scale-105'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow'
            }`}
            onClick={() => setActiveFilter('archived')}
          >
            Archived
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full">
            <thead>
              <tr className="text-left bg-gray-50">
                <th className="px-6 py-4 font-semibold text-gray-600">{activeFilter === 'sent' ? 'To' : 'From'}</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Subject</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Time</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center">
                    Chargement des emails...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : emails.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center">
                    Aucun email trouvé
                  </td>
                </tr>
              ) : (
                emails.map((email, i) => (
                  <tr key={i} 
                      className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                      onClick={() => handleEmailClick(email)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://i.pravatar.cc/32?img=${i + 2}`}
                          alt={activeFilter === 'sent' ? 'Recipient' : 'Sender'}
                          className="w-10 h-10 rounded-full ring-2 ring-gray-100"
                        />
                        <div>
                          <div className="font-medium text-gray-800">
                            {activeFilter === 'sent' ? cleanEmailAddress(email.toAddress) : email.sender}
                          </div>
                          <div className="text-sm text-gray-500">
                            {activeFilter === 'sent' ? getEmailPart(email.toAddress || '') : email.fromAddress}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{email.subject}</td>
                    <td className="px-6 py-4 text-gray-600">{formatDate(email.receivedTime)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        email.status === "0" 
                          ? "bg-yellow-100 text-yellow-700" 
                          : "bg-green-100 text-green-700"
                      }`}>
                        {email.status === "0" ? "Unread" : "Read"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          className="p-2 hover:bg-purple-100 rounded-lg transition-colors duration-200"
                          onClick={() => handleReply(email)}
                          title="Répondre"
                        >
                          <Mail className="w-5 h-5 text-purple-600" />
                        </button>
                        <button 
                          className="p-2 hover:bg-purple-100 rounded-lg transition-colors duration-200"
                          onClick={() => handleArchive(email)}
                          title="Archiver"
                        >
                          <Archive className="w-5 h-5 text-purple-600" />
                        </button>
                        <button 
                          className="p-2 hover:bg-purple-100 rounded-lg transition-colors duration-200"
                          onClick={() => handleShare(email)}
                          title="Partager"
                        >
                          <Share2 className="w-5 h-5 text-purple-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default EmailsPanel;