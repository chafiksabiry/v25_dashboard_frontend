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

   
      </div>
    </div>
  );
}

export default RepMatchingPanel;