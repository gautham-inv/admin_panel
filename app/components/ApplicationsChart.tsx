"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ApplicationsChartProps {
  data: {
    month: string;
    applications: number;
  }[];
}

export default function ApplicationsChart({ data }: ApplicationsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="month" 
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          }}
          labelStyle={{ color: '#111827', fontWeight: 'bold' }}
        />
        <Line 
          type="monotone" 
          dataKey="applications" 
          stroke="#005C89" 
          strokeWidth={3}
          dot={{ fill: '#005C89', r: 4 }}
          activeDot={{ r: 6, fill: '#66C2E2' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}