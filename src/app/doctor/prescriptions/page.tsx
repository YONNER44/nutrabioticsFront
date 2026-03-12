'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import AppShell from '@/components/AppShell';
import RouteGuard from '@/components/RouteGuard';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import Pagination from '@/components/Pagination';
import api from '@/lib/api';
import { Prescription, PaginatedResponse } from '@/lib/types';

const navItems = [{ href: '/doctor/prescriptions', label: 'Prescripciones' }];

function DoctorPrescriptionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<PaginatedResponse<Prescription> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const page = Number(searchParams.get('page') ?? 1);
  const status = searchParams.get('status') ?? '';
  const from = searchParams.get('from') ?? '';
  const to = searchParams.get('to') ?? '';

  const fetchPrescriptions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '10',
        ...(status && { status }),
        ...(from && { from }),
        ...(to && { to }),
      });
      const { data: res } = await api.get(`/prescriptions?${params}`);
      setData(res);
    } catch {
      toast.error('Error al cargar prescripciones');
    } finally {
      setIsLoading(false);
    }
  }, [page, status, from, to]);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set('page', '1');
    router.push(`/doctor/prescriptions?${params.toString()}`);
  };

  return (
    <RouteGuard allowedRoles={['doctor']}>
      <AppShell navItems={navItems} title="Médico">
        <div className="space-y-6 stagger-children">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Mis Prescripciones</h1>
            <Link
              href="/doctor/prescriptions/new"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva Prescripción
            </Link>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex flex-wrap items-end gap-3">
              <select
                value={status}
                onChange={(e) => updateFilter('status', e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
              >
                <option value="">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="consumed">Consumida</option>
              </select>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500 px-1">Desde</label>
                <div className="relative">
                  <input
                    type="date"
                    value={from}
                    onChange={(e) => updateFilter('from', e.target.value)}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white w-full"
                  />
                  {!from && (
                    <span className="absolute inset-0 flex items-center px-3 text-sm text-gray-400 pointer-events-none select-none">
                      dd/mm/aaaa
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500 px-1">Hasta</label>
                <div className="relative">
                  <input
                    type="date"
                    value={to}
                    onChange={(e) => updateFilter('to', e.target.value)}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white w-full"
                  />
                  {!to && (
                    <span className="absolute inset-0 flex items-center px-3 text-sm text-gray-400 pointer-events-none select-none">
                      dd/mm/aaaa
                    </span>
                  )}
                </div>
              </div>
              {(status || from || to) && (
                <button
                  onClick={() => router.push('/doctor/prescriptions')}
                  className="text-sm text-gray-500 hover:text-red-600 underline"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : !data?.data.length ? (
            <EmptyState message="Sin prescripciones" description="Crea una nueva prescripción para un paciente." />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-scale-in">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Código</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Paciente</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Estado</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Ítems</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Fecha</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.data.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-mono text-blue-700 font-medium">{p.code}</td>
                        <td className="py-3 px-4 text-gray-800">{p.patient.user.name}</td>
                        <td className="py-3 px-4"><StatusBadge status={p.status} /></td>
                        <td className="py-3 px-4 text-gray-500">{p.items.length} ítem(s)</td>
                        <td className="py-3 px-4 text-gray-500">
                          {new Date(p.createdAt).toLocaleDateString('es-CO')}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/doctor/prescriptions/${p.id}`}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Ver
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-gray-100 py-2">
                <Pagination
                  page={page}
                  totalPages={data.totalPages}
                  onPageChange={(p) => updateFilter('page', String(p))}
                />
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </RouteGuard>
  );
}

export default function DoctorPrescriptionsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>}>
      <DoctorPrescriptionsContent />
    </Suspense>
  );
}
