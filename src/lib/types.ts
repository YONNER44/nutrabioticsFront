export type Role = 'admin' | 'doctor' | 'patient';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
  doctor?: { id: string; specialty: string | null } | null;
  patient?: { id: string } | null;
}

export interface PrescriptionItem {
  id: string;
  name: string;
  dosage: string | null;
  quantity: number | null;
  instructions: string | null;
}

export type PrescriptionStatus = 'pending' | 'consumed';

export interface Prescription {
  id: string;
  code: string;
  status: PrescriptionStatus;
  notes: string | null;
  createdAt: string;
  consumedAt: string | null;
  items: PrescriptionItem[];
  patient: { user: { id: string; name: string; email: string } };
  author: { user: { id: string; name: string; email: string }; specialty?: string | null };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Metrics {
  totals: { doctors: number; patients: number; prescriptions: number };
  byStatus: Record<string, number>;
  byDay: { date: string; count: number }[];
  topDoctors: { doctorId: string; count: number }[];
}
