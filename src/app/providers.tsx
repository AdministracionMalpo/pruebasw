'use client';
import { NextUIProvider } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { ThemeProvider } from './contexts/ThemeContext';
import { PermisosProvider, UserProvider } from './contexts/UserContext';
import { ToastProvider } from './components/ui/Toasts';

/** Mismo orden de proveedores que Adquisiciones: Tema > Usuario > Permisos */
export default function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <NextUIProvider navigate={router.push} locale="es-CL">
      <ThemeProvider>
        <UserProvider>
          <PermisosProvider>
            <ToastProvider>{children}</ToastProvider>
          </PermisosProvider>
        </UserProvider>
      </ThemeProvider>
    </NextUIProvider>
  );
}
