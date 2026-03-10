'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import AppShell from '@/components/AppShell';
import RouteGuard from '@/components/RouteGuard';
import api from '@/lib/api';

const navItems = [{ href: '/doctor/prescriptions', label: 'Prescripciones' }];

interface ItemForm {
  name: string;
  dosage: string;
  quantity: string;
  instructions: string;
}

interface Patient {
  id: string;
  email: string;
  name: string;
  patient: { id: string };
}

const emptyItem = (): ItemForm => ({ name: '', dosage: '', quantity: '', instructions: '' });

export default function NewPrescriptionPage() {
  const router = useRouter();
  const [patientId, setPatientId] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<ItemForm[]>([emptyItem()]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    api.get('/patients?limit=100').then(({ data }) => setPatients(data.data)).catch(() => {});
  }, []);

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (i: number) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  };
  const updateItem = (i: number, field: keyof ItemForm, value: string) => {
    setItems((prev) => prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) { toast.error('Selecciona un paciente'); return; }
    if (items.some((it) => !it.name.trim())) { toast.error('Todos los ítems deben tener nombre'); return; }

    setIsSubmitting(true);
    try {
      const payload = {
        patientId,
        notes: notes || undefined,
        items: items.map((it) => ({
          name: it.name,
          dosage: it.dosage || undefined,
          quantity: it.quantity ? Number(it.quantity) : undefined,
          instructions: it.instructions || undefined,
        })),
      };
      const { data } = await api.post('/prescriptions', payload);
      toast.success('Prescripción creada exitosamente');
      router.push(`/doctor/prescriptions/${data.id}`);
    } catch {
      toast.error('Error al crear la prescripción');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RouteGuard allowedRoles={['doctor']}>
      <AppShell navItems={navItems} title="Médico">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Nueva Prescripción</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 stagger-children">
            {/* Patient */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-800 mb-4">Paciente</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar paciente *</label>
                <select
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">— Seleccionar —</option>
                  {patients.map((p) => (
                    <option key={p.patient.id} value={p.patient.id}>
                      {p.name} ({p.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas (opcional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Indicaciones generales..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800">Ítems prescritos</h2>
                <button
                  type="button"
                  onClick={addItem}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Agregar ítem
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-4 bg-gray-50 relative">
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(i)}
                        className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Ítem {i + 1}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Nombre del producto *</label>
                        <input
                          value={item.name}
                          onChange={(e) => updateItem(i, 'name', e.target.value)}
                          required
                          placeholder="ej. Amoxicilina 500mg"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Dosis</label>
                        <input
                          value={item.dosage}
                          onChange={(e) => updateItem(i, 'dosage', e.target.value)}
                          placeholder="ej. 1 cada 8h"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Cantidad (unidades)</label>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => updateItem(i, 'quantity', e.target.value)}
                          placeholder="ej. 21"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Instrucciones</label>
                        <input
                          value={item.instructions}
                          onChange={(e) => updateItem(i, 'instructions', e.target.value)}
                          placeholder="ej. Después de comer"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2.5 rounded-lg transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
              >
                {isSubmitting ? 'Creando...' : 'Crear Prescripción'}
              </button>
            </div>
          </form>
        </div>
      </AppShell>
    </RouteGuard>
  );
}
