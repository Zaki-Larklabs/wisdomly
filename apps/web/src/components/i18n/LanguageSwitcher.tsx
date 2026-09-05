'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useI18n } from '@/i18n/context';
import { Languages, ChevronDown } from 'lucide-react';

export default function LanguageSwitcher() {
  const { locale, setLocale, supportedLocales } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const current = supportedLocales.find(l => l.code === locale);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition">
        <Languages size={14} />
        <span>{current?.flag} {current?.name}</span>
        <ChevronDown size={12} className={`transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-36 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl z-50">
          {supportedLocales.map(l => (
            <button key={l.code} onClick={() => { setLocale(l.code); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium transition ${locale === l.code ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-300 hover:bg-slate-700'}`}>
              <span>{l.flag}</span> {l.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
