import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { BarChart3, TrendingUp, Users, CalendarDays, Award } from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';

export function ClinicAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('Quarter');

  const weeklyData = [
    { day: 'Mon', consultations: 24, capacity: 30 },
    { day: 'Tue', consultations: 28, capacity: 30 },
    { day: 'Wed', consultations: 30, capacity: 30 },
    { day: 'Thu', consultations: 26, capacity: 30 },
    { day: 'Fri', consultations: 29, capacity: 30 },
    { day: 'Sat', consultations: 18, capacity: 20 },
  ];

  const specialtyData = [
    { name: 'Cardiology', value: 42, color: '#0f766e' },
    { name: 'General Medicine', value: 38, color: '#14b8a6' },
    { name: 'Pediatrics', value: 24, color: '#0d9488' },
    { name: 'Orthopedics', value: 16, color: '#042f2e' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Clinic Operational Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational appointment volume, specialty distribution, and facility throughput
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {['Week', 'Month', 'Quarter'].map(t => (
            <button
              key={t}
              onClick={() => setTimeRange(t)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                timeRange === t ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Weekly Consultations"
          value="155"
          change="+8.4%"
          changeType="positive"
          icon={CalendarDays}
        />
        <StatCard
          label="Slot Utilization"
          value="91.2%"
          change="+3.1%"
          changeType="positive"
          icon={TrendingUp}
        />
        <StatCard
          label="Avg Patient Rating"
          value="4.9 / 5"
          sublabel="Based on post-visit feedback"
          icon={Award}
        />
        <StatCard
          label="Pre-Intake Compliance"
          value="78%"
          change="+12%"
          changeType="positive"
          icon={Users}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Volume Bar Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Weekly Patient Consultation Volume</h2>
            <span className="text-xs text-slate-400 font-mono">OPD Desk Metrics</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="consultations" name="Completed Consultations" fill="#0f766e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Specialty Distribution Pie Chart */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Volume by Medical Specialty</h2>
            <span className="text-xs text-slate-400 font-mono">Percentage</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={specialtyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {specialtyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
