import React from 'react';
import {
  Users,
  CheckCircle2,
  Star,
  Filter,
  Table,
  PieChart,
  BarChart2
} from 'lucide-react';

function RepMatchingPanel() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold">Representative Matching</h2>
          </div>
          <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
            Add Representative
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="font-medium">Available</span>
            </div>
            <div className="text-2xl font-bold">12</div>
            <div className="text-sm text-green-600">Online now</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-yellow-600" />
              <span className="font-medium">Top Performers</span>
            </div>
            <div className="text-2xl font-bold">5</div>
            <div className="text-sm text-yellow-600">This month</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Skills Match</span>
            </div>
            <div className="text-2xl font-bold">89%</div>
            <div className="text-sm text-blue-600">Average rate</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Table className="w-5 h-5 text-purple-600" />
              <span className="font-medium">Total Matches</span>
            </div>
            <div className="text-2xl font-bold">234</div>
            <div className="text-sm text-purple-600">This week</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <div className="border rounded-lg overflow-hidden">
              <div className="p-4 bg-gray-50 border-b">
                <h3 className="font-semibold">Available Representatives</h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b bg-gray-50">
                    <th className="p-4">Representative</th>
                    <th className="p-4">Skills</th>
                    <th className="p-4">Success Rate</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[1, 2, 3, 4].map((i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={`https://i.pravatar.cc/32?img=${i + 25}`}
                            alt="Representative"
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <div className="font-medium">Sarah Johnson</div>
                            <div className="text-sm text-gray-500">Senior Rep</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
                            Technical
                          </span>
                          <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-sm">
                            Sales
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Star className="w-5 h-5 text-yellow-500" />
                          <span>98%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-sm">
                          Available
                        </span>
                      </td>
                      <td className="p-4">
                        <button className="px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                          Assign
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Skills Distribution</h3>
                <PieChart className="w-5 h-5 text-gray-400" />
              </div>
              <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                {/* Chart would go here */}
                <span className="text-gray-400">Skills distribution chart</span>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Performance Metrics</h3>
                <BarChart2 className="w-5 h-5 text-gray-400" />
              </div>
              <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                {/* Chart would go here */}
                <span className="text-gray-400">Performance metrics chart</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RepMatchingPanel;