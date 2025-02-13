import React, { useState, useRef } from 'react';
import {
  Building2,
  MapPin,
  Globe,
  Phone,
  Mail,
  Upload,
  X,
  Save,
  Clock,
  AlertCircle,
  CheckCircle2,
  Link
} from 'lucide-react';
import { useSettings } from '../hooks/useSettings';

function CompanyProfilePanel() {
  const { settings, loading, saving, error: settingsError, updateSettings } = useSettings();
  const [profile, setProfile] = useState({
    company_name: settings?.company_name || '',
    company_logo: settings?.company_logo || '',
    website: settings?.website || '',
    phone: settings?.phone || '',
    email: settings?.email || '',
    address: settings?.address || '',
    city: settings?.city || '',
    state: settings?.state || '',
    country: settings?.country || '',
    postal_code: settings?.postal_code || '',
    industry: settings?.industry || '',
    description: settings?.description || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!profile.company_name) {
      newErrors.company_name = 'Company name is required';
    }
    
    if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    if (profile.website && !/^https?:\/\//.test(profile.website)) {
      newErrors.website = 'Website must start with http:// or https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = async (file: File) => {
    try {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setErrors(prev => ({
          ...prev,
          company_logo: 'Image must be less than 2MB'
        }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({
          ...prev,
          company_logo: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Failed to process image:', err);
      setErrors(prev => ({
        ...prev,
        company_logo: 'Failed to process image'
      }));
    }
  };

  const handleSave = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      await updateSettings(profile);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save company profile:', err);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
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
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold">Company Profile</h2>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center gap-2"
          >
            {saving ? (
              <>
                <Clock className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>

        {settingsError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{settingsError.message}</span>
          </div>
        )}

        {saveSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-600">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>Company profile saved successfully</span>
          </div>
        )}

        <div className="grid grid-cols-3 gap-6">
          {/* Logo Upload */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Logo
            </label>
            {profile.company_logo ? (
              <div className="relative w-full aspect-square mb-4">
                <img
                  src={profile.company_logo}
                  alt="Company Logo"
                  className="w-full h-full object-contain rounded-lg border"
                />
                <button
                  onClick={() => setProfile(prev => ({ ...prev, company_logo: '' }))}
                  className="absolute -top-2 -right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50"
              >
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Upload Logo</span>
                <span className="text-xs text-gray-400 mt-1">PNG, JPG, SVG (max 2MB)</span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleImageUpload(file);
                }
              }}
            />
            {errors.company_logo && (
              <p className="mt-1 text-sm text-red-500">{errors.company_logo}</p>
            )}
          </div>

          {/* Company Details */}
          <div className="col-span-2 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={profile.company_name}
                  onChange={e => setProfile(prev => ({ ...prev, company_name: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter company name"
                />
                {errors.company_name && (
                  <p className="mt-1 text-sm text-red-500">{errors.company_name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Industry
                </label>
                <input
                  type="text"
                  value={profile.industry}
                  onChange={e => setProfile(prev => ({ ...prev, industry: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter industry"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={profile.description}
                onChange={e => setProfile(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter company description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <div className="flex items-center">
                  <Globe className="w-5 h-5 text-gray-400 mr-2" />
                  <input
                    type="url"
                    value={profile.website}
                    onChange={e => setProfile(prev => ({ ...prev, website: e.target.value }))}
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com"
                  />
                </div>
                {errors.website && (
                  <p className="mt-1 text-sm text-red-500">{errors.website}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-2" />
                  <input
                    type="email"
                    value={profile.email}
                    onChange={e => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="contact@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-2" />
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={e => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                  <input
                    type="text"
                    value={profile.address}
                    onChange={e => setProfile(prev => ({ ...prev, address: e.target.value }))}
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123 Business St"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={profile.city}
                  onChange={e => setProfile(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={profile.state}
                  onChange={e => setProfile(prev => ({ ...prev, state: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="State"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={profile.postal_code}
                  onChange={e => setProfile(prev => ({ ...prev, postal_code: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="12345"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={profile.country}
                  onChange={e => setProfile(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Country"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyProfilePanel;