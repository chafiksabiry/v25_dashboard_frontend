import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

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
  Factory,
  FileText,
  Target,
} from "lucide-react";

function CompanyProfilePanel() {
  const [company, setCompany] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState<Record<string, any>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentField, setCurrentField] = useState<any>(null);

  const companyId = "67b4e7f7eff824909f992c81";

  const fetchCompanyDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL_COMPANY}/companies/${companyId}`
      );
      setCompany(response.data.data);
    } catch (err) {
      setError("Erreur lors du chargement des détails de l'entreprise.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (field: string) => {
    setEditingField(field);
    setCurrentField(fields.find(f => f.key === field));
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
    const fieldParts = field.split('.');
    if (fieldParts.length > 1) {
      setCompany((prev) => ({
        ...prev,
        contact: {
          ...prev.contact,
          [fieldParts[1]]: tempValues[field]
        }
      }));
    } else {
      setCompany((prev) => ({
        ...prev,
        [field]: tempValues[field],
      }));
    }
    setEditingField(null);
    setTempValues({});
    setHasChanges(true);
    setIsModalOpen(false);
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

  const getNestedValue = (obj: Record<string, any>, path: string) => {
    return path.split(".").reduce((acc, key) => acc && acc[key], obj);
  };

  useEffect(() => {
    fetchCompanyDetails();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const fields = [
    {
      key: "name",
      label: "Company Name",
      icon: <Building2 className="w-5 h-5 text-blue-600" />,
    },
    {
      key: "industry",
      label: "Industry",
      icon: <Factory className="w-5 h-5 text-purple-600" />,
    },
    {
      key: "overview",
      label: "Overview",
      icon: <FileText className="w-5 h-5 text-indigo-600" />,
    },
    {
      key: "mission",
      label: "Mission",
      icon: <Target className="w-5 h-5 text-pink-600" />,
    },
    {
      key: "contact.email",
      label: "Email",
      icon: <Mail className="w-5 h-5 text-emerald-600" />,
    },
    {
      key: "contact.phone",
      label: "Phone",
      icon: <Phone className="w-5 h-5 text-cyan-600" />,
    },
    {
      key: "contact.address",
      label: "Address",
      icon: <MapPin className="w-5 h-5 text-rose-600" />,
    },
    {
      key: "contact.website",
      label: "Website",
      icon: <Globe className="w-5 h-5 text-teal-600" />,
    },
  ];

  return (
    <>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-xl shadow-lg p-6 border border-purple-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg shadow-md">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-indigo-900 tracking-wide font-sans">Company Profile</h2>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>Company profile saved successfully</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div key={field.key} 
                className={`border border-gray-200 rounded-lg p-4 
                transition-all duration-300 
                hover:shadow-xl hover:scale-[1.02] bg-white hover:bg-gradient-to-br hover:from-white hover:via-purple-50/70 hover:to-pink-50/70
                ${(field.key === "overview" || field.key === "mission") ? "col-span-1 md:col-span-2" : ""}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-700">
                    <div className="transition-transform duration-300 hover:scale-110">
                      {field.icon}
                    </div>
                    <span className="font-semibold text-indigo-800 tracking-wide">{field.label}</span>
                  </div>
                  <button
                    onClick={() => handleEdit(field.key)}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 hover:shadow-md hover:scale-110 cursor-pointer"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-2 text-gray-800">
                  <p className="font-medium text-gray-700 leading-relaxed">
                    {String(getNestedValue(company, field.key) || 
                      <span className="text-gray-400 italic">Not set</span>)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-6 border-t mt-6">
            <button
              onClick={handleSaveAll}
              disabled={!hasChanges}
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 
              text-white rounded-lg 
              hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 
              hover:shadow-lg hover:scale-105
              disabled:opacity-50 disabled:cursor-not-allowed 
              cursor-pointer
              flex items-center gap-2 
              shadow-md transition-all duration-200 
              font-semibold tracking-wide"
            >
              <Save className="w-5 h-5" />
              Save All Changes
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4 transform transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {currentField?.icon}
                <h3 className="text-lg font-semibold text-gray-900">
                  Edit {currentField?.label}
                </h3>
              </div>
              <button
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4">
              {(currentField?.key === "overview" || currentField?.key === "mission") ? (
                <textarea
                  autoFocus
                  value={tempValues[currentField.key] || ""}
                  onChange={(e) =>
                    setTempValues((prev) => ({
                      ...prev,
                      [currentField.key]: e.target.value,
                    }))
                  }
                  className="border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-lg p-3 w-full outline-none transition-all duration-200 font-medium min-h-[200px]"
                  placeholder={`Enter ${currentField.label}...`}
                />
              ) : (
                <input
                  type="text"
                  value={tempValues[currentField.key] || ""}
                  onChange={(e) =>
                    setTempValues((prev) => ({
                      ...prev,
                      [currentField.key]: e.target.value,
                    }))
                  }
                  className="border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-lg p-3 w-full outline-none transition-all duration-200 font-medium"
                  placeholder={`Enter ${currentField.label}...`}
                />
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApplyChanges(currentField.key)}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 
                text-white rounded-lg hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 
                transition-all duration-200 flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CompanyProfilePanel;
