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
} from "lucide-react";

export default function CompanyProfilePanel() {
  const [company, setCompany] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState<Record<string, any>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

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
    setTempValues((prev) => ({
      ...prev,
      [field]: getNestedValue(company, field) || "",
    }));
  };

  const handleCancel = () => {
    setEditingField(null);
    setTempValues({});
  };

  const handleApplyChanges = (field: string) => {
    setCompany((prev) => ({
      ...prev,
      [field]: tempValues[field],
    }));
    setEditingField(null);
    setTempValues({});
    setHasChanges(true);
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
      icon: <Building2 className="w-5 h-5" />,
    },
    {
      key: "industry",
      label: "Industry",
      icon: <Building2 className="w-5 h-5" />,
    },
    {
      key: "overview",
      label: "Overview",
      icon: <Building2 className="w-5 h-5" />,
    },
    {
      key: "mission",
      label: "Mission",
      icon: <Building2 className="w-5 h-5" />,
    },
    {
      key: "contact.email",
      label: "Email",
      icon: <Mail className="w-5 h-5" />,
    },
    {
      key: "contact.phone",
      label: "Phone",
      icon: <Phone className="w-5 h-5" />,
    },
    {
      key: "contact.address",
      label: "Address",
      icon: <MapPin className="w-5 h-5" />,
    },
    {
      key: "contact.website",
      label: "Website",
      icon: <Globe className="w-5 h-5" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold">Company Profile</h2>
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

        <div className="space-y-6">
          {fields.map((field) => (
            <div key={field.key} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  {field.icon}
                  <span className="font-medium">{field.label}</span>
                </div>
                {editingField === field.key ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApplyChanges(field.key)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleCancel}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEdit(field.key)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                )}
              </div>
              <div className="mt-2 text-gray-800">
                {editingField === field.key ? (
                  <input
                    type="text"
                    value={tempValues[field.key] || ""}
                    onChange={(e) =>
                      setTempValues((prev) => ({
                        ...prev,
                        [field.key]: e.target.value,
                      }))
                    }
                    className="border rounded-lg p-2 w-full"
                  />
                ) : (
                  String(getNestedValue(company, field.key) || "Not set")
                )}
              </div>
            </div>
          ))}

          <div className="flex justify-end pt-6 border-t">
            <button
              onClick={handleSaveAll}
              disabled={!hasChanges}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save All Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
