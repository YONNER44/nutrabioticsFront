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
import DateInput from '@/components/DateInput';

const navItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/prescriptions', label: 'Prescripciones' },
  { href: '/admin/users', label: 'Usuarios' },
];

function AdminPrescriptionsContent() {
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
      const { data: res } = await api.get(`/admin/prescriptions?${params}`);
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
    router.push(`/admin/prescriptions?${params.toString()}`);
  };

  return (
    <RouteGuard allowedRoles={['admin']}>
      <AppShell navItems={navItems} title="Admin">
        <div className="space-y-6 stagger-children">
          <h1 className="text-2xl font-bold text-gray-900">Todas las Prescripciones</h1>

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
                <DateInput
                  value={from}
                  onChange={(v) => updateFilter('from', v)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500 px-1">Hasta</label>
                <DateInput
                  value={to}
                  onChange={(v) => updateFilter('to', v)}
                />
              </div>
              {(status || from || to) && (
                <button
                  onClick={() => router.push('/admin/prescriptions')}
                  className="text-sm text-gray-500 hover:text-red-600 underline"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : !data?.data.length ? (
            <EmptyState message="Sin prescripciones" description="No hay prescripciones con los filtros aplicados." />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Código</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Paciente</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Médico</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Estado</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Fecha</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.data.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-mono text-blue-700 font-medium">{p.code}</td>
                        <td className="py-3 px-4 text-gray-800">{p.patient.user.name}</td>
                        <td className="py-3 px-4 text-gray-600">{p.author.user.name}</td>
                        <td className="py-3 px-4"><StatusBadge status={p.status} /></td>
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

export default function AdminPrescriptionsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>}>
      <AdminPrescriptionsContent />
    </Suspense>
  );
}
