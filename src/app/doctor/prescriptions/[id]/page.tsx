'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import AppShell from '@/components/AppShell';
import RouteGuard from '@/components/RouteGuard';
import StatusBadge from '@/components/StatusBadge';
import api from '@/lib/api';
import { Prescription } from '@/lib/types';

const navItems = [{ href: '/doctor/prescriptions', label: 'Prescripciones' }];

export default function DoctorPrescriptionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    api.get(`/prescriptions/${id}`)
      .then(({ data }) => setPrescription(data))
      .catch(() => { toast.error('No se pudo cargar la prescripción'); router.back(); })
      .finally(() => setIsLoading(false));
  }, [id, router]);

  const downloadPdf = async () => {
    setIsDownloading(true);
    try {
      const response = await api.get(`/prescriptions/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `prescription-${prescription?.code ?? id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Error al descargar el PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <RouteGuard allowedRoles={['doctor']}>
        <AppShell navItems={navItems} title="Médico">
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        </AppShell>
      </RouteGuard>
    );
  }

  if (!prescription) return null;

  return (
    <RouteGuard allowedRoles={['doctor']}>
      <AppShell navItems={navItems} title="Médico">
        <div className="max-w-2xl space-y-6 stagger-children">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors shadow-sm" title="Volver">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Prescripción</h1>
                <p className="text-sm font-mono text-blue-700">{prescription.code}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={prescription.status} />
              <button
                onClick={downloadPdf}
                disabled={isDownloading}
                className="inline-flex items-center gap-2 text-sm border border-gray-300 hover:border-blue-300 text-gray-700 hover:text-blue-700 px-3 py-1.5 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {isDownloading ? 'Descargando...' : 'Descargar PDF'}
              </button>
            </div>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Paciente</p>
              <p className="font-medium text-gray-900">{prescription.patient.user.name}</p>
              <p className="text-sm text-gray-500">{prescription.patient.user.email}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Fechas</p>
              <p className="text-sm text-gray-700">
                Creada: {new Date(prescription.createdAt).toLocaleDateString('es-CO')}
              </p>
              {prescription.consumedAt && (
                <p className="text-sm text-green-600">
                  Consumida: {new Date(prescription.consumedAt).toLocaleDateString('es-CO')}
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          {prescription.notes && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Notas</p>
              <p className="text-sm text-gray-700">{prescription.notes}</p>
            </div>
          )}

          {/* Items */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Ítems de la prescripción</h2>
            <div className="space-y-3">
              {prescription.items.map((item, i) => (
                <div key={item.id} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{i + 1}. {item.name}</p>
                      <div className="mt-1 space-y-0.5 text-sm text-gray-500">
                        {item.dosage && <p>Dosis: {item.dosage}</p>}
                        {item.quantity !== null && <p>Cantidad: {item.quantity} unidades</p>}
                        {item.instructions && <p>Indicaciones: {item.instructions}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-start">
            <Link
              href="/doctor/prescriptions"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver al listado
            </Link>
          </div>
        </div>
      </AppShell>
    </RouteGuard>
  );
}
