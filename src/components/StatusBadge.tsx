interface BadgeProps {
  status: 'pending' | 'consumed';
}

const config = {
  pending: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  consumed: { label: 'Consumida', className: 'bg-green-100 text-green-800 border-green-200' },
};

export default function StatusBadge({ status }: BadgeProps) {
  const { label, className } = config[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}>
      {label}
    </span>
  );
}
