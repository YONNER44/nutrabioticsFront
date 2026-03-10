import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import StatusBadge from '@/components/StatusBadge';

describe('StatusBadge', () => {
  it('muestra "Pendiente" para el estado pending', () => {
    render(<StatusBadge status="pending" />);
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
  });

  it('muestra "Consumida" para el estado consumed', () => {
    render(<StatusBadge status="consumed" />);
    expect(screen.getByText('Consumida')).toBeInTheDocument();
  });

  it('aplica clase de color amarillo para pending', () => {
    render(<StatusBadge status="pending" />);
    const badge = screen.getByText('Pendiente');
    expect(badge.className).toContain('yellow');
  });

  it('aplica clase de color verde para consumed', () => {
    render(<StatusBadge status="consumed" />);
    const badge = screen.getByText('Consumida');
    expect(badge.className).toContain('green');
  });
});
