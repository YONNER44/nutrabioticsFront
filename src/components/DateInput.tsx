'use client';

import { useRef } from 'react';

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function DateInput({
  value,
  onChange,
  placeholder = 'dd/mm/aaaa',
  className = '',
}: DateInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const formatDisplay = (isoDate: string) => {
    if (!isoDate) return null;
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  };

  const openPicker = () => {
    const el = inputRef.current;
    if (!el) return;
    if (typeof el.showPicker === 'function') {
      el.showPicker();
    } else {
      el.click();
    }
  };

  return (
    <div
      className={`relative cursor-pointer text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-blue-500 flex items-center ${className}`}
      onClick={openPicker}
    >
      <span className={value ? 'text-gray-900' : 'text-gray-400 select-none'}>
        {value ? formatDisplay(value) : placeholder}
      </span>
      {/* Calendar icon */}
      <svg
        className="ml-auto w-4 h-4 text-gray-400 flex-shrink-0 pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      {/* Hidden native input covers the whole area */}
      <input
        ref={inputRef}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
        style={{ colorScheme: 'light' }}
      />
    </div>
  );
}
