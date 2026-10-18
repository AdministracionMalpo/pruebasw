import { Suspense } from 'react';
import RequireAuth from '@/components/Auth/RequireAuth';
import Header from '@/components/header/header';

/** Igual que Adquisiciones: todo /pages/* exige sesión (RequireAuth) y lleva header + footer */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="boot" />}>
      <RequireAuth>
        <Header>{children}</Header>
      </RequireAuth>
    </Suspense>
  );
}
