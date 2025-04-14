import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

import {
  Building2,
  MapPin,
  Globe,
  Phone,
  Mail,
  CheckCircle2,
  Pencil,
  X,
  Save,
  AlertCircle,
  Target,
  Heart,
  Coffee,
  Trophy,
  Award,
  Users,
  Rocket,
  Briefcase,
  GraduationCap,
  Code,
  Edit2,
  Upload,
  Calendar,
  Factory,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  ArrowRight,
  FileText
} from "lucide-react";
import Cookies from 'js-cookie';


function CompanyProfilePanel() {
  const navigate = useNavigate();
  const [company, setCompany] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState<Record<string, any>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [showUniquenessPanel, setShowUniquenessPanel] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentField, setCurrentField] = useState<any>(null);

  // Récupérer l'ID de l'entreprise depuis localStorage
  const userConfig = localStorage.getItem('user_config');
  const companyId = userConfig ? JSON.parse(userConfig).clientId : null;
  console.log('Stored user config:', userConfig);

  useEffect(() => {
    if (!userConfig) {
      // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
      navigate('/login');
      return;
    }

    if (companyId) {
      fetchCompanyDetails();
    }
  }, [companyId, userConfig, navigate]);

  // Helper functions for the new UI
  const hasContactInfo = company.contact && (
    company.contact.email || 
    company.contact.phone || 
    company.contact.website || 
    company.contact.address
  );

  const hasSocialMedia = company.socialMedia && (
    company.socialMedia.linkedin || 
    company.socialMedia.twitter || 
    company.socialMedia.facebook || 
    company.socialMedia.instagram
  );

  const hasLocation = company.location && (
    company.location.lat && 
    company.location.lng
  );

  const getGoogleMapsUrl = () => {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    if (company.contact?.address) {
      const encodedAddress = encodeURIComponent(company.contact.address);
      return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodedAddress}`;
    }
    if (hasLocation) {
      return `https://www.google.com/maps/embed/v1/view?key=YOUR_API_KEY&center=${company.location.lat},${company.location.lng}&zoom=15`;
    }
    return undefined;
  };

  const getGoogleMapsDirectionsUrl = () => {
    if (company.contact?.address) {
      const encodedAddress = encodeURIComponent(company.contact.address);
      return `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
    }
    if (hasLocation) {
      return `https://www.google.com/maps/dir/?api=1&destination=${company.location.lat},${company.location.lng}`;
    }
    return null;
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoUrl(e.target.value);
  };

  // EditableField component
  const EditableField = ({ 
    value, 
    field, 
    icon: Icon, 
    className = ""
  }: { 
    value: any; 
    field: string; 
    icon?: React.ElementType; 
    className?: string;
  }) => {
    const isEditing = editingField === field && editMode;
    
    const handleFieldEdit = () => {
      if (editMode) {
        setEditingField(field);
        setTempValues((prev) => ({
          ...prev,
          [field]: getNestedValue(company, field) || "",
        }));
      }
    };
    
    const handleFieldSave = () => {
      handleApplyChanges(field);
    };
    
    const handleFieldCancel = () => {
      setEditingField(null);
      setTempValues((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    };
    
    return (
      <div className={`relative ${className}`} onClick={handleFieldEdit}>
        {Icon && !isEditing && <Icon size={18} className="flex-shrink-0" />}
        
        {isEditing ? (
          <div className="mt-2 w-full">
            <input
              type="text"
              value={tempValues[field] || ""}
              onChange={(e) =>
                setTempValues((prev) => ({
                  ...prev,
                  [field]: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
            <div className="absolute right-0 top-full mt-2 flex gap-2">
              <button
                onClick={handleFieldSave}
                className="p-1.5 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                <CheckCircle2 size={14} />
              </button>
              <button
                onClick={handleFieldCancel}
                className="p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ) : (
          <>
            <span>{value || "Not set"}</span>
            {editMode && (
              <button
                className="absolute -right-3 -top-3 opacity-0 group-hover:opacity-100 p-1 bg-white rounded-full shadow-md text-gray-600 hover:text-indigo-600 transition-all"
                onClick={() => handleFieldEdit()}
              >
                <Pencil size={12} />
              </button>
            )}
          </>
        )}
      </div>
    );
  };

  const fetchCompanyDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL_COMPANY}/companies/${companyId}`
      );
      setCompany(response.data.data);
      if (response.data.data.logoUrl) {
        setLogoUrl(response.data.data.logoUrl);
      }
    } catch (err) {
      setError("Erreur lors du chargement des détails de company.");
      console.error('Error fetching company details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (field: string) => {
    setEditingField(field);
    setCurrentField(field);
    setIsModalOpen(true);
    setTempValues((prev) => ({
      ...prev,
      [field]: getNestedValue(company, field) || "",
    }));
  };

  const handleCancel = () => {
    setEditingField(null);
    setTempValues({});
    setIsModalOpen(false);
  };

  const handleApplyChanges = (field: string) => {
    if (field.includes('.')) {
      const parts = field.split('.');
      setCompany((prev) => {
        const newCompany = { ...prev };
        let current = newCompany;
        
        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) {
            current[parts[i]] = {};
          }
          current = current[parts[i]];
        }
        
        current[parts[parts.length - 1]] = tempValues[field];
        return newCompany;
      });
    } else {
      setCompany((prev) => ({
        ...prev,
        [field]: tempValues[field],
      }));
    }
    
    setEditingField(null);
    setIsModalOpen(false);
    setHasChanges(true);
  };

  const getNestedValue = (obj: Record<string, any>, path: string) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  const handleSaveAll = async () => {
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL_COMPANY}/companies/${companyId}`,
        company
      );
      setHasChanges(false);
      setSaveSuccess(true);

      // Afficher un popup SweetAlert2 pour indiquer le succès
      Swal.fire({
        title: "Success!",
        text: "Company profile updated successfully.",
        icon: "success",
        confirmButtonText: "Ok",
      });

      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Erreur lors de la sauvegarde :", err);
      Swal.fire({
        title: "Error!",
        text: "There was an error updating the company profile.",
        icon: "error",
        confirmButtonText: "Try Again",
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{company.name || 'Company Profile'}</h1>
          <button
            onClick={() => setEditMode(!editMode)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            {editMode ? 'Cancel Edit' : 'Edit Profile'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Company Information</h2>
            <div className="space-y-4">
              <EditableField
                value={company.name}
                field="name"
                icon={Building2}
              />
              <EditableField
                value={company.contact?.email}
                field="contact.email"
                icon={Mail}
              />
              <EditableField
                value={company.contact?.phone}
                field="contact.phone"
                icon={Phone}
              />
              <EditableField
                value={company.contact?.website}
                field="contact.website"
                icon={Globe}
              />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Location</h2>
            <div className="space-y-4">
              <EditableField
                value={company.contact?.address}
                field="contact.address"
                icon={MapPin}
              />
              {company.contact?.address && (
                <div className="mt-4">
                  <iframe
                    src={getGoogleMapsUrl()}
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {hasChanges && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSaveAll}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CompanyProfilePanel;