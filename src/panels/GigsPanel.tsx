import React, { useEffect, useState } from "react";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  MapPin,
  Building2,
  Tags,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';
import axios from 'axios';

interface Gig {
  _id: string;
  companyId: string;
  companyName: string;
  title: string;
  description: string;
  industry: string;
  requiredSkills: string[];
  preferredLanguages: string[];
  requiredExperience: number;
  expectedConversionRate: number;
  compensation: {
    base: number;
    commission: number;
  };
  duration: {
    startDate: string;
    endDate: string;
  };
  timezone: string;
  targetRegion: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}


function GigsPanel() {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState<string>("");

  const [gigs, setGigs] = useState<Gig[]>([]);
  const [data, setData] = useState<any[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-600";
      case "assigned":
        return "bg-blue-100 text-blue-600";
      case "completed":
        return "bg-gray-100 text-gray-600";
      case "cancelled":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };


  const companyId = import.meta.env.VITE_ENV === 'test' 
    ? '681a448d2c1ca099fe2b17a4'
    : Cookies.get('userId');
console.log('Stored userId:', companyId);

  const fetchCompanyDetails = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL_COMPANY}/companies/${companyId}`
      );
      setCompanyName(response.data.data.name);
    } catch (err) {
      setError("Erreur lors du chargement des détails de l'entreprise.");
    }
  };

  const fetchGigsByUserId = async () => {
    try {
      const userId = Cookies.get('userId');
      console.log("UserId :", userId);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL_GIGS}/user/${userId}`);
      if (!response.ok) {
        throw new Error("Error fetching user gigs");
      }
      const data = await response.json();
      console.log("Data", data);
      
      const validGigs = data.data

      setGigs(validGigs);
    } catch (error) {
      setError("Impossible de récupérer les gigs de l'utilisateur.");
      console.error("Erreur complète:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyDetails();
  }, [companyId]);

  useEffect(() => {
      fetchGigsByUserId();
  }, [companyId]);

  const handleEdit = (gig: Gig) => {
    console.log("Édition du gig:", gig);
    if (!gig._id) {
      console.error("ID du gig manquant");
      return;
    }
    navigate(`/gigs/${gig._id}?action=edit`);
  };

  const handleDelete = async (gigId: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL_GIGS}/gigs/${gigId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete gig');
        }

        setGigs(gigs.filter(gig => gig._id !== gigId));
        
        Swal.fire(
          'Deleted!',
          'The gig has been deleted.',
          'success'
        );
      } catch (error) {
        console.error("Error deleting gig:", error);
        Swal.fire(
          'Error!',
          'Failed to delete the gig.',
          'error'
        );
      }
    }
  };

  const handleShow = (gig: Gig) => {
    navigate(`/gigs/${gig._id}?action=show`);
  };

  const filteredGigs = gigs.filter(gig => {
    if (activeFilter === "available") {
      const endDate = new Date(gig.duration?.endDate || '');
      const now = new Date();
      return endDate > now;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Briefcase className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Gig Management</h2>
              {companyName && (
                <p className="text-sm text-gray-500">Company: {companyName}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => (window.location.href = "/app6")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Gig
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Active Gigs</span>
            </div>
            <div className="text-2xl font-bold">24</div>
            <div className="text-sm text-green-600 flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" />
              12% increase
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="font-medium">Revenue</span>
            </div>
            <div className="text-2xl font-bold">$45,250</div>
            <div className="text-sm text-green-600 flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" />
              8% increase
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <span className="font-medium">Avg Duration</span>
            </div>
            <div className="text-2xl font-bold">4.2m</div>
            <div className="text-sm text-red-600 flex items-center gap-1">
              <ArrowDownRight className="w-4 h-4" />
              3% decrease
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-purple-600" />
              <span className="font-medium">Rating</span>
            </div>
            <div className="text-2xl font-bold">4.8</div>
            <div className="text-sm text-green-600 flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" />
              5% increase
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search gigs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <Filter className="w-5 h-5 text-gray-400" />
          </div>

          <div className="flex gap-2">
            {["all", "available"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-lg ${
                  activeFilter === filter
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-3">Gig Details</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Rate</th>
                <th className="pb-3">Duration</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Skills</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filteredGigs && filteredGigs.length > 0 ? (
                filteredGigs.map((gig) => (
                  <tr key={gig._id} className="hover:bg-gray-50">
                    <td className="py-3">
                      <div>
                        <div className="font-medium text-gray-900">
                          {gig?.title || 'Sans titre'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {gig?.companyName || 'Entreprise inconnue'}
                        </div>
                        <div className="text-sm text-gray-600 max-w-md">
                          {gig?.description || 'Aucune description disponible'}
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100">
                        <span className="text-sm font-medium text-gray-800 capitalize">
                          {gig?.industry || 'Non spécifié'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1 text-gray-900">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        {gig?.compensation?.base 
                          ? `$${gig.compensation.base.toLocaleString()}`
                          : 'Non spécifié'
                        }
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {gig.duration?.startDate && gig.duration?.endDate 
                          ? `${new Date(gig.duration.startDate).toLocaleDateString()} - ${new Date(gig.duration.endDate).toLocaleDateString()}`
                          : 'Not specified'}
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(gig.status || 'unknown')}`}>
                        {gig.status || 'unknown'}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1">
                        {gig.requiredSkills?.map((skill) => (
                          <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            {skill}
                          </span>
                        )) || 'No skills specified'}
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleShow(gig)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          title="View Details"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEdit(gig)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(gig._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">
                    No gigs available.
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
}

export default GigsPanel;
