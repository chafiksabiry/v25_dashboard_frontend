import React, { useEffect, useState } from "react";
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

interface Gig {
  id: string;
  title: string;
  client: string;
  location: string;
  category: "onsite" | "remote" | "hybrid";
  rate: number;
  duration: string;
  status: "available" | "assigned" | "completed" | "cancelled";
  skills: string[];
  startDate: string;
  endDate: string;
}

const mockGigs: Gig[] = [
  {
    id: "1",
    title: "Customer Service Representative",
    client: "TechCorp Inc",
    location: "New York, NY",
    category: "onsite",
    rate: 25,
    duration: "3 months",
    status: "available",
    skills: ["Phone Support", "Email Support", "CRM"],
    startDate: "2024-02-15",
    endDate: "2024-05-15",
  },
  {
    id: "2",
    title: "Technical Support Specialist",
    client: "Global Solutions Ltd",
    location: "San Francisco, CA",
    category: "hybrid",
    rate: 35,
    duration: "6 months",
    status: "assigned",
    skills: ["Hardware", "Software", "Networking"],
    startDate: "2024-02-01",
    endDate: "2024-08-01",
  },
  {
    id: "3",
    title: "Call Center Team Lead",
    client: "Support Masters",
    location: "Chicago, IL",
    category: "onsite",
    rate: 40,
    duration: "12 months",
    status: "available",
    skills: ["Team Management", "Quality Assurance", "Training"],
    startDate: "2024-03-01",
    endDate: "2025-03-01",
  },
];

function GigsPanel() {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewGigModal, setShowNewGigModal] = useState(false);

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "remote":
        return <Building2 className="w-4 h-4" />;
      case "onsite":
        return <MapPin className="w-4 h-4" />;
      case "hybrid":
        return <Users className="w-4 h-4" />;
      default:
        return null;
    }
  };

  useEffect(() => {
    const fetchGigs = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL_GIGS}/gigs`);
        if (!response.ok)
          throw new Error("Erreur lors de la récupération des gigs");
        const data = await response.json();

        console.log(data.data[0].title);
        setGigs(data.data);
      } catch (error) {
        setError("Impossible de récupérer les gigs.");
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGigs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Briefcase className="w-6 h-6 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold">Gig Management</h2>
          </div>
          <button
            onClick={() => setShowNewGigModal(true)}
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
            {["all", "available", "assigned", "completed"].map((filter) => (
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
              {gigs && gigs.length > 0 ? (
                gigs.map((gig) => (
                  <tr key={gig.id} className="hover:bg-gray-50">
                    <td className="py-3">
                      <div>
                        <div className="font-medium">{gig.title}</div>
                        {/* <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {gig.client}
                        </div> */}
                        {/* <div className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {gig.location}
                        </div> */}
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        {/* {getTypeIcon(gig.type)} */}
                        <span className="capitalize">{gig.category}</span>
                      </div>
                    </td>
                    {/* <td className="py-3">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {gig.rate}/hr
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {gig.duration}
                      </div>
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                          gig.status
                        )}`}
                      >
                        {gig.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1">
                        {gig.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </td> */}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">
                    Aucun gig disponible.
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
