'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import AppShell from '@/components/AppShell';
import RouteGuard from '@/components/RouteGuard';
import api from '@/lib/api';
import { Metrics } from '@/lib/types';

const navItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/prescriptions', label: 'Prescripciones' },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        ...(from && { from }),
        ...(to && { to }),
      });
      const { data } = await api.get(`/admin/metrics?${params}`);
      setMetrics(data);
    } catch {
      toast.error('Error al cargar métricas');
    } finally {
      setIsLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const byDayReversed = metrics?.byDay ? [...metrics.byDay].reverse() : [];

  const pieData = metrics
    ? Object.entries(metrics.byStatus).map(([key, value]) => ({
        name: key === 'pending' ? 'Pendiente' : 'Consumida',
        value,
      }))
    : [];

  return (
    <RouteGuard allowedRoles={['admin']}>
      <AppShell navItems={navItems} title="Admin">
        <div className="space-y-6 stagger-children">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            {/* Date filters */}
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative">
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                />
                {!from && (
                  <span className="absolute inset-0 flex items-center px-3 text-sm text-gray-400 pointer-events-none select-none">
                    dd/mm/aaaa
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-400">—</span>
              <div className="relative">
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                />
                {!to && (
                  <span className="absolute inset-0 flex items-center px-3 text-sm text-gray-400 pointer-events-none select-none">
                    dd/mm/aaaa
                  </span>
                )}
              </div>
              {(from || to) && (
                <button
                  onClick={() => { setFrom(''); setTo(''); }}
                  className="text-sm text-gray-500 hover:text-red-600 underline"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : metrics ? (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <KpiCard
                  label="Médicos"
                  value={metrics.totals.doctors}
                  icon="👨‍⚕️"
                  color="blue"
                />
                <KpiCard
                  label="Pacientes"
                  value={metrics.totals.patients}
                  icon="🧑‍🤝‍🧑"
                  color="green"
                />
                <KpiCard
                  label="Prescripciones"
                  value={metrics.totals.prescriptions}
                  icon="📋"
                  color="purple"
                />
              </div>

              {/* Status cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center text-xl">⏳</div>
                  <div>
                    <p className="text-sm text-yellow-700 font-medium">Pendientes</p>
                    <p className="text-2xl font-bold text-yellow-800">{metrics.byStatus.pending ?? 0}</p>
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-xl">✅</div>
                  <div>
                    <p className="text-sm text-green-700 font-medium">Consumidas</p>
                    <p className="text-2xl font-bold text-green-800">{metrics.byStatus.consumed ?? 0}</p>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bar chart - by day */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
                  <h2 className="font-semibold text-gray-800 mb-4">Prescripciones por día (últimos 30)</h2>
                  {byDayReversed.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-8">Sin datos en el período</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={byDayReversed} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(v) => v.slice(5)}
                          tick={{ fontSize: 11 }}
                          tickLine={false}
                        />
                        <YAxis tick={{ fontSize: 11 }} tickLine={false} />
                        <Tooltip
                          formatter={(v) => [v, 'Prescripciones']}
                          labelFormatter={(l) => `Fecha: ${l}`}
                        />
                        <Bar dataKey="count" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Pie chart - by status */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h2 className="font-semibold text-gray-800 mb-4">Por estado</h2>
                  {pieData.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-8">Sin datos</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart margin={{ top: 20, right: 20, bottom: 0, left: 20 }}>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="55%"
                          innerRadius={55}
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }: { name?: string; percent?: number }) =>
                            `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`
                          }
                          labelLine={true}
                        >
                          {pieData.map((_, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend />
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Top doctors */}
              {metrics.topDoctors.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h2 className="font-semibold text-gray-800 mb-4">Top Médicos por volumen</h2>
                  <div className="space-y-2">
                    {metrics.topDoctors.map((d, i) => (
                      <div key={d.doctorId} className="flex items-center gap-3">
                        <span className="w-6 text-sm font-medium text-gray-500">{i + 1}.</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full flex items-center pl-3"
                            style={{
                              width: `${Math.max((d.count / metrics.topDoctors[0].count) * 100, 10)}%`,
                            }}
                          >
                            <span className="text-xs text-white font-medium">{d.count}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </AppShell>
    </RouteGuard>
  );
}

function KpiCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800',
  };

  return (
    <div className={`rounded-xl border p-5 card-hover cursor-default ${colorMap[color] ?? colorMap.blue}`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-sm font-medium opacity-70">{label}</p>
          <p className="text-3xl font-bold">{value.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
