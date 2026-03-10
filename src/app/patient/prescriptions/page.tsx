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

const navItems = [{ href: '/patient/prescriptions', label: 'Mis Prescripciones' }];

function PatientPrescriptionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<PaginatedResponse<Prescription> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [consumingId, setConsumingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const page = Number(searchParams.get('page') ?? 1);
  const status = searchParams.get('status') ?? '';

  const fetchPrescriptions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '10',
        ...(status && { status }),
      });
      const { data: res } = await api.get(`/me/prescriptions?${params}`);
      setData(res);
    } catch {
      toast.error('Error al cargar prescripciones');
    } finally {
      setIsLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set('page', '1');
    router.push(`/patient/prescriptions?${params.toString()}`);
  };

  const handleConsume = async (id: string) => {
    setConsumingId(id);
    try {
      await api.put(`/prescriptions/${id}/consume`);
      toast.success('Prescripción marcada como consumida');
      fetchPrescriptions();
    } catch {
      toast.error('Error al marcar como consumida');
    } finally {
      setConsumingId(null);
    }
  };

  const handleDownload = async (prescription: Prescription) => {
    setDownloadingId(prescription.id);
    try {
      const response = await api.get(`/prescriptions/${prescription.id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `prescription-${prescription.code}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Error al descargar el PDF');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <RouteGuard allowedRoles={['patient']}>
      <AppShell navItems={navItems} title="Paciente">
        <div className="space-y-6 stagger-children">
          <h1 className="text-2xl font-bold text-gray-900">Mis Prescripciones</h1>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex flex-wrap gap-3">
              <select
                value={status}
                onChange={(e) => updateFilter('status', e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
              >
                <option value="">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="consumed">Consumida</option>
              </select>
              {status && (
                <button
                  onClick={() => router.push('/patient/prescriptions')}
                  className="text-sm text-gray-500 hover:text-red-600 underline"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : !data?.data.length ? (
            <EmptyState message="Sin prescripciones" description="Aún no tienes prescripciones asignadas." />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4">
                {data.data.map((p) => (
                  <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-200 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono text-blue-700 font-semibold">{p.code}</span>
                          <StatusBadge status={p.status} />
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          Dr. {p.author.user.name}
                          {p.author.specialty && ` — ${p.author.specialty}`}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(p.createdAt).toLocaleDateString('es-CO', {
                            year: 'numeric', month: 'long', day: 'numeric',
                          })}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{p.items.length} ítem(s)</p>
                      </div>

                      <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                        <Link
                          href={`/patient/prescriptions/${p.id}`}
                          className="text-sm border border-gray-300 hover:border-blue-300 text-gray-700 hover:text-blue-700 px-3 py-1.5 rounded-lg transition-colors text-center"
                        >
                          Ver detalle
                        </Link>
                        <button
                          onClick={() => handleDownload(p)}
                          disabled={downloadingId === p.id}
                          className="text-sm border border-gray-300 hover:border-green-300 text-gray-700 hover:text-green-700 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          {downloadingId === p.id ? 'Descargando...' : 'Descargar PDF'}
                        </button>
                        {p.status === 'pending' && (
                          <button
                            onClick={() => handleConsume(p.id)}
                            disabled={consumingId === p.id}
                            className="text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-1.5 rounded-lg transition-colors"
                          >
                            {consumingId === p.id ? 'Procesando...' : 'Marcar consumida'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Pagination
                page={page}
                totalPages={data.totalPages}
                onPageChange={(p) => updateFilter('page', String(p))}
              />
            </>
          )}
        </div>
      </AppShell>
    </RouteGuard>
  );
}

export default function PatientPrescriptionsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>}>
      <PatientPrescriptionsContent />
    </Suspense>
  );
}
