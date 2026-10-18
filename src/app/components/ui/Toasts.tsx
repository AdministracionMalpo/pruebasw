'use client';
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { Icono } from './Icono';

type Toast = { id: number; texto: string; ok: boolean; saliendo?: boolean };
const Ctx = createContext<(texto: string, ok?: boolean) => void>(() => {});
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [lista, setLista] = useState<Toast[]>([]);
  const n = useRef(0);
  const mostrar = useCallback((texto: string, ok = true) => {
    const id = ++n.current;
    setLista(l => [...l.slice(-2), { id, texto, ok }]);
    setTimeout(() => setLista(l => l.map(t => (t.id === id ? { ...t, saliendo: true } : t))), 3200);
    setTimeout(() => setLista(l => l.filter(t => t.id !== id)), 3500);
  }, []);
  return (
    <Ctx.Provider value={mostrar}>
      {children}
      <div id="toasts" aria-live="polite">
        {lista.map(t => (
          <div key={t.id} className={'toast' + (t.ok ? '' : ' warn') + (t.saliendo ? ' saliendo' : '')} role="status">
            <Icono n={t.ok ? 'check' : 'alert'} s={16} /><span>{t.texto}</span><i className="tbar" />
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
