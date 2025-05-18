import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface InterestData {
  name: string;
  value: number;
}

interface InterestChartProps {
  data: InterestData[];
}

const InterestChart: React.FC<InterestChartProps> = ({ data }) => {
  // LinkedIn-style colors with a wider palette for more interests
  const colors = [
    '#0a66c2', // LinkedIn blue
    '#70b5f9', // Light blue
    '#057642', // Green
    '#e8a427', // Yellow
    '#c37d16', // Orange
    '#915907', // Brown
    '#5b3d02', // Dark brown
    '#2d1f01', // Darker brown
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Interest Distribution</h2>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={colors[index % colors.length]} 
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#f3f2ef',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              formatter={(value: number) => [`${value}`, 'Count']}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default InterestChart; 