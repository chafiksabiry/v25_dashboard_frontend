import React, { ReactNode, useEffect, useState } from "react";
import {
  Users,
  Search,
  Filter,
  Plus,
  Upload,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Brain,
  Clock,
  Building2,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

function DealManagementPanel() {
  interface Deal {
    Deal_Name: ReactNode;
    id: string;
    name: string;
    company: string;
    status: string;
    value: number;
    Email_1: string;
    Telephony: string;
    Location: string;
    Stage: string;
    metadata?: {
      ai_analysis?: {
        score?: string;
      };
    };
    updated_at?: string;
  }

  const [deals, setDeals] = useState<Deal[]>([]);


  const fetchDeals = async () => {
    let accessToken = localStorage.getItem("zoho_access_token");
    if (!accessToken) {
        window.location.href = `${import.meta.env.VITE_API_URL}/zoho/auth`;
        return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/zoho/deals`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des deals");
      }

      const result = await response.json();
      const fetchedDeals = result.data.data;
      console.log("Deals récupérés :", fetchedDeals);

      // Afficher les deals un par un avec un délai
      for (let i = 0; i < fetchedDeals.length; i++) {
        setTimeout(() => {
          setDeals((prevDeals) => [...prevDeals, fetchedDeals[i]]);
        }, i * 1000); // délai de 1 seconde (1000 ms) entre chaque deal
      }
    } catch (error) {
      console.error("Erreur :", error);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold" onClick={fetchDeals}>
              Deal Management
            </h2>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Import Deals
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<Users className="w-5 h-5 text-blue-600" />}
            title="Total Deals"
            value={deals.length}
            trend="12% increase"
            trendColor="text-green-600"
          />
          <StatCard
            icon={<DollarSign className="w-5 h-5 text-green-600" />}
            title="Total Value"
            value={`$${deals
              .reduce((total, deal) => total + (deal.value || 0), 0)
              .toLocaleString()}`}
            trend="8% increase"
            trendColor="text-green-600"
          />
          <StatCard
            icon={<Brain className="w-5 h-5 text-purple-600" />}
            title="AI Score"
            value="85%"
            trend="5% increase"
            trendColor="text-green-600"
          />
          <StatCard
            icon={<Clock className="w-5 h-5 text-yellow-600" />}
            title="Avg Response"
            value="2.4h"
            trend="3% decrease"
            trendColor="text-red-600"
          />
        </div>

        {/* Tableau des deals */}
        <div className="overflow-x-auto max-h-screen border border-gray-200 rounded-lg shadow-lg">
          <table className="w-full text-sm text-gray-700">
            <thead className="sticky top-0 bg-gray-100">
              <tr className="text-left border-b">
                <th className="py-3 px-4 font-medium text-gray-600">
                  Deal Details
                </th>
                <th className="py-3 px-4 font-medium text-gray-600 text-center">
                  Stage
                </th>
                <th className="py-3 px-4 font-medium text-gray-600 text-center">
                  Value
                </th>
                <th className="py-3 px-4 font-medium text-gray-600 text-center">
                  AI Insights
                </th>
                <th className="py-3 px-4 font-medium text-gray-600 text-center">
                  Last Contact
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {deals.map((deal) => (
                <tr
                  key={deal.id}
                  className="hover:bg-gray-50 transition duration-300"
                >
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        {deal.Deal_Name || "N/A"}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        {deal.Location || "N/A"}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Phone className="w-4 h-4 text-gray-500" />
                        {deal.Telephony || "123-456-7890"}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Mail className="w-4 h-4 text-gray-500" />
                        {deal.Email_1 || "abc@gmail.com"}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center text-gray-600">
                    {/* <span className="px-3 py-1 text-xs font-medium"> */}
                      {deal.Stage || "N/A"}
                    {/* </span> */}
                  </td>
                  <td className="py-3 px-4 text-center font-medium text-gray-800">
                    ${deal.value?.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-600">
                    {deal.metadata?.ai_analysis?.score || "N/A"}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-600">
                    {deal.updated_at
                      ? new Date(deal.updated_at).toLocaleDateString()
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  trend: string;
  trendColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  title,
  value,
  trend,
  trendColor,
}) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <span className="font-medium">{title}</span>
    </div>
    <div className="text-2xl font-bold">{value}</div>
    <div className={`text-sm flex items-center gap-1 ${trendColor}`}>
      {trend.includes("increase") ? (
        <ArrowUpRight className="w-4 h-4" />
      ) : (
        <ArrowDownRight className="w-4 h-4" />
      )}
      {trend}
    </div>
  </div>
);

export default DealManagementPanel;
